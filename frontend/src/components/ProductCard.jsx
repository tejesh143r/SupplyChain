import React from 'react';
import { ShieldCheck, ShieldAlert, ArrowRightLeft, QrCode, FileText, Cpu, User, Clock, CheckCircle2 } from 'lucide-react';

export default function ProductCard({
  product,
  onViewProvenance,
  onOpenTransfer,
  onOpenQR
}) {
  const getStateBadge = (stateStr, isFlagged) => {
    if (isFlagged || stateStr === 'Flagged') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          AI FLAGGED
        </span>
      );
    }

    switch (stateStr) {
      case 'Created':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            Created
          </span>
        );
      case 'Processed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Processed
          </span>
        );
      case 'InTransit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            In Transit
          </span>
        );
      case 'Inspected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Inspected
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Delivered
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {stateStr}
          </span>
        );
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return '0x...';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl p-5 border relative flex flex-col justify-between transition-all ${
      product.isFlagged ? 'border-rose-500/50 bg-rose-950/20' : 'border-white/10'
    }`}>
      
      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg bg-slate-900 text-cyan-400 border border-cyan-500/30">
              #{product.productId}
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-lg bg-slate-800/80 text-slate-300 border border-white/10">
              {product.category}
            </span>
          </div>
          {getStateBadge(product.currentState, product.isFlagged)}
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
          {product.productName}
        </h3>

        {/* Flag Reason Alert if present */}
        {product.isFlagged && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="truncate">{product.flagReason || 'AI Anomaly Detected'}</span>
          </div>
        )}

        {/* Custodian & Metadata Hash */}
        <div className="space-y-2 py-2 border-t border-b border-white/5 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Current Custodian:
            </span>
            <span className="font-mono text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded border border-white/5">
              {truncateAddress(product.currentCustodian)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              IPFS Hash:
            </span>
            <span className="font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 truncate max-w-[150px]">
              {product.ipfsMetadataHash ? `${product.ipfsMetadataHash.substring(0, 10)}...` : 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              AI Compliance Status:
            </span>
            <span className={`font-semibold ${product.isFlagged ? 'text-rose-400' : 'text-emerald-400'}`}>
              {product.isFlagged ? 'FLAGGED / LOCKED' : '99.8% COMPLIANT'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-2">
        <button
          onClick={() => onViewProvenance(product.productId)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800/80 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Provenance</span>
        </button>

        <button
          onClick={() => onOpenTransfer(product)}
          disabled={product.isFlagged}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 hover:border-indigo-400 disabled:opacity-40 transition-all"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => onOpenQR(product)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-white/10 hover:text-white hover:bg-slate-700 transition-all"
          title="Show Product QR Code"
        >
          <QrCode className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

    </div>
  );
}
