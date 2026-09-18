import React, { useState } from 'react';
import { Activity, ShieldAlert, Cpu, Send, Zap, Thermometer, RefreshCw, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function TelemetrySimulator({ products, aiUrl, onTelemetryStreamed }) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.productId || '1');
  const [temperature, setTemperature] = useState(3.5); // Normal cold chain
  const [humidity, setHumidity] = useState(55);
  const [routeDeviationKm, setRouteDeviationKm] = useState(1.2);
  const [delayHours, setDelayHours] = useState(0.5);
  const [autoFlagOnChain, setAutoFlagOnChain] = useState(true);

  const [simulating, setSimulating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');

  // Quick Preset buttons
  const applyNormalPreset = () => {
    setTemperature(2.5);
    setHumidity(45);
    setRouteDeviationKm(0.8);
    setDelayHours(0.2);
  };

  const applyTempSpikePreset = () => {
    setTemperature(16.5); // Severe thermal breach
    setHumidity(60);
    setRouteDeviationKm(2.0);
    setDelayHours(1.5);
  };

  const applyRouteDevPreset = () => {
    setTemperature(4.0);
    setHumidity(50);
    setRouteDeviationKm(85.0); // Severe route deviation
    setDelayHours(14.0);
  };

  const handleStreamTelemetry = async () => {
    setSimulating(true);
    setError('');
    setLastResult(null);

    const activeProd = products.find(p => p.productId === selectedProductId) || products[0];

    try {
      const payload = {
        productId: selectedProductId,
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        routeDeviationKm: parseFloat(routeDeviationKm),
        delayHours: parseFloat(delayHours),
        autoFlagOnChain: autoFlagOnChain,
        thresholds: {
          minTemp: -20,
          maxTemp: 5,
          maxHumidity: 80,
          maxRouteDeviation: 15
        }
      };

      const res = await axios.post(`${aiUrl}/api/ai/analyze-sensor-stream`, payload);
      setLastResult(res.data);
      if (onTelemetryStreamed) {
        onTelemetryStreamed(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'AI Telemetry stream failed');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-amber-500/30 p-5 shadow-2xl relative overflow-hidden bg-slate-900/90">
      
      {/* Glow Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500"></div>

      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Real-Time IoT Telemetry & AI Anomaly Control
            </h3>
            <p className="text-xs text-slate-400">Stream sensor data to Python Isolation Forest microservice</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={applyNormalPreset}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
          >
            Normal (2.5°C)
          </button>
          <button
            onClick={applyTempSpikePreset}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
          >
            Temp Breach (+16.5°C)
          </button>
          <button
            onClick={applyRouteDevPreset}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20"
          >
            Route Dev (85km)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        
        {/* Product Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Product</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
          >
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                #{p.productId} - {p.productName}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-300">Temperature</span>
            <span className={temperature > 5 || temperature < -20 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {temperature}°C
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="40"
            step="0.5"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Humidity Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-300">Humidity</span>
            <span className={humidity > 80 ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
              {humidity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={humidity}
            onChange={(e) => setHumidity(e.target.value)}
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Route Deviation */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-300">Route Dev</span>
            <span className={routeDeviationKm > 15 ? 'text-rose-400 font-bold' : 'text-indigo-400'}>
              {routeDeviationKm} km
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={routeDeviationKm}
            onChange={(e) => setRouteDeviationKm(e.target.value)}
            className="w-full accent-indigo-400 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={autoFlagOnChain}
            onChange={(e) => setAutoFlagOnChain(e.target.checked)}
            className="rounded accent-cyan-500"
          />
          <span>Auto-Flag & Lock Product on Smart Contract if Anomaly Detected</span>
        </label>

        <button
          onClick={handleStreamTelemetry}
          disabled={simulating}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20"
        >
          {simulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing AI Telemetry...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>Stream Telemetry to AI</span>
            </>
          )}
        </button>
      </div>

      {/* AI Decision Output Box */}
      {lastResult && (
        <div className={`mt-4 p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
          lastResult.analysis.is_anomaly
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              {lastResult.analysis.is_anomaly ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
              <span>AI Analysis: {lastResult.analysis.isolation_forest_decision} ({lastResult.analysis.risk_level} RISK)</span>
            </div>
            <span className="font-mono text-[11px]">
              ML Anomaly Score: {lastResult.analysis.ml_anomaly_score.toFixed(4)}
            </span>
          </div>

          {lastResult.analysis.reasons?.length > 0 && (
            <div className="pl-7 text-xs space-y-1">
              {lastResult.analysis.reasons.map((reason, idx) => (
                <p key={idx}>• {reason}</p>
              ))}
            </div>
          )}

          {lastResult.autoFlagTriggered && (
            <div className="mt-2 pt-2 border-t border-rose-500/30 text-rose-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>Smart Contract Automated Flag Webhook Fired! Product #{lastResult.productId} Locked On-Chain.</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

    </div>
  );
}
