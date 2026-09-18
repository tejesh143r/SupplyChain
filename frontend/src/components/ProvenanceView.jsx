import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ShieldAlert, FileText, CheckCircle2, Clock, User, ExternalLink, Cpu, Database, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function ProvenanceView({ productId, onClose, backendUrl }) {
  const [provenance, setProvenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchProvenance();
  }, [productId]);

  const fetchProvenance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${backendUrl}/api/product/${productId}`);
      if (res.data.success) {
        setProvenance(res.data);
      } else {
        setError('Failed to load provenance');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error fetching provenance');
    } finally {
      setLoading(false);
    }
  };

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col custom-scrollbar">
        
        {/* Glow Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          provenance?.product?.isFlagged ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-500'
        }`}></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              provenance?.product?.isFlagged
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Immutable Product Provenance</h2>
                <span className="px-2 py-0.5 rounded-lg bg-cyan-950/60 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/30">
                  ID: #{productId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct Smart Contract & IPFS Proof-of-Custody Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProvenance}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
              title="Refresh Provenance Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400 font-medium">Querying Blockchain Ledger & IPFS Storage...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400 text-sm">{error}</div>
        ) : provenance && (
          <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar space-y-6">
            
            {/* Overview Banner */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              provenance.product.isFlagged
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                : 'bg-slate-900/80 border-cyan-500/20'
            }`}>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">Product Title</span>
                <h3 className="text-lg font-extrabold text-white">{provenance.product.productName}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-white/10">
                    Category: {provenance.product.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-mono">
                    Created: {new Date(provenance.product.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-slate-400">Current Pipeline Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  provenance.product.isFlagged
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {provenance.product.currentState}
                </span>
              </div>
            </div>

            {/* AI Flag Warning if present */}
            {provenance.product.isFlagged && (
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>Product Locked On-Chain by AI Anomaly Monitor</span>
                </div>
                <p className="pl-7 text-rose-200">{provenance.product.flagReason}</p>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Chain of Custody Timeline ({provenance.history?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('ipfs')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ipfs'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Off-Chain IPFS Document Inspector
              </button>
            </div>

            {/* Tab 1: Timeline */}
            {activeTab === 'timeline' && (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-emerald-500">
                {provenance.history?.map((record, index) => (
                  <div key={index} className="relative flex items-start gap-4 group">
                    
                    {/* Timeline Node */}
                    <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                      record.state === 'Flagged'
                        ? 'bg-rose-500 border-rose-300 text-black'
                        : 'bg-slate-900 border-cyan-400 text-cyan-400 shadow-md shadow-cyan-500/40'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Timeline Card */}
                    <div className="flex-1 p-4 rounded-xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{record.state}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(record.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5 font-mono">
                          Tx Step #{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-950/80 p-2 rounded-lg border border-white/5">
                        <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="text-slate-400">Custodian:</span>
                        <span className="text-cyan-300 truncate">{record.custodian}</span>
                      </div>

                      {record.remarks && (
                        <p className="text-xs text-slate-300 italic pt-1">
                          "{record.remarks}"
                        </p>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: IPFS Document Inspector */}
            {activeTab === 'ipfs' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 font-mono text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between text-cyan-400 pb-2 border-b border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      IPFS Pinata Reference Hash:
                    </span>
                    <span className="text-xs text-slate-200 select-all font-bold">
                      {provenance.product.ipfsMetadataHash}
                    </span>
                  </div>

                  {provenance.ipfsMetadata ? (
                    <pre className="p-4 rounded-lg bg-slate-900 text-emerald-400 text-xs overflow-x-auto max-h-80 custom-scrollbar border border-white/5">
                      {JSON.stringify(provenance.ipfsMetadata, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-slate-400 text-xs">No off-chain metadata payload attached.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
