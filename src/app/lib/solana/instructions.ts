import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { program, programId } from "./config";
import { mplCore, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { AnchorProvider } from "@coral-xyz/anchor";
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

// export async function setUpManager(manager: PublicKey) {
//   const { program, provider } = useProgram();
//   if (!program || !provider) {
//     throw new Error("Wallet not connected");
//   }
//   const [managerPda] = PublicKey.findProgramAddressSync(
//     [Buffer.from("manager"), manager.toBuffer()],
//     programId
//   );
//   try {
//     const tx = await program.methods
//       .setupManager()
//       .accountsPartial({
//         signer: manager,
//         payer: manager,
//         manager: managerPda,
//       })
//       .rpc();
//     console.log("Manager setup transaction signature:", tx);
//     return { success: true, signature: tx, managerPda };
//   } catch (error) {
//     console.error("Error setting up manager:", error);
//     return { success: false, error };
//   }
// }

// Interface for the event arguments

// export async function createEvent(manager: PublicKey, eventArgs: EventArgs) {
//   const { program, provider } = useProgram();
//   if (!program || !provider) {
//     throw new Error("Wallet not connected");
//   }

//   // Generate a new keypair for the event
//   const eventKeypair = Keypair.generate();

//   // Derive the manager PDA
//   const [managerPda] = PublicKey.findProgramAddressSync(
//     [Buffer.from("manager"), manager.toBuffer()],
//     programId
//   );

//   try {
//     const tx = await program.methods
//       .createEvent(eventArgs)
//       .accountsPartial({
//         signer: manager,
//         payer: manager,
//         manager: managerPda,
//         event: eventKeypair.publicKey,
//         systemProgram: PublicKey.default, // SystemProgram.programId
//         mplCoreProgram: new PublicKey(MPL_CORE_PROGRAM_ID),
//         artist: manager, // Using manager as artist in this case
//       })
//       .signers([eventKeypair])
//       .rpc();

//     console.log("Event created successfully:", tx);
//     return {
//       success: true,
//       signature: tx,
//       eventPublicKey: eventKeypair.publicKey
//     };
//   } catch (error) {
//     console.error("Error creating event:", error);
//     return { success: false, error };
//   }
// }

// Combined function to setup manager and create event in one transaction
export async function setupManagerAndCreateEvent(
  manager: PublicKey,
  eventArgs: EventArgs
) {
  const { program, provider } = useProgram();
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
    // Build the setup manager instruction
    const setupManagerIx = await program.methods
      .setupManager()
      .accountsPartial({
        signer: manager,
        payer: manager,
        manager: managerPda,
      })
      .instruction();

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

    // Create a transaction with both instructions
    const transaction = new Transaction().add(setupManagerIx, createEventIx);

    // Sign and send the transaction
    const signature = await provider.sendAndConfirm(transaction, [
      eventKeypair,
    ]);

    console.log(
      "Manager setup and event created in one transaction:",
      signature
    );
    return {
      success: true,
      signature,
      managerPda,
      eventPublicKey: eventKeypair.publicKey,
    };
  } catch (error) {
    console.error("Error in combined transaction:", error);
    return { success: false, error };
  }
}
