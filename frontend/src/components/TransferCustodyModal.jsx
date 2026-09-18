import React, { useState } from 'react';
import { X, ArrowRightLeft, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';

export default function TransferCustodyModal({ isOpen, onClose, product, onTransferSuccess }) {
  const [formData, setFormData] = useState({
    newCustodian: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Default Hardhat Account #2
    newState: '2', // Default: InTransit
    remarks: 'Dispatched via Express Cold-Chain Freight'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const states = [
    { code: '1', label: 'Processed (Manufacturing Complete)' },
    { code: '2', label: 'InTransit (Under Logistics Handoff)' },
    { code: '3', label: 'Inspected (Quality & Customs Passed)' },
    { code: '4', label: 'Delivered (Received at Destination)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.newCustodian || !formData.newCustodian.startsWith('0x')) {
      setError('Please provide a valid Ethereum wallet address (0x...)');
      setLoading(false);
      return;
    }

    try {
      await onTransferSuccess({
        productId: product.productId,
        newCustodian: formData.newCustodian,
        newState: parseInt(formData.newState),
        remarks: formData.remarks
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to transfer custody');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Transfer Custody On-Chain</h2>
              <p className="text-xs text-slate-400">Product #{product.productId} - {product.productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {product.isFlagged && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>Product is FLAGGED on-chain by AI Anomaly Control. Custody transfers are locked!</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Custodian Wallet Address (0x...) *
            </label>
            <input
              type="text"
              required
              value={formData.newCustodian}
              onChange={(e) => setFormData({ ...formData, newCustodian: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Next Pipeline State *
            </label>
            <select
              value={formData.newState}
              onChange={(e) => setFormData({ ...formData, newState: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 transition-all"
            >
              {states.map((s) => (
                <option key={s.code} value={s.code} className="bg-slate-900 text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Handover Remarks / Audit Note
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || product.isFlagged}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating On-Chain State...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Execute Custody Transfer</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
