"use client";

import React from "react";

// Live 3% Markup Deriv Bot Platform
const LIVE_BOT_URL = "https://naizoraai-benzoramwenda24-4891.vercel.app";

interface AIModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen = true, onClose }) => {
  const handleLaunchBot = () => {
    window.open(LIVE_BOT_URL, "_blank", "noopener,noreferrer");
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xl font-bold tracking-tight">NAiZORA AI Trading Suite</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-xl font-semibold px-2"
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Access automated synthetic indices trading strategies, real-time analytics, and automated bot execution powered by NAiZORA AI.
          </p>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Platform</span>
              <span className="text-emerald-400 font-medium">Deriv DBot Engine</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Status</span>
              <span className="text-slate-200">Live & Ready</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleLaunchBot}
            className="w-full py-3 px-5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 text-center cursor-pointer"
          >
            Launch Trading Suite 🚀
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-5 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors text-center"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIModal;
