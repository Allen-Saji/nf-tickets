use anchor_lang::error_code;

#[error_code]
pub enum NameError {
    #[msg("Name must be between 1 and 32 characters")]
    NameTooLong,
}

#[error_code]
pub enum TicketError {
    #[msg("The maximum number of tickets for this event has been reached")]
    MaximumTicketsReached,

    #[msg("Numerical overflow occurred")]
    NumericalOverflow,

    #[msg("Required ticket attribute is missing")]
    MissingCapacityAttribute,

    #[msg("Invalid ticket price")]
    InvalidPrice,

    #[msg("Unauthorized operation")]
    Unauthorized,

    #[msg("Event has already started")]
    EventStarted,

    #[msg("Ticket is already used")]
    TicketAlreadyUsed,

    #[msg("Invalid ticket status")]
    InvalidTicketStatus,

    #[msg("Event not found")]
    EventNotFound,

    #[msg("Ticket not found")]
    TicketNotFound,

    #[msg("Ticket already scanned")]
    TicketAlreadyScanned,

}