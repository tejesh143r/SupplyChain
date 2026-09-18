const axios = require('axios');
const crypto = require('crypto');

// In-memory local IPFS store for immediate offline/dev simulation
const localIpfsStore = new Map();

/**
 * Upload JSON payload to IPFS (via Pinata API or local simulator fallback)
 */
async function uploadToIPFS(metadataPayload) {
  const pinataJwt = process.env.PINATA_JWT;
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretKey = process.env.PINATA_SECRET_KEY;

  const payloadString = JSON.stringify(metadataPayload);

  // If Pinata JWT or API Keys are provided, use real Pinata IPFS API
  if (pinataJwt || (pinataApiKey && pinataSecretKey)) {
    try {
      console.log('Uploading payload to Pinata IPFS...');
      const headers = pinataJwt
        ? { Authorization: `Bearer ${pinataJwt}` }
        : {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretKey,
          };

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: metadataPayload,
          pinataMetadata: {
            name: `SecureChainFlow_${metadataPayload.productName || 'Metadata'}_${Date.now()}`
          }
        },
        { headers }
      );

      const ipfsHash = response.data.IpfsHash;
      console.log(`Successfully pinned to Pinata IPFS! Hash: ${ipfsHash}`);
      localIpfsStore.set(ipfsHash, metadataPayload);
      return ipfsHash;
    } catch (err) {
      console.warn('Pinata upload failed or keys invalid. Falling back to Local IPFS engine:', err.message);
    }
  }

  const fallbackEnabled = process.env.IPFS_FALLBACK_ENABLED !== 'false' && process.env.NODE_ENV !== 'production';
  if (!fallbackEnabled) {
    throw new Error('Pinata IPFS is unavailable and local IPFS fallback is disabled');
  }

  // Local SHA-256 based IPFS simulator fallback for development only.
  const sha256Hash = crypto.createHash('sha256').update(payloadString).digest('hex');
  const mockIpfsHash = `QmSCFlow${sha256Hash.substring(0, 38)}`;
  
  localIpfsStore.set(mockIpfsHash, metadataPayload);
  console.log(`Stored in Local IPFS Engine. Hash: ${mockIpfsHash}`);

  return mockIpfsHash;
}

/**
 * Retrieve off-chain metadata by IPFS hash
 */
async function getFromIPFS(ipfsHash) {
  if (localIpfsStore.has(ipfsHash)) {
    return localIpfsStore.get(ipfsHash);
  }

  // Try public IPFS gateway if valid Pinata hash
  try {
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const response = await axios.get(gatewayUrl, { timeout: 4000 });
    return response.data;
  } catch (err) {
    console.warn(`Could not fetch hash ${ipfsHash} from public IPFS gateway:`, err.message);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Unable to retrieve IPFS metadata for ${ipfsHash}`);
    }
    return {
      note: "Metadata fetched from on-chain reference hash",
      ipfsHash: ipfsHash,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  uploadToIPFS,
  getFromIPFS
};
