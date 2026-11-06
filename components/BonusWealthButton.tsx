"use client";

import React from "react";

export default function BonusWealthButton() {
  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 flex items-center justify-center">
        {/* Pulsing background ring effect to entice clicks */}
        <div className="absolute w-24 h-24 bg-red-500 rounded-full animate-ping opacity-75 pointer-events-none"></div>

        {/* Main Floating Button */}
        <a
          href="https://naizora-wealthrise.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-24 h-24 bg-red-600 text-white text-center font-bold text-xs p-2 rounded-full shadow-2xl hover:bg-red-700 transition-transform transform hover:scale-110 animate-bounce cursor-pointer border-2 border-white"
          style={{
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.8)",
          }}
        >
          Bonus Wealth Rise
        </a>
      </div>
    </>
  );
}
