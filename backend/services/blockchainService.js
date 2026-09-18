const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

let provider;
let wallet;
let contract;
let contractAddress;
let contractABI;

function initBlockchain() {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

  provider = new ethers.JsonRpcProvider(rpcUrl);
  wallet = new ethers.Wallet(privateKey, provider);

  const infoPath = path.join(__dirname, '../contractInfo.json');
  if (fs.existsSync(infoPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
      contractAddress = data.address;
      contractABI = data.abi;
      contract = new ethers.Contract(contractAddress, contractABI, wallet);
      console.log(`Connected to SecureChainFlow contract at: ${contractAddress}`);
    } catch (err) {
      console.warn('Failed to parse contractInfo.json:', err.message);
    }
  } else {
    console.warn('contractInfo.json not found yet. Backend waiting for Hardhat deployment...');
  }
}

async function registerProductOnChain(productName, category, ipfsMetadataHash) {
  if (!contract) initBlockchain();
  if (!contract) throw new Error('Contract not initialized. Deploy smart contract first.');

  console.log(`Registering product on-chain: ${productName} (${category})...`);
  const tx = await contract.registerProduct(productName, category, ipfsMetadataHash);
  const receipt = await tx.wait();

  // Find ProductRegistered event
  let productId = null;
  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog(log);
      if (parsedLog && parsedLog.name === 'ProductRegistered') {
        productId = parsedLog.args.productId.toString();
        break;
      }
    } catch (e) {}
  }

  if (!productId) {
    // Fallback count query
    const count = await contract.getProductCount();
    productId = count.toString();
  }

  return {
    productId,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber
  };
}

async function transferCustodyOnChain(productId, newCustodian, newState, remarks) {
  if (!contract) initBlockchain();
  if (!contract) throw new Error('Contract not initialized. Deploy smart contract first.');

  console.log(`Transferring custody for product ${productId} to ${newCustodian} with state ${newState}...`);
  const tx = await contract.transferCustody(productId, newCustodian, newState, remarks || '');
  const receipt = await tx.wait();

  return {
    productId,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber
  };
}

async function flagAnomalousProductOnChain(productId, reason) {
  if (!contract) initBlockchain();
  if (!contract) throw new Error('Contract not initialized. Deploy smart contract first.');

  console.log(`Flagging product ${productId} on-chain. Reason: ${reason}`);
  const tx = await contract.flagAnomalousProduct(productId, reason);
  const receipt = await tx.wait();

  return {
    productId,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    flagged: true
  };
}

async function getProductProvenance(productId) {
  if (!contract) initBlockchain();
  if (!contract) throw new Error('Contract not initialized. Deploy smart contract first.');

  const productData = await contract.getProduct(productId);
  const historyData = await contract.getProductHistory(productId);

  const stateNames = ['Created', 'Processed', 'InTransit', 'Inspected', 'Delivered', 'Flagged'];

  const product = {
    productId: productData.productId.toString(),
    productName: productData.productName,
    category: productData.category,
    manufacturer: productData.manufacturer,
    currentCustodian: productData.currentCustodian,
    timestamp: new Date(Number(productData.timestamp) * 1000).toISOString(),
    currentState: stateNames[Number(productData.currentState)] || 'Unknown',
    currentStateCode: Number(productData.currentState),
    ipfsMetadataHash: productData.ipfsMetadataHash,
    isFlagged: productData.isFlagged,
    flagReason: productData.flagReason
  };

  const history = historyData.map((h) => ({
    custodian: h.custodian,
    state: stateNames[Number(h.state)] || 'Unknown',
    stateCode: Number(h.state),
    timestamp: new Date(Number(h.timestamp) * 1000).toISOString(),
    remarks: h.remarks
  }));

  return { product, history };
}

async function getAllProductsFromChain() {
  if (!contract) initBlockchain();
  if (!contract) throw new Error('Contract not initialized. Deploy smart contract first.');

  const productIds = await contract.getAllProductIds();
  const products = [];

  for (const id of productIds) {
    try {
      const prov = await getProductProvenance(id.toString());
      products.push(prov.product);
    } catch (err) {
      console.warn(`Error fetching product ID ${id}:`, err.message);
    }
  }

  return products;
}

module.exports = {
  initBlockchain,
  registerProductOnChain,
  transferCustodyOnChain,
  flagAnomalousProductOnChain,
  getProductProvenance,
  getAllProductsFromChain
};
