use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};
use anchor_spl::{token_interface::{Mint, TokenAccount, TokenInterface, CloseAccount, close_account, transfer_checked, TransferChecked}, associated_token::AssociatedToken};

use crate::states::{Platform, Listing};

#[derive(Accounts)]
pub struct PurchaseResale<'info> {
    #[account(mut)]
    taker: Signer<'info>,
    #[account(mut)]
    maker: SystemAccount<'info>,
    ticket_mint: InterfaceAccount<'info, Mint>,
    #[account(
        seeds = [b"platform", platform.platform_name.as_str().as_bytes()],
        bump,
    )]
    platform: Box<Account<'info, Platform>>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = ticket_mint,
        associated_token::authority = taker,
    )]
    taker_ata: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::authority = listing,
        associated_token::mint = ticket_mint,
    )]
    vault: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        seeds = [b"rewards", platform.key().as_ref()],
        bump = platform.rewards_bump,
        mint::decimals = 6,
        mint::authority = platform,
    )]
    rewards: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        mut,
        close = maker,
        seeds = [platform.key().as_ref(), ticket_mint.key().as_ref()],
        bump = listing.bump,
    )]
    listing: Box<Account<'info, Listing>>,
    #[account(
        seeds = [b"treasury", platform.key().as_ref()],
        bump = platform.treasury_bump,
    )]
    treasury: SystemAccount<'info>,
    associated_token_program: Program<'info, AssociatedToken>,
    system_program: Program<'info, System>,
    token_program: Interface<'info, TokenInterface>,
}

impl<'info> PurchaseResale<'info> {
    pub fn send_sol(&self) -> Result<()> {
        let accounts = Transfer {
            from: self.taker.to_account_info(),
            to: self.maker.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.system_program.to_account_info(), accounts);

        let amount = self.listing.price
            .checked_mul(self.platform.fee as u64).unwrap()
            .checked_div(10000).unwrap();

        transfer(cpi_ctx, self.listing.price - amount)?;

        let accounts = Transfer {
            from: self.taker.to_account_info(),
            to: self.treasury.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.system_program.to_account_info(), accounts);

        transfer(cpi_ctx, amount)
    }

    pub fn send_nft(&mut self) -> Result<()> {
        let seeds = &[
            &self.platform.key().to_bytes()[..],
            &self.ticket_mint.key().to_bytes()[..],
            &[self.listing.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.taker_ata.to_account_info(),
            authority: self.listing.to_account_info(),
            mint: self.ticket_mint.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        transfer_checked(cpi_ctx, 1, self.ticket_mint.decimals)
    }

    pub fn close_mint_vault(&mut self) -> Result<()> {
        let seeds = &[
            &self.platform.key().to_bytes()[..],
            &self.ticket_mint.key().to_bytes()[..],
            &[self.listing.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.listing.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            signer_seeds
        );

        close_account(cpi_ctx)
    }
}