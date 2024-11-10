# Brick'NBlock: Real World Asset (RWA) NFT and Fundraising System

Brick'NBlock is a comprehensive system for tokenizing real world assets using NFTs and facilitating fundraising through ERC20 tokens. The system is built on the Binance Smart Chain (BSC) using Solidity and leverages OpenZeppelin libraries for security and standardization.

## Project Overview

This project is a decentralized application built with Next.js, designed to facilitate the management and interaction with Decentralized Autonomous Organizations (DAOs) and Real World Assets (RWAs). The core functionality revolves around the tokenization of real world assets, allowing users to convert physical properties into digital tokens that can be traded and invested in on the Binance Smart Chain.

## Pages and Functionalities

### 1. Listed RWAs (`src/app/rwa/listings/page.tsx`)

- **Purpose**: This page displays a list of all available RWAs for investment.
- **Description**: Users can filter RWAs by type and status, search by name or location, and view detailed information about each asset. The page includes a grid layout for easy navigation.

### 2. Create RWA (`src/app/rwa/create/page.tsx`)

- **Purpose**: This page is used to create a new Real World Asset (RWA) and initiate a fundraising campaign.
- **Description**: Users can fill out a form to tokenize their property, including details like property name, location, type, price, and documents. The page also handles the approval and creation of fundraising campaigns.

### 3. Explore DAOs (`src/app/dao/my-dao/page.tsx`)

- **Purpose**: This page allows users to explore various DAOs they are part of.
- **Description**: Users can view a list of DAOs, search for specific DAOs by name or location, and see detailed information about each DAO. The page includes a grid layout to display DAO cards.

### 4. DAO Project Proposals (`src/app/dao/project/[id]/page.tsx`)

- **Purpose**: This page provides an overview of proposals within a specific DAO project.
- **Description**: Users can view, create, and vote on proposals. The page includes modals for adding dividends and claiming them, as well as filters to view different proposal statuses.

### 5. Create Proposal (`src/app/dao/project/[id]/proposal/create/page.tsx`)

- **Purpose**: This page allows users to create new proposals for a DAO project.
- **Description**: Users can select the type of proposal (OffChain, OnChain, TransferFunds, Fundraising) and fill out the necessary details. The page includes a form with dynamic fields based on the proposal type.

### 6. Proposal Details (`src/app/dao/project/[id]/proposal/[proposal_id]/page.tsx`)

- **Purpose**: This page shows detailed information about a specific proposal.
- **Description**: Users can view the proposal's description, voting results, and cast their votes. The page also allows for executing proposals if they have succeeded.

## Getting Started

To get started with the project, follow these steps:

1. **Install Dependencies**: Run `npm install` or `yarn install` to install the necessary packages.
2. **Setup Environment Variables**: Copy `.env.example` to `.env` and fill in the required values.
3. **Run the Development Server**: Use `npm run dev` or `yarn dev` to start the server and open [http://localhost:3000](http://localhost:3000) in your browser.

## Learn More

For more information about Next.js and its features, visit the [Next.js Documentation](https://nextjs.org/docs).

## Deploy on Vercel

Deploy your application using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
