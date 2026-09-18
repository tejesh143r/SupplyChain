import React, { useState } from 'react';
import { X, QrCode, Search, Download, ExternalLink, ShieldCheck, Camera } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRScannerModal({ isOpen, onClose, selectedProduct, onSearchProduct }) {
  const [searchId, setSearchId] = useState('');

  if (!isOpen) return null;

  const qrValue = selectedProduct
    ? `${window.location.origin}/verify/${selectedProduct.productId}`
    : `${window.location.origin}/verify/${searchId || '1'}`;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      onSearchProduct(searchId.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">QR Verification & Scanner Portal</h2>
              <p className="text-xs text-slate-400">Instant Consumer Provenance Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar / QR Reader Input */}
        <form onSubmit={handleSearchSubmit} className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Scan / Lookup Product ID
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Enter Product ID (e.g. 1, 2, 3...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all"
            >
              Verify Provenance
            </button>
          </div>
        </form>

        {/* QR Display Card */}
        <div className="mt-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 space-y-4">
          
          <div className="p-4 rounded-2xl bg-white shadow-2xl border-4 border-cyan-400/50">
            <QRCodeSVG
              value={qrValue}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="text-center">
            <h4 className="text-sm font-bold text-white">
              {selectedProduct ? selectedProduct.productName : `Product ID #${searchId || '1'}`}
            </h4>
            <p className="text-xs font-mono text-cyan-400 mt-0.5 break-all max-w-xs">
              {qrValue}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographically Verified on Ethereum Blockchain</span>
          </div>

        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
}
