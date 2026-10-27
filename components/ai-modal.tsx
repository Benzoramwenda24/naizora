"use client";

import React, { useState, useRef } from "react";

// Live 3% Markup Deriv Bot Platform
const LIVE_BOT_URL = "https://naizoraai-benzoramwenda24-4891.vercel.app";

interface AIModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AIModal: React.FC<AIModalProps> = () => {
  const [position, setPosition] = useState({ x: window.innerWidth - 90, y: window.innerHeight - 140 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false });

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.hasMoved = true;
    }

    setPosition({
      x: Math.max(20, Math.min(window.innerWidth - 80, dragRef.current.initialX + dx)),
      y: Math.max(20, Math.min(window.innerHeight - 80, dragRef.current.initialY + dy)),
    });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // If it wasn't dragged, treat it as a click to open the bot
    if (!dragRef.current.hasMoved) {
      window.open(LIVE_BOT_URL, "_blank", "noopener,noreferrer");
    }
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleTouchMove(e);
    const onMouseUp = () => handleTouchEnd();
    const onTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const onTouchEnd = () => handleTouchEnd();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging]);

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 cursor-pointer select-none touch-none"
      onMouseDown={handleTouchStart}
      onTouchStart={handleTouchStart}
    >
      {/* Glowing Floating Round Button */}
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-2xl shadow-emerald-500/50 animate-pulse hover:scale-110 transition-transform">
        <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping opacity-75 pointer-events-none" />
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-xs font-black tracking-tighter leading-none">USE</span>
          <span className="text-xs font-black tracking-tighter leading-none">AI</span>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
