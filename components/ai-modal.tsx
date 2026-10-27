"use client";

import React from "react";

// Live 3% Markup Deriv Bot Platform
const LIVE_BOT_URL = "https://naizoraai-benzoramwenda24-4891.vercel.app";

interface AIModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen = false, onClose }) => {
  const handleOpenBot = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(LIVE_BOT_URL, "_blank", "noopener,noreferrer");
    if (onClose) onClose();
  };

  if (!isOpen) {
    // Renders the standard button/trigger so it stays right where it was in your UI
    return (
      <button
        onClick={handleOpenBot}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md cursor-pointer"
      >
        <span>Use AI</span>
        <span>🚀</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold">NAiZORA AI Trading Suite</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2 text-lg font-bold"
            >
              ✕
            </button>
          )}
        </div>
        <div className="py-6 space-y-4 text-center">
          <p className="text-slate-300 text-sm">
            Launch your automated synthetic indices trading platform in a new window.
          </p>
          <button
            onClick={handleOpenBot}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg cursor-pointer"
          >
            Open Bot Platform 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
