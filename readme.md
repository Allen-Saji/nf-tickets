## Contract Devnet Address: 5qCfMhUmbJmau9SGHP1qAEMfKwEzyyyQ846SMXX2y6w

# NFTickets: 🎟️ Artist & Events Social Media Ticketing Platform

An NFT-based platform empowering artists and event organizers with customizable ticketing options and a social media space to promote, sell, and engage directly with their fans. The platform also offers a trustless secondary market for reselling tickets and a marketplace for artist tokens with exclusive perks for token holders.

## 🚀 Overview

This platform aims to revolutionize ticketing by leveraging blockchain technology (Solana) to provide artists and event organizers with full control over their event tickets. It allows customization of ticket attributes such as transferability, royalties, and resale pricing. Alongside ticketing, the platform offers social media tools to promote events, sell merchandise, and post updates. Fans can also purchase limited artist tokens to access exclusive content and early access to event tickets.

**Key Highlights:**

- NFT-based ticketing with customizable rules.
- Trustless escrow-based secondary ticket market.
- Marketplace for artist tokens with limited supply.
- Social media features to promote events and merchandise.
- Integration with Solana Blinks for ticket sales via social media platforms.

## Concept UI:

![Artist Page](/public/Artist%20profile.png)

## ✨ Features

### 🎟️ Customizable NFT Tickets

- Artists can configure tickets with specific rules:
  - **Transferability**: Choose whether tickets can be resold.
  - **Royalty Percentage**: Set royalties for secondary sales.
  - **Price Cap**: Limit the resale price for fairness.

### 🔄 Secondary Ticket Market (Trustless Escrow)

- Fans can resell tickets in a trustless escrow environment, with automatic enforcement of artist royalties and price caps to prevent scalping.

### 🛒 Marketplace for Artist Tokens

- Each artist can issue limited tokens. Token holders gain:
  - Early access to tickets for exclusive events.
  - Priority access to limited merchandise drops.

### 📢 Social Media Integration for Artists & Events

- Artists and event organizers can post event details, engage with their fans, and promote merchandise within the platform.

### 🔗 Solana Blink Links for Ticket Sales

- Artists can generate Solana Blink links to sell tickets directly on external platforms, enhancing reach and flexibility.

### 🛍️ Merchandise Sales

- Integrated e-commerce features for artists and organizers to sell branded merchandise directly to fans.

## 🛠️ Tech Stack & Architecture

The platform is built using modern web technologies and blockchain tools to ensure performance, scalability, and security:

- **Frontend**: Next.js (TypeScript)
- **Smart Contracts**: Anchor (Rust)
- **NFTs**: Metaplex Core NFTs
- **Backend**: Node.js (API Endpoints), tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: AWS S3 for media assets
- **Blockchain**: Solana (for NFTs and transactions), Bonfida (for ticket sales and metadata)
- **Wallet Integration**: Solana web3.js for wallet connection

### Architecture Diagram

![Architecture for NFT Ticketing](/public/NFTickets%20architecture%20final.png)
