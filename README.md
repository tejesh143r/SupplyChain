# SecureChainFlow 🚀

<div align="center">

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22.18-FFF100?style=for-the-badge&logo=hardhat&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

</div>

<p align="center">
  <b>An Enterprise-Grade, Domain-Agnostic Supply Chain Management Platform Integrating Solidity Smart Contracts, IPFS Decentralized Off-Chain Storage, Machine Learning Sensor Anomaly Detection, and Real-Time Provenance Dashboard.</b>
</p>

---

## 📌 Executive Summary

**SecureChainFlow** provides end-to-end, tamper-proof supply chain transparency for critical industries (pharmaceuticals, cold chain logistics, high-value electronics, and luxury goods). By combining **Ethereum/Polygon Smart Contracts**, **Decentralized IPFS Storage**, **Python FastAPI Machine Learning Anomaly Detection (Isolation Forest)**, and an **Interactive React Dashboard**, SecureChainFlow automatically enforces product integrity, detects telemetry deviations in real time, and instantly locks compromised goods on-chain.

---

## 🌟 Key Features

- **⛓️ On-Chain Immutable Provenance**: Track complete product state transitions (`Created` ➔ `Processed` ➔ `InTransit` ➔ `Inspected` ➔ `Delivered` ➔ `Flagged`) backed by Solidity smart contract events and custody transfer logs.
- **🤖 Autonomous AI Anomaly Engine**: Microservice leveraging Scikit-Learn's `Isolation Forest` unsupervised learning to analyze real-time IoT sensor telemetry (temperature, humidity, route deviation, and delay).
- **🔒 Webhook Smart Contract Lock**: When telemetry breaches physical safety thresholds or ML anomaly limits, the AI service automatically triggers an on-chain lock transaction (`flagAnomalousProduct`), halting further custody transfers.
- **📦 Off-Chain IPFS Metadata Storage**: Decentralized storage via Pinata IPFS for rich product specifications, batch certificates, and cryptographic verification hashes.
- **🖥️ Real-Time Telemetry Simulator & Dashboard**: Interactive React frontend with a live telemetry stream simulator, physical sensor threshold controls, dynamic timeline audit views, and QR verification portal.

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |   React Web Frontend  |
                                  |  (Vite + TailwindCSS) |
                                  +-----------+-----------+
                                              |
                        +---------------------+---------------------+
                        |                                           |
                        v                                           v
         +------------------------------+           +------------------------------+
         |    Node.js Express Backend   |           |    Python FastAPI AI Engine  |
         |    (Ethers.js + Web3 Provider) |           |  (Scikit-Learn Anomaly Model)|
         +--------------+---------------+           +--------------+---------------+
                        |                                           |
         +--------------+--------------+                            | Automated
         |                             |                            | Webhook Lock
         v                             v                            v
+------------------+         +-------------------+       +-------------------------+
| IPFS Metadata    |         | Solidity Smart    | <-----+ Express Flag Endpoint   |
| (Pinata Storage) |         | Contract Ledger   |       | (/api/product/flag)     |
+------------------+         +-------------------+       +-------------------------+
```

---

## 📁 Repository Structure

```
SecureChainFlow/
├── smart-contract/          # Smart Contract Layer
│   ├── contracts/           # SecureChainFlow.sol (State machine, role security, flag locks)
│   ├── scripts/             # Automated deployment scripts & address/ABI sync
│   └── test/                # Hardhat unit tests (Registration, custody transfers, AI flag locks)
│
├── backend/                 # Backend API & Storage Gateway
│   ├── services/            # Web3 contract abstraction & Pinata IPFS client
│   ├── server.js            # Express.js REST API endpoints & AI webhook handlers
│   └── contractInfo.json    # Auto-synced ABI & deployed smart contract address
│
├── ai-service/              # AI/ML Intelligence Microservice
│   ├── model.py             # Isolation Forest ML model & rule-based sensor threshold engine
│   ├── main.py              # FastAPI REST endpoints & automated webhook trigger
│   ├── test_ai.py           # Unit tests for anomaly detection algorithms
│   └── requirements.txt     # Python dependencies
│
└── frontend/                # Web Dashboard & QR Verification Portal
    ├── src/                 # React components (Register, Transfer, Provenance, Telemetry)
    ├── vite.config.js       # Vite dev server configuration
    └── index.html           # Single Page Application root
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Python**: v3.9 or higher
- **Git**: Installed on system

---

### Option 1: Automated Launch (Windows)

Simply run the batch launcher script in the root directory:
```cmd
start_all.bat
```

