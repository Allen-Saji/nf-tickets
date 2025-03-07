import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { program, programId } from "./config";
import { mplCore, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { EventArgs } from "./types";

export function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  if (!wallet) {
    return { program: null, provider: null };
  }
  const provider = new AnchorProvider(connection, wallet, {});
  return { program, provider };
}
export async function setupManagerAndCreateEvent(
  manager: PublicKey,
  eventArgs: EventArgs,
  program: Program,
  provider: AnchorProvider
) {
  if (!program || !provider) {
    throw new Error("Wallet not connected");
  }

  // Generate a new keypair for the event
  const eventKeypair = Keypair.generate();

  // Derive the manager PDA
  const [managerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("manager"), manager.toBuffer()],
    programId
  );

  try {
    // Check if manager account already exists
    const managerExists = await provider.connection
      .getAccountInfo(managerPda)
      .then((accountInfo) => !!accountInfo)
      .catch(() => false);

    // Create transaction
    const transaction = new Transaction();

    // Only add the setupManager instruction if the manager doesn't exist
    if (!managerExists) {
      const setupManagerIx = await program.methods
        .setupManager()
        .accountsPartial({
          signer: manager,
          payer: manager,
          manager: managerPda,
        })
        .instruction();

      transaction.add(setupManagerIx);
      console.log(
        "Adding manager setup instruction - manager doesn't exist yet"
      );
    } else {
      console.log("Manager already exists, skipping setup");
    }

    // Build the create event instruction
    const createEventIx = await program.methods
      .createEvent(eventArgs)
      .accountsPartial({
        signer: manager,
        payer: manager,
        manager: managerPda,
        event: eventKeypair.publicKey,
        systemProgram: PublicKey.default, // SystemProgram.programId
        mplCoreProgram: new PublicKey(MPL_CORE_PROGRAM_ID),
        artist: manager, // Using manager as artist in this case
      })
      .instruction();

    // Add create event instruction to transaction
    transaction.add(createEventIx);

    // Sign and send the transaction
    const signature = await provider.sendAndConfirm(transaction, [
      eventKeypair,
    ]);

    console.log(
      `Event created successfully${
        !managerExists ? " with new manager setup" : ""
      }:`,
      signature
    );

    return {
      success: true,
      signature,
      managerPda,
      eventPublicKey: eventKeypair.publicKey,
      managerSetup: !managerExists, // Flag indicating if manager was set up in this transaction
    };
  } catch (error) {
    console.error("Error in transaction:", error);
    return { success: false, error };
  }
}
