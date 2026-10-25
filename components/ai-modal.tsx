// components/ai-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function AIModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Auto-dismiss auth notification prompt after 10 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAuthPrompt) {
      timer = setTimeout(() => {
        setShowAuthPrompt(false);
      }, 10000);
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

  const handleButtonClick = () => {
    if (isDragging) return;

    // Check if user is logged into the site
    const activeLogin = typeof window !== 'undefined' ? localStorage.getItem('active_loginid') : null;
    const clientAccounts = typeof window !== 'undefined' ? localStorage.getItem('client.accounts') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('config.token') || localStorage.getItem('user_token') : null;

    const userAuthenticated = Boolean(
      (activeLogin && activeLogin.trim() !== '') ||
      (clientAccounts && clientAccounts.length > 5) ||
      (token && token.trim() !== '')
    );

    if (!userAuthenticated) {
      setIsOpen(false);
      setShowAuthPrompt(true); // Show notification prompt if not logged in
    } else {
      setShowAuthPrompt(false);
      setIsOpen(!isOpen); // Open centered DBot modal if logged in
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

      {/* Auto-Dismissing Authentication Notification Prompt */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0A0D14] border border-emerald-500/40 rounded-2xl p-6 text-white text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0B192C] border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 font-bold text-lg shadow-md">
              AI
            </div>
            <h3 className="font-bold text-lg text-emerald-400">Authentication Required</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Please click the <strong className="text-emerald-400">Log in</strong> button on the top right side of our website to continue using the AI trading assistant.
            </p>
            <p className="text-[10px] text-gray-500 italic">This notification will close automatically in 10 seconds.</p>
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="w-full py-2.5 bg-[#111622] hover:bg-gray-800 text-gray-300 rounded-xl font-bold text-xs tracking-wide transition-all border border-gray-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Centered Large DBot Workspace Modal (For Logged-in Users) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-5xl h-[85vh] bg-[#0A0D14] text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#111622] border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-sm tracking-wider uppercase text-emerald-400">Deriv DBot Studio (On-Site Workspace)</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.open('https://bot.deriv.com', '_blank')}
                  className="text-xs bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-all font-medium"
                >
                  Pop Out ↗
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-gray-400 hover:text-white text-xl font-bold px-2 py-0.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Embedded DBot Iframe Container */}
            <div className="flex-1 w-full bg-black relative">
              <iframe
                src="https://bot.deriv.com"
                className="w-full h-full border-0"
                title="Deriv DBot"
                loading="lazy"
              />
            </div>

            {/* Footer Note */}
            <div className="px-6 py-3 bg-[#111622] border-t border-gray-800 text-xs text-gray-400 flex justify-between items-center">
              <span>Configure your strategies, set parameters, and execute trades comfortably.</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Active Trading Session
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
