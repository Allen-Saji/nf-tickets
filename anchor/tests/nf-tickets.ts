import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { expect } from "chai";
import { NfTickets } from "../target/types/nf_tickets";
import { fetchCollectionV1, fetchAssetV1 } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { PublicKey as Web3PublicKey } from "@solana/web3.js";

// Initialize the UMI object for interacting with Metaplex programs
const umi = createUmi("http://127.0.0.1:8899").use(mplCore());

describe("nf-tickets", () => {
  // Set up the anchor provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load the NfTickets program
  const program = anchor.workspace.NfTickets as Program<NfTickets>;

  // Define global constants and variables
  const platformName = "TestPlatform";
  const fee = 500; // Platform fee in basis points (2.5%)
  let platformPda: anchor.web3.PublicKey;
  let rewardsMintPda: anchor.web3.PublicKey;
  let treasuryPda: anchor.web3.PublicKey;
  let managerPda: anchor.web3.PublicKey;
  let eventKeypair: anchor.web3.Keypair;
  let ticketKeypair: anchor.web3.Keypair;
  let venueAuthority = anchor.web3.Keypair.generate().publicKey;
  let newPayer: anchor.web3.Keypair;
  let artist: anchor.web3.Keypair;

  // Test 1: Initializing the platform
  it("Initializes platform", async () => {
    // Find PDAs for platform, rewards, and treasury
    [platformPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("platform"), Buffer.from(platformName)],
      program.programId
    );

    [rewardsMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rewards"), platformPda.toBuffer()],
      program.programId
    );

    [treasuryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), platformPda.toBuffer()],
      program.programId
    );

    // Fetch the minimum SOL required for rent exemption
    const lamportsForRentExemption =
      await provider.connection.getMinimumBalanceForRentExemption(0); // No data space for treasury, only lamports

    // Fund the treasury PDA with the minimum rent-exempt amount
    const transaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: treasuryPda,
        lamports: lamportsForRentExemption,
      })
    );

    // Send the transaction to make the PDA rent-exempt
    await provider.sendAndConfirm(transaction);

    // Call the initialize method in the program
    await program.methods
      .initialize(platformName, fee)
      .accountsPartial({
        admin: provider.wallet.publicKey,
        platform: platformPda,
        rewardsMint: rewardsMintPda,
        treasury: treasuryPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // //Fund the treasury PDA with the minimum rent-exempt amount
    // const transaction2 = new anchor.web3.Transaction().add(
    //   anchor.web3.SystemProgram.transfer({
    //     fromPubkey: provider.wallet.publicKey,
    //     toPubkey: treasuryPda,
    //     lamports: lamportsForRentExemption,
    //   })
    // );

    // // Send the transaction to make the PDA rent-exempt
    // await provider.sendAndConfirm(transaction2);

    // Fetch the platform account and verify its data
    const platformAccount = await program.account.platform.fetch(platformPda);
    expect(platformAccount.admin.toString()).to.equal(
      provider.wallet.publicKey.toString()
    );
    expect(platformAccount.fee).to.equal(fee);
    expect(platformAccount.platformName).to.equal(platformName);
  });

  // Test 2: Setting up the manager
  it("Sets up manager", async () => {
    artist = anchor.web3.Keypair.generate();

    //add funds to new payer
    const transaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: artist.publicKey,
        lamports: 40000000,
      })
    );

    await provider.sendAndConfirm(transaction);
    //console.log("transaction sent: ", transaction);

    // Derive PDA for the manager
    [managerPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("manager"), artist.publicKey.toBuffer()],
      program.programId
    );

    // Call setupManager method from the program
    await program.methods
      .setupManager()
      .accountsPartial({
        signer: artist.publicKey,
        payer: artist.publicKey,
        manager: managerPda,
      })
      .signers([artist])
      .rpc();

    // Fetch and validate the manager account
    const managerAccount = await program.account.manager.fetch(managerPda);
    expect(managerAccount).to.exist;
  });

  // Test 3: Creating an event
  it("Creates an event", async () => {
    // Generate keypair for the new event
    eventKeypair = anchor.web3.Keypair.generate();
    const eventArgs = {
      name: "Test Event",
      category: "Music",
      uri: "https://example.com/event",
      city: "Test City",
      venue: "Test Venue",
      artist: "Test Artist",
      date: "2024-10-01",
      time: "20:00",
      capacity: 1,
      isTicketTransferable: true,
    };

    // Call createEvent method from the program
    const eventTx = await program.methods
      .createEvent(eventArgs)
      .accountsPartial({
        signer: artist.publicKey,
        payer: artist.publicKey,
        manager: managerPda,
        event: eventKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        artist: artist.publicKey,
      })
      .signers([eventKeypair, artist])
      .rpc();

    // Confirm the transaction
    await provider.connection.confirmTransaction(eventTx);

    // Fetch and validate the event collection
    const collection = await fetchCollectionWithRetry(eventKeypair.publicKey);
    expect(collection.name).to.equal(eventArgs.name);
  });

  // Test 4: Generating a ticket
  it("Generates a ticket", async () => {
    // Generate keypair for the new ticket
    ticketKeypair = anchor.web3.Keypair.generate();
    newPayer = anchor.web3.Keypair.generate();

    //add funds to new payer
    const transaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: newPayer.publicKey,
        lamports: 40000000,
      })
    );

    await provider.sendAndConfirm(transaction);
    //console.log("transaction sent: ", transaction);

    const ticketArgs = {
      name: "Test Ticket",
      uri: "https://example.com/ticket",
      price: new anchor.BN(10000),
      venueAuthority,
      screen: "Screen 1",
      row: "A",
      seat: "1",
    };

    // Call createTicket method from the program
    const ticketTx = await program.methods
      .createTicket(ticketArgs)
      .accountsPartial({
        signer: newPayer.publicKey,
        payer: newPayer.publicKey,
        manager: managerPda,
        platform: platformPda,
        event: eventKeypair.publicKey,
        ticket: ticketKeypair.publicKey,
        treasury: treasuryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        artist: artist.publicKey,
      })
      .signers([ticketKeypair, newPayer])
      .rpc();

    console.log("artist: ", artist.publicKey);
    console.log("new payer: ", newPayer.publicKey);
    console.log("event: ", eventKeypair.publicKey);

    // Confirm the transaction
    await provider.connection.confirmTransaction(ticketTx);

    // Fetch and validate the ticket
    const ticket = await fetchTicketWithRetry(ticketKeypair.publicKey);
    console.log("ticket: ", ticket);
    expect(ticket.name).to.equal(ticketArgs.name);
  });

  // Test case: Withdraw funds from treasury
  it("Withdraws funds from treasury", async () => {
    // Fetch the minimum SOL required for rent exemption
    const lamportsForRentExemption =
      await provider.connection.getMinimumBalanceForRentExemption(200); // No data space for treasury, only lamports

    // Fund the treasury PDA with the minimum rent-exempt amount
    const transaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: treasuryPda,
        lamports: lamportsForRentExemption,
      })
    );

    // Send the transaction to make the PDA rent-exempt
    await provider.sendAndConfirm(transaction);

    let amountToWithdraw = new anchor.BN(10000);

    // Fetch admin's initial balance
    const initialAdminBalance = await provider.connection.getBalance(
      provider.wallet.publicKey
    );

    // Call withdraw_from_treasury method from the program
    await program.methods
      .withdrawFromTreasury(amountToWithdraw)
      .accounts({
        admin: provider.wallet.publicKey,
        platform: platformPda,
        treasury: treasuryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fetch admin's balance after withdrawal
    const finalAdminBalance = await provider.connection.getBalance(
      provider.wallet.publicKey
    );

    // Check that the balance has increased by the correct amount
    expect(finalAdminBalance).to.be.greaterThan(initialAdminBalance);
  });

  // Helper function: Retry fetching a collection
  const fetchCollectionWithRetry = async (
    eventPublicKey: anchor.web3.PublicKey,
    retries = 50,
    delay = 2000
  ) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fetchCollectionV1(
          umi,
          publicKey(eventPublicKey.toBase58())
        );
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Helper function: Retry fetching a ticket
  const fetchTicketWithRetry = async (
    ticketPublicKey: anchor.web3.PublicKey,
    retries = 50,
    delay = 2000
  ) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fetchAssetV1(umi, publicKey(ticketPublicKey.toBase58()));
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  it("Lists a ticket for sale", async () => {
    // Convert keys where necessary to ensure type consistency
    const platformKey = new anchor.web3.PublicKey(platformPda.toBase58());
    const ticketKey = new anchor.web3.PublicKey(
      ticketKeypair.publicKey.toBase58()
    );
    const eventKey = new anchor.web3.PublicKey(
      eventKeypair.publicKey.toBase58()
    );
    const mplCoreProgramKey = new anchor.web3.PublicKey(MPL_CORE_PROGRAM_ID);
    const tokenProgramKey = new anchor.web3.PublicKey(
      TOKEN_PROGRAM_ID.toBase58()
    );

    // Find PDA for the listing
    const [listingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [platformKey.toBuffer(), ticketKey.toBuffer()],
      program.programId
    );

    // Derive PDA for the vault (where the ticket will be deposited)
    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [ticketKey.toBuffer()],
      tokenProgramKey
    );

    // Fetch the metadata PDA
    const [metadataPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        mplCoreProgramKey.toBuffer(),
        ticketKey.toBuffer(),
      ],
      mplCoreProgramKey
    );

    // Fetch the master edition PDA
    const [masterEditionPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        mplCoreProgramKey.toBuffer(),
        ticketKey.toBuffer(),
        Buffer.from("edition"),
      ],
      mplCoreProgramKey
    );

    const price = new anchor.BN(5000); // Price of the ticket in lamports

    // Call the list method from the program
    await program.methods
      .list(price)
      .accountsPartial({
        maker: newPayer.publicKey,
        platform: platformKey,
        ticketMint: ticketKey,
        collectionMint: eventKey,
        makerAta: newPayer.publicKey, // Associated Token Account of the maker
        vault: vaultPda,
        listing: listingPda,
        metadata: metadataPda,
        masterEdition: masterEditionPda,
        metadataProgram: mplCoreProgramKey,
        associatedTokenProgram: tokenProgramKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: tokenProgramKey,
      })
      .signers([newPayer])
      .rpc();

    // Fetch and validate the listing account
    const listingAccount = await program.account.listing.fetch(listingPda);
    expect(listingAccount).to.exist;
    expect(listingAccount.maker.toString()).to.equal(
      newPayer.publicKey.toString()
    );
    expect(listingAccount.price.toNumber()).to.equal(price.toNumber());
    expect(listingAccount.mint.toString()).to.equal(ticketKey.toString());

    // // Validate that the ticket has been transferred to the vault
    // const vaultAccount = await program.account.token.fetch(vaultPda);
    // expect(vaultAccount.amount.toNumber()).to.equal(1);
    // expect(vaultAccount.owner.toString()).to.equal(listingPda.toString());
  });
});
