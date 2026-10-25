// components/ai-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function AIModal() {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Your Official Deriv API App ID with 3% Markup configuration for commissions
  const DERIV_APP_ID = '34KU2t7T2qJh7u1Pi6p5Y';

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

  // Precise session check for Naizora / Deriv login state
  const getSessionData = () => {
    if (typeof window === 'undefined') return { token: '', loginid: '', isLoggedIn: false };
    
    try {
      const activeLoginid = localStorage.getItem('active_loginid');
      const clientAccountsStr = localStorage.getItem('client.accounts');
      
      if (clientAccountsStr && activeLoginid) {
        const accounts = JSON.parse(clientAccountsStr);
        if (accounts[activeLoginid] && accounts[activeLoginid].token) {
          return {
            token: accounts[activeLoginid].token,
            loginid: activeLoginid,
            isLoggedIn: true,
          };
        }
      }
      
      // Fallback check for any active login ID or token
      if (activeLoginid || localStorage.getItem('token') || localStorage.getItem('config.token')) {
        return {
          token: localStorage.getItem('token') || localStorage.getItem('config.token') || '',
          loginid: activeLoginid || 'CR001',
          isLoggedIn: true,
        };
      }
    } catch (e) {}

    return { token: '', loginid: '', isLoggedIn: false };
  };

  const handleButtonClick = () => {
    if (isDragging) return;

    const session = getSessionData();

    if (!session.isLoggedIn) {
      // NOT LOGGED IN: Block them and show the login requirement popup
      setShowAuthPrompt(true);
    } else {
      // LOGGED IN: Open DBot immediately in a new tab with App ID & session token for commissions
      setShowAuthPrompt(false);
      let dbotUrl = `https://bot.deriv.com/?app_id=${DERIV_APP_ID}`;
      if (session.token) {
        dbotUrl += `&token=${session.token}&acct1=${session.loginid}`;
      }
      window.open(dbotUrl, '_blank');
    }
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

      {/* Auth Prompt Modal (Shown ONLY for visitors who are NOT logged in) */}
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg"
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
