import React, { useState } from 'react';
import { X, ShieldCheck, UploadCloud, Thermometer, Compass, Layers, CheckCircle2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterProductModal({ isOpen, onClose, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    productName: '',
    category: 'Pharmaceuticals',
    customCategory: '',
    batchNumber: 'BATCH-2026-' + Math.floor(1000 + Math.random() * 9000),
    originLocation: 'Munich BioPark, Germany',
    minTemp: -20,
    maxTemp: 5,
    maxHumidity: 80,
    maxRouteDeviation: 15,
    certificationDoc: 'ISO-9001 & Cold-Chain BioCert Certified'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Pharmaceuticals',
    'Electronics & Semiconductors',
    'Luxury Goods & High Fashion',
    'Food & Organic Agriculture',
    'Automotive Components',
    'Aerospace Parts',
    'Custom Category'
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalCategory = formData.category === 'Custom Category' ? formData.customCategory : formData.category;

    if (!formData.productName.trim() || !finalCategory.trim()) {
      setError('Please provide product name and valid category');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        productName: formData.productName,
        category: finalCategory,
        attributes: {
          batchNumber: formData.batchNumber,
          originLocation: formData.originLocation,
          certificationDoc: formData.certificationDoc
        },
        sensorThresholds: {
          minTemp: Number(formData.minTemp),
          maxTemp: Number(formData.maxTemp),
          maxHumidity: Number(formData.maxHumidity),
          maxRouteDeviation: Number(formData.maxRouteDeviation)
        }
      };

      await onRegisterSuccess(payload);
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500"></div>

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Onboard Product to Blockchain & IPFS
              </h2>
              <p className="text-xs text-slate-400">
                Generate immutable smart contract ledger entry & pin metadata to Pinata IPFS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Product Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. mRNA mRNA-2026 Cryo Vaccine"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dynamic Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.category === 'Custom Category' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Specify Custom Category *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Green Hydrogen Fuel Cells"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          )}

          {/* Batch & Origin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Batch Number / Serial ID
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Origin Manufacturing Facility
              </label>
              <input
                type="text"
                value={formData.originLocation}
                onChange={(e) => setFormData({ ...formData, originLocation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          {/* AI Sensor Safety Thresholds Section */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              AI Isolation Forest Safe Thresholds (Off-Chain IPFS Pinned)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Min Temp (°C)</label>
                <input
                  type="number"
                  value={formData.minTemp}
                  onChange={(e) => setFormData({ ...formData, minTemp: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Max Temp (°C)</label>
                <input
                  type="number"
                  value={formData.maxTemp}
                  onChange={(e) => setFormData({ ...formData, maxTemp: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Max Humidity (%)</label>
                <input
                  type="number"
                  value={formData.maxHumidity}
                  onChange={(e) => setFormData({ ...formData, maxHumidity: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Route Dev Max (km)</label>
                <input
                  type="number"
                  value={formData.maxRouteDeviation}
                  onChange={(e) => setFormData({ ...formData, maxRouteDeviation: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Certifications & Metadata Notes
            </label>
            <input
              type="text"
              value={formData.certificationDoc}
              onChange={(e) => setFormData({ ...formData, certificationDoc: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Pinning IPFS & Minting On-Chain...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Register & Pin Metadata</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
