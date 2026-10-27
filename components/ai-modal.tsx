"use client";

import React, { useEffect } from "react";

// Live 3% Markup Deriv Bot Platform
const LIVE_BOT_URL = "https://naizoraai-benzoramwenda24-4891.vercel.app";

interface AIModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen = false, onClose }) => {
  useEffect(() => {
    // If triggered to open, instantly open the bot in a new tab and close this modal state
    if (isOpen) {
      window.open(LIVE_BOT_URL, "_blank", "noopener,noreferrer");
      if (onClose) onClose();
    }
  }, [isOpen, onClose]);

  // Returns nothing so it never renders a popup box on your homepage
  return null;
};

export default AIModal;
