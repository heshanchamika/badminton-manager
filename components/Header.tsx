"use client";

import React from "react";
import { Users, RotateCcw, Cloud, CloudCheck, Loader2 } from "lucide-react";
import { SyncStatus } from "@/types/badminton";

interface HeaderProps {
  playerCount: number;
  syncStatus: SyncStatus;
  hasUnsavedChanges: boolean;
  lastSavedTime: string | null;
  onReset: () => void;
  onSaveSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  playerCount,
  syncStatus,
  hasUnsavedChanges,
  lastSavedTime,
  onReset,
  onSaveSession,
}) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return null;
    }
  };

  const formattedTime = lastSavedTime ? formatTime(lastSavedTime) : null;

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-2xl select-none">
            🏸
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Badminton Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Fair Court Splits & Smart Doubles Rotation
            </p>
          </div>
        </div>

        {/* Action Buttons: Save to Cloud & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveSession}
            disabled={syncStatus === "saving" || syncStatus === "loading"}
            title={
              hasUnsavedChanges
                ? "You have unsaved changes. Click to save to Firebase."
                : "Session is saved to cloud."
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
              syncStatus === "saving"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : hasUnsavedChanges
                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs ring-1 ring-amber-300/60"
                : syncStatus === "saved"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            {syncStatus === "saving" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Save</span>
              </>
            ) : syncStatus === "saved" ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Saved {formattedTime ? `(${formattedTime})` : ""}</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Save</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            title="Reset to initial defaults"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/60 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/60">
            <Users className="w-3 h-3" />
            {playerCount} Players active
          </span>
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              ● Unsaved changes
            </span>
          )}
        </div>

        {formattedTime && !hasUnsavedChanges && (
          <span className="text-[11px] text-slate-400">
            Cloud synced: {formattedTime}
          </span>
        )}
      </div>
    </header>
  );
};
