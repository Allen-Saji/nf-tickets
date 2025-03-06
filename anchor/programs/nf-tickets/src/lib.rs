use anchor_lang::prelude::*;

declare_id!("1Vw6q8hdnGaQpk7StB4qRcbYUiTr52w1vqjfmTMFhac");
   

pub mod instructions;
pub mod states;
pub mod errors;

pub use instructions::*;
pub use errors::*;

#[program]
pub mod nf_tickets {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>,  name: String, fee: u16) -> Result<()> {
        ctx.accounts.init(name, fee, &ctx.bumps)
    }

    pub fn setup_manager(ctx: Context<SetupManager>) -> Result<()> {
        ctx.accounts.setup_manager(ctx.bumps.manager)
    }

    pub fn create_event(ctx: Context<CreateEvent>, args: CreateEventArgs) -> Result<()> {
        ctx.accounts.create_event(args)
    }

    pub fn create_ticket(ctx: Context<CreateTicket>, args: CreateTicketArgs) -> Result<()> {
        ctx.accounts.create_ticket(args)
    }

    pub fn scan_ticket(ctx: Context<ScanTicket>) -> Result<()> {
        ctx.accounts.scan_ticket()
    }

    pub fn withdraw_from_treasury(ctx: Context<WithdrawFromTreasury>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw_from_treasury(amount)
    }

    pub fn list(ctx: Context<List>, price: u64) -> Result<()> {
        ctx.accounts.create_listing(price, &ctx.bumps)?;
        ctx.accounts.deposit_nft()
    }

    pub fn delist(ctx: Context<Delist>, ) -> Result<()> {
        ctx.accounts.withdraw_nft()
    }

    pub fn purchase_resale(ctx: Context<PurchaseResale>) -> Result<()> {
        ctx.accounts.send_sol()
    }

}

