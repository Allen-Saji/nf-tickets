use anchor_lang::prelude::*;

use crate::states::Manager;

#[derive(Accounts)]
pub struct SetupManager<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = Manager::INIT_SPACE,
        seeds = [b"manager", signer.key().as_ref()],
        bump,
    )]
    pub manager: Account<'info, Manager>,
    pub system_program: Program<'info, System>,
}

impl<'info> SetupManager<'info> {
    pub fn setup_manager(&mut self, bump: u8) -> Result<()> {
        self.manager.set_inner(Manager {
            bump,
        });
        Ok(())
    }
}