import { Idl, Program } from "@coral-xyz/anchor";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import idl from "@/idl/nf_tickets.json";

export const programId = new PublicKey(idl.address);

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program(idl as Idl, {
  connection,
});
