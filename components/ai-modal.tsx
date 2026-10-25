// components/ai-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AITradingEngine, AISettings, TradeStats, TradeCategory } from '@/lib/ai-engine';

export default function AIModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [log, setLog] = useState<string>('Configure your AI settings and click trade.');

  // Draggable Button Position State
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  // Handle Dragging (Mouse & Touch support for Mobile/Desktop)
  const handleTouchOrMouseDown = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onUp = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, dragOffset]);

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
      {/* Draggable, Perfect Circle, Deep Blue Floating Button with Smooth Slow Green Glow */}
      <div
        style={
          position
            ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' }
            : { bottom: '28px', right: '28px' }
        }
        className="fixed z-50 cursor-pointer select-none touch-none group"
        onMouseDown={(e) => handleTouchOrMouseDown(e.clientX, e.clientY, e.currentTarget)}
        onTouchStart={(e) => {
          if (e.touches[0]) handleTouchOrMouseDown(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
        }}
      >
        <button
          onClick={() => {
            if (!isDragging) setIsOpen(!isOpen);
          }}
          style={{
            animation: 'slowGreenPulse 3.5s infinite ease-in-out',
          }}
          className="w-20 h-20 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-full flex flex-col items-center justify-center p-2 transition-all duration-300 transform group-hover:scale-105 border-2 border-emerald-500/60 shadow-xl"
        >
          <svg
            className="w-5 h-5 text-emerald-400 mb-0.5 transition-transform duration-300 group-hover:rotate-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="italic font-extrabold text-[12px] text-white tracking-wide leading-none">
            use ai
          </span>
        </button>

        {/* CSS Keyframe Animation for Very Slow, Elegant Green Pulse */}
        <style jsx>{`
          @keyframes slowGreenPulse {
            0% {
              box-shadow: 0 0 8px rgba(16, 185, 129, 0.25), 0 0 0 0 rgba(16, 185, 129, 0.3);
            }
            50% {
              box-shadow: 0 0 22px rgba(16, 185, 129, 0.75), 0 0 0 10px rgba(16, 185, 129, 0);
            }
            100% {
              box-shadow: 0 0 8px rgba(16, 185, 129, 0.25), 0 0 0 0 rgba(16, 185, 129, 0);
            }
          }
        `}</style>
      </div>

      {/* Main Configuration Modal */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-[400px] max-w-[92vw] bg-[#0A0D14] text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#111622] border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm tracking-wider uppercase text-emerald-400">AI Professional Suite</h3>
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
                  className="w-full bg-[#111622] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
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
                  className="w-full bg-[#111622] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
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
                  className="w-full bg-[#111622] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
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
                  className="w-full bg-[#111622] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* OPTIONAL SECTION 1: Entry Digit Condition Toggle */}
            <div className="border border-gray-800 rounded-xl p-3 bg-[#111622]/60">
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
                    showEntryConfig ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
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
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none text-sm"
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
                className="w-full bg-[#111622] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </div>

            {/* OPTIONAL SECTION 2: Recovery Settings Toggle */}
            <div className="border border-gray-800 rounded-xl p-3 bg-[#111622]/60">
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
                    showRecoveryConfig ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
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
                      className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none text-sm"
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
                      className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Take Profit & Stop Loss */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-emerald-400 mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  disabled={isTrading}
                  value={settings.takeProfit}
                  onChange={(e) => setSettings({ ...settings, takeProfit: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#111622] border border-emerald-900/50 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-rose-400 mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  disabled={isTrading}
                  value={settings.stopLoss}
                  onChange={(e) => setSettings({ ...settings, stopLoss: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#111622] border border-rose-900/50 rounded-lg px-3 py-2 text-white focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-[#111622] rounded-xl p-3 border border-gray-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Trades: <strong className="text-white">{stats.totalTrades}</strong></span>
                <span className="text-emerald-400">Wins: <strong>{stats.wins}</strong></span>
                <span className="text-rose-400">Losses: <strong>{stats.losses}</strong></span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-gray-800">
                <span className="text-gray-400">Net P/L:</span>
                <span className={`font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${stats.totalProfit.toFixed(2)}
                </span>
              </div>
              {stats.isRecovering && (
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider text-center pt-1 animate-pulse">
                  ⚠️ Recovery Strategy Active
                </div>
              )}
            </div>

            {/* Log Terminal */}
            <div className="p-3 bg-black border border-gray-800 rounded-lg font-mono text-xs text-emerald-300 min-h-[48px] flex items-center">
              {log}
            </div>

            {/* Action Button: CLICK TO TRADE / CLICK TO STOP */}
            <button
              onClick={handleToggleTrade}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-lg ${
                isTrading
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
