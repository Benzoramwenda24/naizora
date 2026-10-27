"use client";

import React, { useState } from "react";

// Live 3% Markup Deriv Bot Platform
const LIVE_BOT_URL = "https://naizoraai-benzoramwenda24-4891.vercel.app";

interface AIModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen = false, onClose }) => {
  const [modalOpen, setModalOpen] = useState(isOpen);

  const handleButtonClick = () => {
    // Opens your custom bot platform directly in a new tab
    window.open(LIVE_BOT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Original blinking/glowing Use AI Button */}
      <button
        onClick={handleButtonClick}
        className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/30 animate-pulse cursor-pointer"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-white animate-ping" />
        <span>Use AI</span>
      </button>

      {/* Modal fallback if explicitly called */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold">NAiZORA AI Trading Suite</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white px-2 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="py-6 space-y-4 text-center">
              <p className="text-slate-300 text-sm">
                Launch your automated synthetic indices trading platform in a new window.
              </p>
              <button
                onClick={handleButtonClick}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg cursor-pointer"
              >
                Open Bot Platform 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export direct export default AIModal;
export default AIModal;
