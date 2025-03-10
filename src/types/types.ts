export interface EventArgs {
  name: string;
  category: string;
  uri: string;
  city: string;
  venue: string;
  artist: string;
  date: string;
  time: string;
  capacity: number;
  isTicketTransferable: boolean;
}

export interface TicketArgs {
  name: string;
  uri: string | null | undefined;
  price: number;
  venueAuthority: string;
  screen?: string;
  row?: string;
  seat?: string;
}
