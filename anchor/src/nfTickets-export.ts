// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import IDL from "../target/idl/nf_tickets.json";
import type { NfTickets } from "../target/types/nf_tickets";

// Re-export the generated IDL and type
export { NfTickets, IDL };

// The programId is imported from the program IDL.
export const PROGRAM_ID = new PublicKey(IDL.address);

// This is a helper function to get the  Anchor program.
export function getProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program(
    {
      ...IDL,
      address: address ? address.toBase58() : IDL.address,
    } as NfTickets,
    provider
  );
}

// This is a helper function to get the program ID for the  program depending on the cluster.
export function getProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
      // This is the program ID for the  program on devnet and testnet.
      return new PublicKey("CqBh8BryDFbeG8i2gzJDvNS81hiJ96jYtSW3qPk1pt6V");
    case "mainnet-beta":
    default:
      return PROGRAM_ID;
  }
}