This launch script automatically:
1. Starts a local **Hardhat Ethereum node** at `http://127.0.0.1:8545`.
2. Compiles & deploys `SecureChainFlow.sol` and syncs contract artifacts to the backend.
3. Starts the **Node.js Express API** at `http://localhost:5000`.
4. Starts the **Python FastAPI AI Microservice** at `http://localhost:8000`.
5. Launches the **React Vite Web Dashboard** at `http://localhost:3000`.

---

### Option 2: Step-by-Step Manual Launch

#### Step 1: Smart Contract Layer
```bash
cd smart-contract
npm install
npx hardhat test                      # Execute smart contract unit tests
npx hardhat node                      # Start local blockchain node
```
*In a new terminal window:*
```bash
cd smart-contract
npx hardhat run scripts/deploy.js --network localhost  # Deploy contract & sync ABI
```

> **For Polygon Amoy Testnet Deployment:**
> ```bash
> npx hardhat run scripts/deploy.js --network amoy
> ```

#### Step 2: Backend REST API Layer
```bash
cd backend
npm install
cp .env.example .env                  # Configure environment variables
npm start                             # Starts API server on http://localhost:5000
```

#### Step 3: AI Anomaly Intelligence Layer
```bash
cd ai-service
pip install -r requirements.txt
python test_ai.py                     # Run AI model verification tests
python main.py                        # Starts FastAPI server on http://localhost:8000
```

#### Step 4: Frontend Web Dashboard
```bash
cd frontend
npm install
npm run dev                           # Starts Vite dev server on http://localhost:3000
```

---

## 📡 REST API & Webhook Specifications

### 1️⃣ Backend Express API (`http://localhost:5000`)

| Method | Endpoint | Description | Sample Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/product/register` | Onboards product, uploads metadata to IPFS, registers on-chain | `{"productName": "COVID Vaccine", "category": "Pharma", "metadata": {...}}` |
| `POST` | `/api/product/transfer` | Updates custody & pipeline state on-chain | `{"productId": "1", "newCustodian": "0x...", "newState": 2, "remarks": "Shipped"}` |
| `POST` | `/api/product/flag` | Webhook endpoint invoked by AI service to lock product on-chain | `{"productId": "1", "reason": "Temperature spike (+16.5°C)"}` |
| `GET` | `/api/product/:id` | Returns complete product provenance & smart contract audit log | *N/A* |
| `GET` | `/api/products` | Lists all registered products from blockchain | *N/A* |

### 2️⃣ AI Intelligence Microservice (`http://localhost:8000`)

| Method | Endpoint | Description | Sample Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/analyze-sensor-stream` | Analyzes sensor stream via ML & automatically triggers contract lock on anomaly | `{"productId": "1", "temperature": 18.5, "humidity": 45.0, "routeDeviationKm": 85.0, "delayHours": 2.5}` |
| `GET` | `/health` | Health check endpoint | *N/A* |
| `GET` | `/` | Service status and model training state | *N/A* |

---

## 🔬 Automated Testing Suite

### Smart Contract Verification Tests
Runs Hardhat automated unit tests covering contract deployment, onboarding, custody state transitions, unauthorized custodian rejections, and AI flag lock enforcement:
```bash
cd smart-contract
npx hardhat test
```

### AI Anomaly Model Tests
Runs Python automated test script verifying normal telemetry prediction vs. thermal spikes and route deviations:
```bash
cd ai-service
python test_ai.py
```

---

## ⚙️ Environment Variables Guide

### Backend (`backend/.env`)
```env
PORT=5000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_API_KEY=replace_with_a_long_random_service_key
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
API_KEY=replace_with_a_long_random_client_key
IPFS_FALLBACK_ENABLED=false
```

Production requires `API_KEY`, `AI_SERVICE_API_KEY`, `CORS_ORIGINS`, `RPC_URL`, and `PRIVATE_KEY`. The backend sends `AI_SERVICE_API_KEY` only to the internal AI service; the browser must never receive that secret. Set `API_KEY` for protected deployments and send it as `x-api-key` or a Bearer token. Keep `IPFS_FALLBACK_ENABLED=true` only for local development; production deployments must use working Pinata credentials and set it to `false`.

The AI service accepts telemetry only from the backend when `AI_SERVICE_API_KEY` is configured. Its `/health` endpoint remains available for orchestration probes.

### Frontend (`frontend/.env`)
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_KEY=
```

### Backend API Tests
```bash
cd backend
npm test
```

The test suite covers the public health endpoint, API-key enforcement, request validation, and configured CORS origins.

---

## 🛡️ License

This project is open-source software licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Developed by <b>Department of Data Engineering</b> (CSE - IoT & Cyber Security Including Blockchain Technology).</sub>
</div>
