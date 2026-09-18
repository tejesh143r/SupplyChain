import React from 'react';
import { ShieldCheck, Cpu, QrCode, PlusCircle, Activity, Database, Sparkles } from 'lucide-react';

export default function Navbar({
  activeRole,
  setActiveRole,
  onOpenRegister,
  onOpenQRScanner,
  onToggleSimulator,
  isSimulating,
  networkStatus
}) {
  const roles = [
    { id: 'Manufacturer', label: 'Manufacturer' },
    { id: 'Distributor', label: 'Logistics / Distributor' },
    { id: 'Inspector', label: 'Quality Inspector' },
    { id: 'Retailer', label: 'Retailer' },
    { id: 'Consumer', label: 'End Consumer' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/30">
            <ShieldCheck className="w-6 h-6 text-black" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                SecureChainFlow
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v1.0 Hybrid AI
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-emerald-400" />
              Solidity Contract + Pinata IPFS + Scikit-Learn ML
            </p>
          </div>
        </div>

        {/* Center: Role Switcher */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeRole === r.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Right Action Hub */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSimulator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/20 animate-pulse'
                : 'bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>AI IoT Simulator</span>
          </button>

          <button
            onClick={onOpenQRScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Scanner</span>
          </button>

          <button
            onClick={onOpenRegister}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Register Item</span>
          </button>
        </div>

      </div>
    </header>
  );
}
