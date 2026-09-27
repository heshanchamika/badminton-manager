"use client";

import React from "react";
import { CloudUpload, Undo2, Loader2 } from "lucide-react";
import { SyncStatus } from "@/types/badminton";

interface UnsavedChangesPromptProps {
  hasUnsavedChanges: boolean;
  syncStatus: SyncStatus;
  onSave: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesPrompt: React.FC<UnsavedChangesPromptProps> = ({
  hasUnsavedChanges,
  syncStatus,
  onSave,
  onDiscard,
}) => {
  if (!hasUnsavedChanges) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900/95 text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center justify-between gap-3">
        {/* Notice Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              Unsaved changes detected
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              Would you like to save this session?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onDiscard}
            title="Discard current unsaved changes"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Discard</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={syncStatus === "saving"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {syncStatus === "saving" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
