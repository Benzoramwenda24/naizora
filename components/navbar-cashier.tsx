// components/navbar-cashier.tsx
'use client';

import React from 'react';

export default function NavbarCashierButtons() {
  const DERIV_APP_ID = '34MZuYRMbUoTUHnkqhRuv';

  // Direct URLs to Deriv App Cashier with your App ID attached
  const depositUrl = `https://app.deriv.com/cashier/deposit?app_id=${DERIV_APP_ID}`;
  const withdrawalUrl = `https://app.deriv.com/cashier/withdrawal?app_id=${DERIV_APP_ID}`;

  const handleAction = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <style>{`
        @keyframes depositPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes withdrawPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      <div className="flex items-center gap-3">
        {/* Deposit Button (Red / Danger) */}
        <button
          onClick={() => handleAction(depositUrl)}
          style={{ animation: 'depositPulse 2.5s infinite' }}
          className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 border border-red-400/50 rounded-xl shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          {/* Deposit Arrow Icon */}
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          Deposit
        </button>

        {/* Withdrawal Button (Green / Success) */}
        <button
          onClick={() => handleAction(withdrawalUrl)}
          style={{ animation: 'withdrawPulse 2.5s infinite' }}
          className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-400/50 rounded-xl shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          {/* Withdrawal Arrow Icon */}
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Withdraw
        </button>
      </div>
    </>
  );
}
