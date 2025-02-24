use anchor_lang::prelude::*;

#[account]
pub struct Platform {
    pub admin: Pubkey,
    pub fee: u16,
    pub platform_name: String,
    pub treasury_bump: u8,
    pub rewards_bump: u8,
    pub bump: u8,
}

impl Space for Platform {
    const INIT_SPACE: usize = 8 + 32 + 2 + (4 + 32) + 1 + 1 + 1;
}

