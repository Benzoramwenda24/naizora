// components/ai-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AITradingEngine, AISettings, TradeStats, TradeCategory } from '@/lib/ai-engine';

export default function AIModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [log, setLog] = useState<string>('Configure your AI settings and click trade.');

  // Check authentication status on mount and storage changes
  useEffect(() => {
    const checkAuth = () => {
      // Check standard Deriv / White-label session storage keys
      const activeLogin = localStorage.getItem('active_loginid') || localStorage.getItem('client.accounts');
      const token = localStorage.getItem('config.token') || localStorage.getItem('user_token');
      
      // Also check if any key in localStorage contains active user data or tokens
      const hasAuthData = Object.keys(localStorage).some(
        (key) => (key.includes('token') || key.includes('client') || key.includes('account')) && localStorage.getItem(key)
      );

      const userIsAuth = Boolean(activeLogin || token || hasAuthData);
      setIsLoggedIn(userIsAuth);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  // Check authentication status on mount and storage changes
  useEffect(() => {
    const checkAuth = () => {
      // Check standard Deriv / White-label session storage keys
      const activeLogin = localStorage.getItem('active_loginid') || localStorage.getItem('client.accounts');
      const token = localStorage.getItem('config.token') || localStorage.getItem('user_token');
      
      // Also check if any key in localStorage contains active user data or tokens
      const hasAuthData = Object.keys(localStorage).some(
        (key) => (key.includes('token') || key.includes('client') || key.includes('account')) && localStorage.getItem(key)
      );

      const userIsAuth = Boolean(activeLogin || token || hasAuthData);
      setIsLoggedIn(userIsAuth);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // User Settings State
  const [settings, setSettings] = useState<AISettings>({
    symbol: 'R_100',
    stake: 10,
    tradeType: 'MATCHES',
    barrier: 5,
    useEntryCondition: true,
    entryDigit: 5,
    martingaleMultiplier: 2.0,
    takeProfit: 50,
    stopLoss: 20,
    useRecovery: true,
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

  // Check authentication status on mount and storage changes
  useEffect(() => {
    const checkAuth = () => {
      const activeLogin = localStorage.getItem('active_loginid');
      const hasToken = Object.keys(localStorage).some((k) => k.includes('token') || k.includes('client'));
      setIsLoggedIn(Boolean(activeLogin || hasToken));
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Handle Dragging (Mouse & Touch support)
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

  const handleButtonClick = () => {
    if (isDragging) return;
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

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
      {/* Draggable, Perfect Circle, Deep Blue Floating Button with Slow Green Glow */}
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
          onClick={handleButtonClick}
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

      {/* Authentication Prompt Modal (When Signed Out) */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0A0D14] border border-emerald-500/40 rounded-2xl p-6 text-white text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0B192C] border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 font-bold text-lg">
              AI
            </div>
            <h3 className="font-bold text-lg text-emerald-400">Authentication Required</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              You must be signed in to your account to configure and run the AI Trading Assistant. Please sign in or sign up to continue.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setShowAuthPrompt(false);
                  const loginBtn = document.querySelector('button[class*="login"], a[href*="login"]') as HTMLElement;
                  if (loginBtn) loginBtn.click();
                  else window.location.href = '/login';
                }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs tracking-wide transition-all"
              >
                Sign In / Up
              </button>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="py-2.5 bg-[#111622] hover:bg-gray-800 text-gray-300 rounded-xl font-bold text-xs tracking-wide transition-all border border-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Configuration Modal */}
      {isOpen && isLoggedIn && (
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
                  className="w-full bg-[#111622] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none text-xs"
                >
                  <option value="R_100">Volatility 100 Index</option>
                  <option value="1HZ100V">Volatility 100 (1s)</option>
                  <option value="R_75">Volatility 75 Index</option>
                  <option value="1HZ75V">Volatility 75 (1s)</option>
                  <option value="R_50">Volatility 50 Index</option>
                  <option value="1HZ50V">Volatility 50 (1s)</option>
                  <option value="R_25">Volatility 25 Index</option>
                  <option value="1HZ25V">Volatility 25 (1s)</option>
                  <option value="R_10">Volatility 10 Index</option>
                  <option value="1HZ10V">Volatility 10 (1s)</option>
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

            {/* Entry Digit Filter Condition */}
            <div className="border border-emerald-900/50 rounded-xl p-3 bg-[#111622]/60">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold text-emerald-400">Entry Digit Filter Signal</span>
                  <p className="text-[10px] text-gray-400">Execute trade strictly when entry digit hits</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 text-[10px] font-bold">ACTIVE</span>
              </div>
              <div className="pt-2 border-t border-gray-800">
                <label className="block text-xs text-gray-400 mb-1">Target Entry Digit (0-9):</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  disabled={isTrading}
                  value={settings.entryDigit}
                  onChange={(e) => setSettings({ ...settings, entryDigit: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none text-sm font-bold text-emerald-300"
                />
              </div>
            </div>

            {/* Martingale Multiplier & Instant Recovery */}
            <div className="grid grid-cols-2 gap-3">
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
              <div className="flex flex-col justify-end">
                <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-lg px-3 py-2 text-center">
                  <span className="text-[10px] text-emerald-400 font-bold block">INSTANT RECOVERY</span>
                  <span className="text-[10px] text-gray-300">Same trade type on loss</span>
                </div>
              </div>
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
                  ⚠️ Recovery Active (Stake: ${stats.currentStake.toFixed(2)})
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
