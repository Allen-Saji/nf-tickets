use anchor_lang::prelude::*;

use crate::states::Platform;

#[derive(Accounts)]
pub struct WithdrawFromTreasury<'info> {
    #[account(mut)]
pub admin: Signer<'info>,
    #[account(
        seeds = [b"platform", platform.platform_name.as_bytes()],
        bump = platform.bump,
        has_one = admin
    )]
pub platform: Account<'info, Platform>,
    #[account(
        mut,
        seeds = [b"treasury", platform.key().as_ref()],
        bump = platform.treasury_bump,
    )]
pub treasury: SystemAccount<'info>,
pub system_program: Program<'info, System>,
}

impl<'info> WithdrawFromTreasury<'info> {
    pub fn withdraw_from_treasury(&self, amount: u64) -> Result<()> {
        let platform_key = self.platform.key();
        let seeds = &[
            b"treasury",
            platform_key.as_ref(),
            &[self.platform.treasury_bump],
        ];
        let signer_seeds = &[&seeds[..]];
    
        // Transfer funds from treasury to admin
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: self.treasury.to_account_info(),
                    to: self.admin.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;
    
        Ok(())
    }
}

