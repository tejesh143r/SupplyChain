const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
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
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const API_KEY = process.env.API_KEY;
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && (!API_KEY || !AI_SERVICE_API_KEY || !process.env.CORS_ORIGINS)) {
  throw new Error('Production requires API_KEY, AI_SERVICE_API_KEY, and CORS_ORIGINS');
}

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '256kb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

const requireApiKey = (req, res, next) => {
  if (!API_KEY && !isProduction) return next();

  const suppliedKey = req.get('x-api-key') || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (suppliedKey !== API_KEY) {
    return res.status(401).json({ error: 'Valid API key is required' });
  }

  return next();
};

// Initialize blockchain setup
initBlockchain();

const registerProductHandler = async (req, res) => {
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

    const ipfsHash = await uploadToIPFS(metadataPayload);
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
};

const transferCustodyHandler = async (req, res) => {
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
};

const flagProductHandler = async (req, res) => {
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
};

const productDetailsHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const provenance = await getProductProvenance(id);

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
};

const productListHandler = async (req, res) => {
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
};

const telemetryHandler = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/analyze-sensor-stream`, payload, {
      timeout: 8000,
      headers: { 'x-service-key': AI_SERVICE_API_KEY },
    });

    res.json({
      success: true,
      productId: payload.productId,
      aiAnalysis: aiResponse.data
    });
  } catch (error) {
    console.error('Telemetry AI analysis error:', error.message);
    const detail = error.response?.data || { error: error.message || 'AI telemetry analysis failed' };
    res.status(502).json({ success: false, error: detail });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SecureChainFlow Express Backend',
    timestamp: new Date().toISOString()
  });
});

// Legacy endpoints kept for compatibility
app.post('/api/product/register', requireApiKey, registerProductHandler);
app.post('/api/product/transfer', requireApiKey, transferCustodyHandler);
app.post('/api/product/flag', requireApiKey, flagProductHandler);
app.get('/api/product/:id', productDetailsHandler);
app.get('/api/products', productListHandler);
app.post('/api/ai/telemetry', requireApiKey, telemetryHandler);

// Spec-aligned v1 endpoints
app.post('/api/v1/products/register', requireApiKey, registerProductHandler);
app.post('/api/v1/products/transfer', requireApiKey, transferCustodyHandler);
app.post('/api/v1/products/flag', requireApiKey, flagProductHandler);
app.get('/api/v1/products/:id', productDetailsHandler);
app.get('/api/v1/products', productListHandler);
app.post('/api/v1/ai/telemetry', requireApiKey, telemetryHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SecureChainFlow Backend running on port ${PORT}`);
  });
}

module.exports = app;
