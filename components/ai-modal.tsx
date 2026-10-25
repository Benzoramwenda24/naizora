// components/ai-modal.tsx
'use client';

import React, { useState } from 'react';
import { AITradingEngine, AISettings, TradeStats, TradeCategory } from '@/lib/ai-engine';

export default function AIModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [log, setLog] = useState<string>('Configure your AI settings and click trade.');

  // Collapsible Toggles for Optional Sections
  const [showEntryConfig, setShowEntryConfig] = useState(false);
  const [showRecoveryConfig, setShowRecoveryConfig] = useState(false);

  // User Settings State
  const [settings, setSettings] = useState<AISettings>({
    symbol: 'R_100',
    stake: 10,
    tradeType: 'MATCHES',
    barrier: 5,
    useEntryCondition: false,
    entryDigit: 5,
    martingaleMultiplier: 2.0,
    takeProfit: 50,
    stopLoss: 20,
    useRecovery: false,
    recoveryTradeType: 'DIFFERS',
    recoveryBarrier: 5,
  });

  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    totalProfit: 0,
    currentStake: 10,
    isRecovering: false,
    status: 'IDLE',
  });

  const [engineInstance, setEngineInstance] = useState<AITradingEngine | null>(null);

  const handleToggleTrade = () => {
    if (isTrading) {
      engineInstance?.stopTrading();
      setIsTrading(false);
      setLog('Trading stopped by user.');
    } else {
      setIsTrading(true);
      const globalWS = (window as unknown as { derivWS?: WebSocket }).derivWS || new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

      const engine = new AITradingEngine(settings, (updatedStats, logMsg) => {
        setStats({ ...updatedStats });
        setLog(logMsg);
        if (['TP_HIT', 'SL_HIT', 'STOPPED'].includes(updatedStats.status)) {
          setIsTrading(false);
        }
      });

      setEngineInstance(engine);
      engine.startTrading(globalWS);
    }
  };

  return (
    <>
      {/* Floating Button: Blue with italicized white text */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-2xl rounded-full transition-all duration-200 transform hover:scale-105 border border-blue-400/40"
      >
        <span className="italic font-bold text-base tracking-wide flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-200 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 100-2h-1a1 1 0 100 2h1zM5.757 15.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM6 10a1 1 0 100-2H5a1 1 0 100 2h1zM5.757 4.343a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" />
          </svg>
          use ai
        </span>
      </button>

      {/* Main Configuration Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[400px] max-w-[92vw] bg-black text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
              <h3 className="font-bold text-sm tracking-wider uppercase text-blue-400">AI Professional Suite</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
          </div>

          <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto text-sm">
            {/* Market & Stake */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Market Symbol</label>
                <select
                  disabled={isTrading}
                  value={settings.symbol}
                  onChange={(e) => setSettings({ ...settings, symbol: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                >
                  <option value="R_100">Volatility 100 Index</option>
                  <option value="R_75">Volatility 75 Index</option>
                  <option value="R_50">Volatility 50 Index</option>
                  <option value="R_25">Volatility 25 Index</option>
                  <option value="R_10">Volatility 10 Index</option>
                  <option value="1HZ10V">1-Sec Volatility 10</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Initial Stake ($)</label>
                <input
                  type="number"
                  disabled={isTrading}
                  value={settings.stake}
                  onChange={(e) => setSettings({ ...settings, stake: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Primary Trade Type & Barrier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Trade Type</label>
                <select
                  disabled={isTrading}
                  value={settings.tradeType}
                  onChange={(e) => setSettings({ ...settings, tradeType: e.target.value as TradeCategory })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                >
                  <option value="MATCHES">Matches</option>
                  <option value="DIFFERS">Differs</option>
                  <option value="OVER">Over</option>
                  <option value="UNDER">Under</option>
                  <option value="EVEN">Even</option>
                  <option value="ODD">Odd</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Target / Barrier Digit</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  disabled={isTrading || ['EVEN', 'ODD'].includes(settings.tradeType)}
                  value={settings.barrier}
                  onChange={(e) => setSettings({ ...settings, barrier: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* OPTIONAL SECTION 1: Entry Digit Condition Toggle */}
            <div className="border border-gray-800 rounded-xl p-3 bg-gray-900/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">Entry Digit Filter Condition</span>
                <button
                  type="button"
                  disabled={isTrading}
                  onClick={() => {
                    const newState = !showEntryConfig;
                    setShowEntryConfig(newState);
                    setSettings({ ...settings, useEntryCondition: newState });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    showEntryConfig ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {showEntryConfig ? 'CLOSE' : 'OPEN'}
                </button>
              </div>

              {showEntryConfig && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <label className="block text-xs text-gray-400 mb-1">Enter Trade Only When Last Digit Is:</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    disabled={isTrading}
                    value={settings.entryDigit}
                    onChange={(e) => setSettings({ ...settings, entryDigit: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              )}
            </div>

            {/* Martingale Multiplier */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Martingale Multiplier</label>
              <input
                type="number"
                step="0.1"
                disabled={isTrading}
                value={settings.martingaleMultiplier}
                onChange={(e) => setSettings({ ...settings, martingaleMultiplier: parseFloat(e.target.value) || 1 })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              />
            </div>

            {/* OPTIONAL SECTION 2: Recovery Settings Toggle */}
            <div className="border border-gray-800 rounded-xl p-3 bg-gray-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-300">Recovery Strategy on Loss</span>
                  <p className="text-[10px] text-gray-500">Switch trade type upon loss</p>
                </div>
                <button
                  type="button"
                  disabled={isTrading}
                  onClick={() => {
                    const newState = !showRecoveryConfig;
                    setShowRecoveryConfig(newState);
                    setSettings({ ...settings, useRecovery: newState });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    showRecoveryConfig ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {showRecoveryConfig ? 'CLOSE' : 'OPEN'}
                </button>
              </div>

              {showRecoveryConfig && (
                <div className="mt-3 pt-3 border-t border-gray-800 space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Recovery Trade Type</label>
                    <select
                      disabled={isTrading}
                      value={settings.recoveryTradeType}
                      onChange={(e) => setSettings({ ...settings, recoveryTradeType: e.target.value as TradeCategory })}
                      className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm"
                    >
                      <option value="MATCHES">Matches</option>
                      <option value="DIFFERS">Differs</option>
                      <option value="OVER">Over</option>
                      <option value="UNDER">Under</option>
                      <option value="EVEN">Even</option>
                      <option value="ODD">Odd</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Recovery Target / Barrier</label>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      disabled={isTrading || ['EVEN', 'ODD'].includes(settings.recoveryTradeType)}
                      value={settings.recoveryBarrier}
                      onChange={(e) => setSettings({ ...settings, recoveryBarrier: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Take Profit & Stop Loss */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-green-400 mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  disabled={isTrading}
                  value={settings.takeProfit}
                  onChange={(e) => setSettings({ ...settings, takeProfit: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-green-900/50 rounded-lg px-3 py-2 text-white focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-red-400 mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  disabled={isTrading}
                  value={settings.stopLoss}
                  onChange={(e) => setSettings({ ...settings, stopLoss: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-red-900/50 rounded-lg px-3 py-2 text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Trades: <strong className="text-white">{stats.totalTrades}</strong></span>
                <span className="text-green-400">Wins: <strong>{stats.wins}</strong></span>
                <span className="text-red-400">Losses: <strong>{stats.losses}</strong></span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-gray-800">
                <span className="text-gray-400">Net P/L:</span>
                <span className={`font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.totalProfit.toFixed(2)}
                </span>
              </div>
              {stats.isRecovering && (
                <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider text-center pt-1 animate-pulse">
                  ⚠️ Recovery Strategy Active
                </div>
              )}
            </div>

            {/* Log Terminal */}
            <div className="p-3 bg-black border border-gray-800 rounded-lg font-mono text-xs text-blue-300 min-h-[48px] flex items-center">
              {log}
            </div>

            {/* Action Button: CLICK TO TRADE / CLICK TO STOP */}
            <button
              onClick={handleToggleTrade}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-lg ${
                isTrading
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isTrading ? 'CLICK TO STOP' : 'CLICK TO TRADE'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
