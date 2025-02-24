use anchor_lang::prelude::*;
use mpl_core::{
    ID as MPL_CORE_ID,
    accounts::{BaseAssetV1, BaseCollectionV1},
    types::{UpdateAuthority, Plugin, PermanentFreezeDelegate, ExternalPluginAdapterKey, PluginAuthority},
    instructions::{WriteExternalPluginAdapterDataV1CpiBuilder, UpdatePluginV1CpiBuilder},
    fetch_external_plugin_adapter_data_info,
};

use crate::states::Manager;
use crate::errors::TicketError;

#[derive(Accounts)]
pub struct ScanTicket<'info> {
   pub owner: Signer<'info>,
   pub signer: Signer<'info>,
   #[account(mut)]
   pub payer: Signer<'info>,
   #[account(
        seeds = [b"manager", artist.key().as_ref()],
        bump = manager.bump
   )]
   pub manager: Account<'info, Manager>,
   #[account(
       mut,
       constraint = ticket.owner == owner.key(),
       constraint = ticket.update_authority == UpdateAuthority::Collection(event.key()),
   )]
   pub ticket: Account<'info, BaseAssetV1>,
   #[account(
       mut,
       constraint = event.update_authority == manager.key(),
   )]
   pub event: Account<'info, BaseCollectionV1>,
   pub system_program: Program<'info, System>,
   #[account(address = MPL_CORE_ID)]
   /// CHECK: This is checked by the address constraint
   pub mpl_core_program: UncheckedAccount<'info>,
   /// CHECK: This is not dangerous because we don't read or write from this account
   pub artist: UncheckedAccount<'info>
}

impl<'info> ScanTicket<'info> {
    pub fn scan_ticket(&self) -> Result<()> {
        // Check if the ticket has already been scanned
        let (_, app_data_length) = fetch_external_plugin_adapter_data_info::<BaseAssetV1>(
            &self.ticket.to_account_info(), 
            None, 
            &ExternalPluginAdapterKey::AppData(
                PluginAuthority::Address { address: self.signer.key() }
            )
        )?;
    
        require!(app_data_length == 0, TicketError::TicketAlreadyScanned);
    
        // Prepare data to mark the ticket as scanned
        let data: Vec<u8> = "Scanned".as_bytes().to_vec();
    
        // Write the "Scanned" data to the ticket
        WriteExternalPluginAdapterDataV1CpiBuilder::new(&self.mpl_core_program.to_account_info())
            .asset(&self.ticket.to_account_info())
            .collection(Some(&self.event.to_account_info()))
            .payer(&self.payer.to_account_info())
            .system_program(&self.system_program.to_account_info())
            .key(ExternalPluginAdapterKey::AppData(PluginAuthority::Address { address: self.signer.key() }))
            .data(data)
            .invoke()?;

        let signer_key = self.artist.key();
        let signer_seeds = &[
            b"manager",
            signer_key.as_ref(),
            &[self.manager.bump]
        ];
    
        // Update the plugin to freeze the ticket
        UpdatePluginV1CpiBuilder::new(&self.mpl_core_program.to_account_info())
            .asset(&self.ticket.to_account_info())
            .collection(Some(&self.event.to_account_info()))
            .payer(&self.payer.to_account_info())
            .authority(Some(&self.manager.to_account_info()))
            .system_program(&self.system_program.to_account_info())
            .plugin(Plugin::PermanentFreezeDelegate(PermanentFreezeDelegate { frozen: true }))
            .invoke_signed(&[signer_seeds])?;
    
        Ok(())
    }
}