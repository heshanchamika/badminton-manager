"use client";

import React from "react";
import { SplitSummary } from "@/types/badminton";
import { Check, Share2, Wallet } from "lucide-react";

interface SplitResultsCardProps {
  summary: SplitSummary;
  onCopy: () => void;
}

export const SplitResultsCard: React.FC<SplitResultsCardProps> = ({ summary, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Amount to Collect</h3>
            <p className="text-xs text-slate-500 font-medium">
              Rate: ~{summary.costPerHour.toLocaleString()} LKR / hour
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Copy for WhatsApp</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {summary.results.map((result) => (
          <div
            key={result.id}
            className="p-3 rounded-xl bg-white border border-slate-100 shadow-xs hover:border-slate-200 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 capitalize text-sm">
                  {result.name}
                </span>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {result.hours} hrs
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-blue-600">
                  {result.amount.toLocaleString()}{" "}
                  <span className="text-xs font-semibold text-slate-500">LKR</span>
                </span>
              </div>
            </div>

            {/* Percentage Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, result.percentage))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Total Players: <strong>{summary.results.length}</strong>
        </span>
        <span>
          Total Sum:{" "}
          <strong className="text-slate-800">
            {summary.results.reduce((a, b) => a + b.amount, 0).toLocaleString()} LKR
          </strong>
        </span>
      </div>
    </div>
  );
};
