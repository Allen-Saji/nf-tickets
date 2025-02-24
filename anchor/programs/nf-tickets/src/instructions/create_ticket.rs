use anchor_lang::prelude::*;
use mpl_core::{
    fetch_plugin,
    ID as MPL_CORE_ID,
    accounts::BaseCollectionV1,
    instructions::CreateV2CpiBuilder,
    types::{
        Attribute, Plugin, PluginAuthority, PluginAuthorityPair, Attributes,
        PermanentFreezeDelegate, PermanentBurnDelegate, PermanentTransferDelegate,
        ExternalPluginAdapterInitInfo, AppDataInitInfo, ExternalPluginAdapterSchema
    },
    types::PluginType,
};
use anchor_lang::system_program::{Transfer, transfer};

use crate::states::Manager;
use crate::states::Platform;
use crate::errors::TicketError;

#[derive(Accounts)]
pub struct CreateTicket<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    #[account(
        seeds = [b"manager", artist.key().as_ref()],
        bump = manager.bump
    )]
    pub manager: Account<'info, Manager>,
    #[account(
        seeds = [b"platform", platform.platform_name.as_str().as_bytes()],
        bump = platform.bump,
    )]
    platform: Box<Account<'info, Platform>>,
    #[account(
        mut,
        constraint = event.update_authority == manager.key(),
    )]
    pub event: Account<'info, BaseCollectionV1>,
    #[account(mut)]
    pub ticket: Signer<'info>,
    #[account(
        mut,
        seeds = [b"treasury", platform.key().as_ref()],
        bump = platform.treasury_bump,
    )]
    pub treasury: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
    #[account(address = MPL_CORE_ID)]
    /// CHECK: This is checked by the address constraint
    pub mpl_core_program: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub artist: UncheckedAccount<'info>
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateTicketArgs {
    pub name: String,
    pub uri: String,
    pub price: u64,
    pub venue_authority: Pubkey,
    pub screen: Option<String>,
    pub row: Option<String>,
    pub seat: Option<String>,
}

impl<'info> CreateTicket<'info> {
    pub fn create_ticket(&self, args: CreateTicketArgs) -> Result<()> {
        // Check that the maximum number of tickets has not been reached yet
        let (_, collection_attribute_list, _) = fetch_plugin::<BaseCollectionV1, Attributes>(
                &self.event.to_account_info(), 
                PluginType::Attributes
            )?;
    
        // Search for the Capacity attribute
        let capacity_attribute = collection_attribute_list
            .attribute_list
            .iter()
            .find(|attr| attr.key == "Capacity")
            .ok_or(TicketError::MissingCapacityAttribute)?;
    
        // Unwrap the Capacity attribute value
        let capacity = capacity_attribute
            .value
            .parse::<u32>()
            .map_err(|_| TicketError::NumericalOverflow)?;
    
        require!(
            self.event.num_minted < capacity, 
            TicketError::MaximumTicketsReached
        );

        let price = args.price;

        // Transfer funds from buyer to platform treasury using Anchor's transfer
        let transfer_cpi = Transfer {
            from: self.payer.to_account_info(),
            to: self.treasury.to_account_info(),
        };

        transfer(CpiContext::new(self.system_program.to_account_info(), transfer_cpi), price)?;

        // Add an Attribute Plugin that will hold the ticket details
        let mut ticket_plugin: Vec<PluginAuthorityPair> = vec![];
        
        let mut attribute_list: Vec<Attribute> = vec![
            Attribute { 
                key: "Ticket Number".to_string(), 
                value: self.event.num_minted.checked_add(1).ok_or(TicketError::NumericalOverflow)?.to_string()
            },
            Attribute { 
                key: "Price".to_string(), 
                value: args.price.to_string() 
            }
        ];
        
        // Add Row attribute if provided
        if let Some(row) = args.row {
            attribute_list.push(Attribute {
                key: "Row".to_string(),
                value: row,
            });
        }

        // Add Seat attribute if provided
        if let Some(seat) = args.seat {
            attribute_list.push(Attribute {
                key: "Seat".to_string(),
                value: seat,
            });
        }

        // Add Screen attribute if provided
        if let Some(screen) = args.screen {
            attribute_list.push(Attribute {
                key: "Screen".to_string(),
                value: screen,
            });
        }
        
        ticket_plugin.push(
            PluginAuthorityPair { 
                plugin: Plugin::Attributes(Attributes { attribute_list }), 
                authority: Some(PluginAuthority::UpdateAuthority ) 
            }
        );

        let is_ticket_transferable = collection_attribute_list
            .attribute_list
            .iter()
            .find(|attr| attr.key == "IsTicketTransferable")
            .map(|attr| attr.value.to_lowercase() == "true")
            .unwrap_or(false);
        
        ticket_plugin.push(
            PluginAuthorityPair { 
                plugin: Plugin::PermanentFreezeDelegate(PermanentFreezeDelegate { frozen: !is_ticket_transferable }), 
                authority: Some(PluginAuthority::UpdateAuthority) 
            }
        );
        
        ticket_plugin.push(
            PluginAuthorityPair { 
                plugin: Plugin::PermanentBurnDelegate(PermanentBurnDelegate {}), 
                authority: Some(PluginAuthority::UpdateAuthority) 
            }
        );
        
        ticket_plugin.push(
            PluginAuthorityPair { 
                plugin: Plugin::PermanentTransferDelegate(PermanentTransferDelegate {}), 
                authority: Some(PluginAuthority::UpdateAuthority) 
            }
        );
    
        let mut ticket_external_plugin: Vec<ExternalPluginAdapterInitInfo> = vec![];
        
        ticket_external_plugin.push(ExternalPluginAdapterInitInfo::AppData(
            AppDataInitInfo {
                init_plugin_authority: Some(PluginAuthority::UpdateAuthority),
                data_authority: PluginAuthority::Address{ address: args.venue_authority },
                schema: Some(ExternalPluginAdapterSchema::Binary),
            }
        ));
    
        let signer_key = self.artist.key();
    
        let signer_seeds = &[
            b"manager",
            signer_key.as_ref(),
            &[self.manager.bump]
        ];
    
        // Create the Ticket
        CreateV2CpiBuilder::new(&self.mpl_core_program.to_account_info())
            .asset(&self.ticket.to_account_info())
            .collection(Some(&self.event.to_account_info()))
            .payer(&self.payer.to_account_info())
            .authority(Some(&self.manager.to_account_info()))
            .owner(Some(&&self.payer.to_account_info()))
            .system_program(&self.system_program.to_account_info())
            .name(args.name)
            .uri(args.uri)
            .plugins(ticket_plugin)
            .external_plugin_adapters(ticket_external_plugin)
            .invoke_signed(&[signer_seeds])?;
    
        Ok(())
    }
}