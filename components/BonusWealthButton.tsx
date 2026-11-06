"use client";

import React from "react";

export default function BonusWealthButton() {
  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 flex items-center justify-center">
        {/* Pulsing background ring effect (made slower with a 3s duration) */}
        <div 
          className="absolute w-16 h-16 bg-red-500 rounded-full animate-ping opacity-75 pointer-events-none"
          style={{ animationDuration: "3s" }}
        ></div>

        {/* Main Floating Button (Smaller and compact for mobile screens) */}
        <a
          href="https://naizora-wealthrise.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-16 h-16 bg-red-600 text-white text-center font-bold text-[10px] leading-tight p-1 rounded-full shadow-2xl hover:bg-red-700 transition-transform transform hover:scale-110 animate-bounce cursor-pointer border-2 border-white"
          style={{
            boxShadow: "0 0 15px rgba(239, 68, 68, 0.8)",
          }}
        >
          Bonus Wealth
        </a>
      </div>
    </>
  );
}
