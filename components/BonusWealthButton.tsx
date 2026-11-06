"use client";

import React, { useState, useRef } from "react";

export default function BonusWealthButton() {
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pointerStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    // Check if the user moved more than 5 pixels to count it as a drag
    const moveDistance = Math.hypot(
      e.clientX - pointerStartPos.current.x,
      e.clientY - pointerStartPos.current.y
    );

    if (moveDistance > 5) {
      hasMoved.current = true;
    }

    const newX = Math.max(10, Math.min(window.innerWidth - 70, e.clientX - dragStart.current.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 70, e.clientY - dragStart.current.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <>
      <div
        className="fixed z-50 flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing"
        style={{
          left: `${position.x}px`,
          bottom: `${position.y}px`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Pulsing background ring effect to entice clicks */}
        <div className="absolute w-14 h-14 bg-red-500 rounded-full animate-ping opacity-75 pointer-events-none"></div>

        {/* Main Floating Button */}
        <a
          href="https://naizora-wealthrise.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            // Only block navigation if the user actually dragged the button around
            if (hasMoved.current) {
              e.preventDefault();
            }
          }}
          className="relative flex items-center justify-center w-14 h-14 bg-red-600 text-white text-center font-bold text-[9px] leading-tight p-1 rounded-full shadow-2xl hover:bg-red-700 transition-transform transform hover:scale-105 animate-bounce cursor-pointer border-2 border-white overflow-hidden"
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
