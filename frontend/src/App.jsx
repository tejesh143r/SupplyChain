import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import axios from 'axios';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import RegisterProductModal from './components/RegisterProductModal';
import TransferCustodyModal from './components/TransferCustodyModal';
import ProvenanceView from './components/ProvenanceView';
import QRScannerModal from './components/QRScannerModal';
import TelemetrySimulator from './components/TelemetrySimulator';
import { RefreshCw, Sparkles, Box } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState('Manufacturer');

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedTransferProduct, setSelectedTransferProduct] = useState(null);

  const [activeProvenanceId, setActiveProvenanceId] = useState(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedQRProduct, setSelectedQRProduct] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const smoothX = useSpring(cursorX, { stiffness: 180, damping: 18, mass: 0.4 });
  const smoothY = useSpring(cursorY, { stiffness: 180, damping: 18, mass: 0.4 });

  useEffect(() => {
    const handlePointerMove = (event) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [cursorX, cursorY]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/products`);
      if (res.data.success) {
        setProducts(res.data.products);
      } else {
        setProducts(getFallbackProducts());
      }
    } catch (err) {
      console.warn('Backend not running or offline, showing initial demo dataset:', err.message);
      setProducts(getFallbackProducts());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProducts = () => [
    {
      productId: '1',
      productName: 'BioPharma Cryo Vaccine Batch #9',
      category: 'Pharmaceuticals',
      manufacturer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      currentCustodian: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      timestamp: new Date().toISOString(),
      currentState: 'InTransit',
      ipfsMetadataHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      isFlagged: false,
      flagReason: ''
    },
    {
      productId: '2',
      productName: 'NextGen Autonomous AI LiDAR Sensor',
      category: 'Electronics & Semiconductors',
      manufacturer: '0x3C44CdD46a935571ed359B4368B045239ac7d2d',
      currentCustodian: '0x3C44CdD46a935571ed359B4368B045239ac7d2d',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      currentState: 'Created',
      ipfsMetadataHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      isFlagged: false,
      flagReason: ''
    },
    {
      productId: '3',
      productName: 'Organic Extra Virgin Cold Press Olive Oil',
      category: 'Food & Organic Agriculture',
      manufacturer: '0x90F79bf6EB2c4f80806530203660480569B4d86b',
      currentCustodian: '0x15d34AA5453488E0303197FB4565442924340068',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      currentState: 'Flagged',
      ipfsMetadataHash: 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
      isFlagged: true,
      flagReason: 'AI Anomaly: Cold-chain temperature breach: 16.5°C > max threshold 5°C'
    }
  ];

  const handleRegisterProduct = async (payload) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/products/register`, payload);
      if (res.data.success) {
        await fetchProducts();
      }
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || 'Registration failed');
    }
  };

  const handleTransferCustody = async (transferData) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/products/transfer`, transferData);
      if (res.data.success) {
        await fetchProducts();
      }
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || 'Transfer failed');
    }
  };

  const handleTelemetryStreamed = (result) => {
    if (result?.autoFlagTriggered) {
      setTimeout(() => {
        fetchProducts();
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
        style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
      >
        <div className="h-8 w-8 rounded-full border border-cyan-400/60 bg-cyan-500/5 shadow-[0_0_24px_rgba(34,211,238,0.28)]" />
      </motion.div>

      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenQRScanner={() => {
          setSelectedQRProduct(null);
          setIsQRScannerOpen(true);
        }}
        onToggleSimulator={() => setShowSimulator(!showSimulator)}
        isSimulating={showSimulator}
      />

      <motion.main
        className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <motion.div
          className="relative glass-panel rounded-3xl p-6 lg:p-8 border border-white/10 overflow-hidden"
          whileHover={{ scale: 1.01, borderColor: 'rgba(6, 182, 212, 0.4)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Supply Chain Provenance & AI Integrity</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                SecureChainFlow Dashboard
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Active Role: <span className="font-bold text-cyan-400">{activeRole}</span>. Track domain-agnostic items across Solidity smart contracts, off-chain IPFS document storage, and Scikit-Learn Isolation Forest automated anomaly detection.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                <span className="text-xs text-slate-400 block font-medium">Total Products</span>
                <span className="text-xl font-black text-cyan-400">{products.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                <span className="text-xs text-slate-400 block font-medium">In Transit</span>
                <span className="text-xl font-black text-amber-400">
                  {products.filter(p => p.currentState === 'InTransit').length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                <span className="text-xs text-slate-400 block font-medium">AI Flagged</span>
                <span className="text-xl font-black text-rose-400">
                  {products.filter(p => p.isFlagged).length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {showSimulator && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <TelemetrySimulator
              products={products}
              backendUrl={BACKEND_URL}
              onTelemetryStreamed={handleTelemetryStreamed}
            />
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Tracked Product Provenance Grid</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono">
                {products.length} items
              </span>
            </div>

            <button
              onClick={fetchProducts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-xs text-slate-400">Loading Smart Contract & IPFS data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => (
                <ProductCard
                  key={prod.productId}
                  product={prod}
                  onViewProvenance={(id) => setActiveProvenanceId(id)}
                  onOpenTransfer={(p) => {
                    setSelectedTransferProduct(p);
                    setIsTransferOpen(true);
                  }}
                  onOpenQR={(p) => {
                    setSelectedQRProduct(p);
                    setIsQRScannerOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.main>

      <RegisterProductModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={handleRegisterProduct}
      />

      <TransferCustodyModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        product={selectedTransferProduct}
        onTransferSuccess={handleTransferCustody}
      />

      {activeProvenanceId && (
        <ProvenanceView
          productId={activeProvenanceId}
          onClose={() => setActiveProvenanceId(null)}
          backendUrl={BACKEND_URL}
        />
      )}

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        selectedProduct={selectedQRProduct}
        onSearchProduct={(id) => {
          setActiveProvenanceId(id);
        }}
      />

      <footer className="w-full glass-panel border-t border-white/10 py-6 mt-12 text-center text-xs text-slate-400">
        <p>SecureChainFlow Platform &copy; 2026 - Blockchain & AI Integrated Supply Chain Architecture</p>
      </footer>
    </div>
  );
}
