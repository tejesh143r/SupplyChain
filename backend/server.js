const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { uploadToIPFS, getFromIPFS } = require('./services/ipfsService');
const {
  initBlockchain,
  registerProductOnChain,
  transferCustodyOnChain,
  flagAnomalousProductOnChain,
  getProductProvenance,
  getAllProductsFromChain
} = require('./services/blockchainService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize blockchain setup
initBlockchain();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SecureChainFlow Express Backend',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/product/register
 * Onboards items with dynamic categories, uploads attributes to IPFS, and mints product on-chain
 */
app.post('/api/product/register', async (req, res) => {
  try {
    const { productName, category, attributes, sensorThresholds } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ error: 'productName and category are required' });
    }

    const metadataPayload = {
      productName,
      category,
      attributes: attributes || {},
      sensorThresholds: sensorThresholds || {
        minTemp: -20,
        maxTemp: 5,
        maxHumidity: 80,
        maxRouteDeviation: 10
      },
      createdAt: new Date().toISOString()
    };

    // 1. Upload off-chain metadata payload to IPFS / Pinata
    const ipfsHash = await uploadToIPFS(metadataPayload);

    // 2. Execute smart contract registerProduct transaction
    const txResult = await registerProductOnChain(productName, category, ipfsHash);

    res.json({
      success: true,
      message: 'Product registered successfully on-chain!',
      productId: txResult.productId,
      ipfsMetadataHash: ipfsHash,
      transactionHash: txResult.transactionHash,
      blockNumber: txResult.blockNumber
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register product' });
  }
});

/**
 * POST /api/product/transfer
 * Updates custody state changes on-chain
 */
app.post('/api/product/transfer', async (req, res) => {
  try {
    const { productId, newCustodian, newState, remarks } = req.body;

    if (!productId || !newCustodian || newState === undefined) {
      return res.status(400).json({ error: 'productId, newCustodian, and newState are required' });
    }

    const result = await transferCustodyOnChain(productId, newCustodian, parseInt(newState), remarks);

    res.json({
      success: true,
      message: 'Custody successfully transferred on-chain!',
      productId: result.productId,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber
    });
  } catch (error) {
    console.error('Custody transfer error:', error);
    res.status(500).json({ error: error.message || 'Failed to transfer custody' });
  }
});

/**
 * POST /api/product/flag
 * Webhook triggered by AI/ML module or monitoring node to lock anomalous product on-chain
 */
app.post('/api/product/flag', async (req, res) => {
  try {
    const { productId, reason } = req.body;

    if (!productId || !reason) {
      return res.status(400).json({ error: 'productId and reason are required' });
    }

    const result = await flagAnomalousProductOnChain(productId, reason);

    res.json({
      success: true,
      message: 'Product flagged & locked on-chain by AI anomaly control!',
      productId: result.productId,
      reason,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    console.error('Flag product error:', error);
    res.status(500).json({ error: error.message || 'Failed to flag product' });
  }
});

/**
 * GET /api/product/:id
 * Fetches live, immutable product provenance directly from blockchain & IPFS for QR verification
 */
app.get('/api/product/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch on-chain details and audit trail
    const provenance = await getProductProvenance(id);

    // 2. Fetch IPFS off-chain metadata
    let ipfsData = null;
    if (provenance.product.ipfsMetadataHash) {
      ipfsData = await getFromIPFS(provenance.product.ipfsMetadataHash);
    }

    res.json({
      success: true,
      product: provenance.product,
      history: provenance.history,
      ipfsMetadata: ipfsData
    });
  } catch (error) {
    console.error('Provenance fetch error:', error);
    res.status(404).json({ error: error.message || 'Product provenance not found' });
  }
});

/**
 * GET /api/products
 * Lists all registered products
 */
app.get('/api/products', async (req, res) => {
  try {
    const products = await getAllProductsFromChain();
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Fetch products list error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
});

app.listen(PORT, () => {
  console.log(`SecureChainFlow Backend running on port ${PORT}`);
});
