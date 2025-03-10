import * as anchor from "@coral-xyz/anchor";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { programId } from "../config";
import { Program, AnchorProvider, ProgramError } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  Transaction,
  SendTransactionError,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TicketArgs } from "../../../../types/types";

export async function mintTicket(
  artist: String,
  event: String,
  ticketArgs: TicketArgs,
  program: Program,
  provider: AnchorProvider
): Promise<{
  success: boolean;
  signature?: string;
  ticketPublicKey?: PublicKey;
  error?: Error;
}> {
  try {
    // Input validation
    if (!event || !ticketArgs || !program || !provider) {
      throw new Error("Missing required parameters");
    }

    const ticketKeypair = Keypair.generate();
    const eventPublicKey = new PublicKey(event);
    const artistPublicKey = new PublicKey(artist);

    const ticketArguments = {
      name: ticketArgs.name,
      uri: ticketArgs.uri,
      price: new anchor.BN(ticketArgs.price * LAMPORTS_PER_SOL),
      venueAuthority: new PublicKey(ticketArgs.venueAuthority),
      screen: ticketArgs.screen || null,
      row: ticketArgs.row || null,
      seat: ticketArgs.seat || null,
    };

    const [managerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("manager"), artistPublicKey.toBuffer()],
      programId
    );

    const [platformPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform"), Buffer.from("NF-Tickets")],
      programId
    );

    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), platformPda.toBuffer()],
      programId
    );

    console.log("ticketArgs: ", ticketArguments);

    // Create the instruction
    const ticketIx = await program.methods
      .createTicket(ticketArguments)
      .accountsPartial({
        signer: provider.wallet.publicKey,
        payer: provider.wallet.publicKey,
        manager: managerPda,
        platform: platformPda,
        event: eventPublicKey,
        ticket: ticketKeypair.publicKey,
        treasury: treasuryPda,
        systemProgram: PublicKey.default,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        artist: artistPublicKey,
      })
      .instruction();

    // Create and send the transaction
    const transaction = new Transaction().add(ticketIx);

    const signature = await provider.sendAndConfirm(transaction, [
      ticketKeypair,
    ]);

    // Return success with signature and ticket public key
    return {
      success: true,
      signature,
      ticketPublicKey: ticketKeypair.publicKey,
    };
  } catch (error: unknown) {
    // Handle specific error types
    if (error instanceof ProgramError) {
      console.error(`Program error occurred: ${error.msg}`, error);
      return {
        success: false,
        error: new Error(`Program error: ${error.msg}`),
      };
    } else if (error instanceof SendTransactionError) {
      console.error(`Transaction error occurred: ${error.message}`, error);
      return {
        success: false,
        error: new Error(`Transaction error: ${error.message}`),
      };
    } else {
      // Handle generic errors
      console.error("Error minting ticket:", error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
