// components/ai-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function AIModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Your Official Deriv API App ID with 3% Markup configuration
  const DERIV_APP_ID = '34KU2t7T2qJh7u1Pi6p5Y';

  // Auto-dismiss auth prompt after 8 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAuthPrompt) {
      timer = setTimeout(() => {
        setShowAuthPrompt(false);
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [showAuthPrompt]);

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

  const getToken = (): { token: string; loginid: string } => {
    if (typeof window === 'undefined') return { token: '', loginid: '' };
    try {
      const activeLoginid = localStorage.getItem('active_loginid');
      const clientAccountsStr = localStorage.getItem('client.accounts');
      if (clientAccountsStr && activeLoginid) {
        const accounts = JSON.parse(clientAccountsStr);
        if (accounts[activeLoginid] && accounts[activeLoginid].token) {
          return { token: accounts[activeLoginid].token, loginid: activeLoginid };
        }
      }
      if (clientAccountsStr) {
        const accounts = JSON.parse(clientAccountsStr);
        const firstKey = Object.keys(accounts)[0];
        if (firstKey && accounts[firstKey].token) {
          return { token: accounts[firstKey].token, loginid: firstKey };
        }
      }
    } catch (e) {}

    const directToken = localStorage.getItem('config.token') || localStorage.getItem('user_token') || localStorage.getItem('token') || '';
    const directLoginid = localStorage.getItem('active_loginid') || '';
    return { token: directToken, loginid: directLoginid };
  };

  const handleButtonClick = () => {
    if (isDragging) return;

    // Strict check: verify if user is logged into Naizora
    const { token } = getToken();
    const isLoggedin = Boolean(token && token.trim() !== '');

    if (!isLoggedin) {
      // If NOT logged in, block access and show Naizora login prompt instead of redirecting
      setIsOpen(false);
      setShowAuthPrompt(true);
    } else {
      // If LOGGED IN, open the DBot Launch Hub normally
      setShowAuthPrompt(false);
      setIsOpen(!isOpen);
    }
  };

  const handleLaunchDBot = () => {
    const { token, loginid } = getToken();
    
    // Directs to DBot with App ID and user session token for auto-login & commission tracking
    let dbotUrl = `https://bot.deriv.com/?app_id=${DERIV_APP_ID}`;
    if (token) {
      dbotUrl += `&token=${token}&acct1=${loginid}`;
    }

    window.open(dbotUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      <style>{`
        @keyframes slowGreenPulse {
          0% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.25), 0 0 0 0 rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 22px rgba(16, 185, 129, 0.75), 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.25), 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      {/* Draggable Floating Button */}
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
      </div>

      {/* Naizora Authentication Prompt Modal (Shown only if user is NOT logged in) */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0A0D14] border border-emerald-500/40 rounded-2xl p-6 text-white text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0B192C] border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 font-bold text-lg shadow-md">
              AI
            </div>
            <h3 className="font-bold text-lg text-emerald-400">Naizora Account Required</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Please log in to your <strong className="text-emerald-400">Naizora</strong> account before launching the AI trading assistant.
            </p>
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* DBot Studio Hub Modal (Shown ONLY for Logged-in Users) */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-[380px] max-w-[92vw] bg-[#0A0D14] text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden backdrop-blur-md animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#111622] border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm tracking-wider uppercase text-emerald-400">Naizora AI Trading Hub</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
          </div>

          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-[#0B192C] border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-base text-white">Launch Fresh DBot Workspace</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Open the official Deriv DBot builder in a clean new tab. Your session is connected and secured automatically.
              </p>
            </div>

            <button
              onClick={handleLaunchDBot}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <span>Launch DBot Studio ↗</span>
            </button>

            <p className="text-[10px] text-gray-500 italic">
              Secured under Deriv API App ID: {DERIV_APP_ID}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
