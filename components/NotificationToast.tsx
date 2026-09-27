"use client";

import React from "react";
import { Info } from "lucide-react";

interface NotificationToastProps {
  message: string | null;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300">
      <div className="flex items-center gap-2 bg-slate-900/95 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md border border-slate-700">
        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};
