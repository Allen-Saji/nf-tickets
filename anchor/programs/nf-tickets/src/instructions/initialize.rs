use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::states::Platform;
use crate::errors::NameError;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    admin: Signer<'info>,
    #[account(
        init,
        space = Platform::INIT_SPACE,
        payer = admin,
        seeds = [b"platform", name.as_str().as_bytes()],
        bump
    )]
    platform: Box<Account<'info, Platform>>,
    #[account(
        init,
        seeds = [b"rewards", platform.key().as_ref()],
        bump,
        payer = admin,
        mint::decimals = 6,
        mint::authority = platform,
    )]
    rewards_mint: Box<InterfaceAccount<'info, Mint>>,
    
    #[account(
        mut,
        seeds = [b"treasury", platform.key().as_ref()],
        bump,
    )]
    treasury: SystemAccount<'info>,
    system_program: Program<'info, System>,
    token_program: Interface<'info, TokenInterface>,
}

impl<'info> Initialize<'info> {
    pub fn init(&mut self, name: String, fee: u16, bumps: &InitializeBumps) -> Result<()> {
    
        require!(name.len() > 0 && name.len() < 33, NameError::NameTooLong);
        self.platform.set_inner(Platform {
            admin: self.admin.key(),
            fee,
            platform_name: name,
            bump: bumps.platform,
            treasury_bump: bumps.treasury,
            rewards_bump: bumps.rewards_mint,
        });

        Ok(())
    }
}