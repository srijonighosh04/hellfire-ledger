# Hellfire Ledger

Hellfire Ledger is a full-stack blockchain application that simplifies group debts by cleaning transaction data, optimizing settlements, and recording payments on the Ethereum blockchain.

The system processes financial records from CSV files, detects invalid data, minimizes the number of required transactions, and allows users to settle debts through a smart contract.

# Features

## CSV Upload & Parsing
Upload transaction data and automatically parse it into structured records.

## Data Cleaning & Validation
Detect invalid rows, missing values, or suspicious entries.

## Debt Optimization Algorithm
Minimizes the number of transactions required to settle debts.

## Interactive Dashboard
View clean records, flagged records, optimized transactions, and net balances.

## Blockchain Integration
Record payments using an Ethereum smart contract.

## Wallet Support
Connect MetaMask to sign transactions securely.

# System Architecture
Frontend (Next.js + React)
        │
        ▼
Backend API (Node.js + Express)
        │
        ▼
Data Processing
 • CSV Parsing
 • Data Cleaning
 • Debt Optimization
        │
        ▼
Ethereum Smart Contract (Sepolia Testnet)

## How Debt Optimization Works

The system reduces complex chains of payments into minimal settlements.

#Example:

## Original transactions:

Alice → Bob      10
Bob → Charlie    5
Charlie → Alice  7

## Optimized result:

Alice → Bob      3
Charlie → Bob    2

This reduces the number of required transfers while keeping balances correct.

# Tech Stack
Frontend

React

Next.js

ethers.js

Backend

Node.js

Express

Multer

PapaParse

Blockchain

Solidity

Ethereum Sepolia Testnet

MetaMask

# Project Structure
hellfire-ledger
│
├── frontend
│   ├── components
│   ├── pages
│   └── utils
│
├── backend
│   ├── api.js
│   ├── csvParser.js
│   ├── debtOptimizer.js
│   └── uploads
│
├── contracts
│   └── DebtLedger.sol
│
├── scripts
│   └── deploy.js
│
└── README.md

# Installation

## Clone the repository:

git clone https://github.com/YOUR_USERNAME/hellfire-ledger.git
cd hellfire-ledger
Running the Backend:
cd backend
npm install
node api.js

Server will start at:

http://localhost:4000

Health check endpoint:

GET /api/health

Running the Frontend
cd frontend
npm install
npm run dev

App will run at:

http://localhost:3000
Uploading a CSV

Example format:

from,to,amount
Alice,Bob,10
Bob,Charlie,5
Charlie,Alice,7

Upload through the dashboard or via API:

POST /api/upload

## Smart Contract Deployment

Deploy the smart contract using Hardhat:

npx hardhat run scripts/deploy.js --network sepolia

Make sure you have:

MetaMask installed

Sepolia test ETH

📊 API Endpoints
Health Check
GET /api/health

Response:

{
  "status": "OK",
  "system": "HELLFIRE MAINFRAME ONLINE"
}
Upload CSV
POST /api/upload

Returns:

Clean records

Flagged records

Optimized transactions

Net balances

# Future Improvements

Real-time blockchain transaction tracking

Advanced fraud detection

Multi-currency support

Smart contract settlement automation

Mobile interface

# Deployment Link: 
https://frontend-snowy-pi-76.vercel.app/
## License

MIT License
# Built by Srijoni Ghosh, Sunetra Pandey, Aniruddh Viswarajan, Md Ayan Ali
