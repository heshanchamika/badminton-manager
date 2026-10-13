"use client";

import React, { useState, useRef, useEffect } from "react";
import { RoundMatch, PlayerMatchStats } from "@/types/badminton";
import { FairnessStats } from "./FairnessStats";
import { Share2, Check, Download, Loader2, LayoutList, Table2 } from "lucide-react";
import { toBlob, toPng } from "html-to-image";

interface RoundsDisplayProps {
  rounds: RoundMatch[];
  stats: PlayerMatchStats[];
  onCopyRounds: () => void;
}

export const RoundsDisplay: React.FC<RoundsDisplayProps> = ({
  rounds,
  stats,
  onCopyRounds,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Check if multiple courts are present in rounds
  const hasMultipleCourts = rounds.some((r) => r.courtGames && r.courtGames.length > 1);
  const maxCourts = Math.max(1, ...rounds.map((r) => r.courtGames?.length || 1));
  const isMultiCourt = stats.length > 7 && maxCourts > 1;

  // Primary categorization: by Courts if > 7 players, else by Rounds
  const [categorizeBy, setCategorizeBy] = useState<"courts" | "rounds">(() =>
    isMultiCourt ? "courts" : "rounds"
  );
  const [selectedCourtTab, setSelectedCourtTab] = useState<"all" | number>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Keep categorization default updated when session changes between single and multi-court
  useEffect(() => {
    setCategorizeBy(stats.length > 7 && maxCourts > 1 ? "courts" : "rounds");
  }, [stats.length, maxCourts]);

  // Hidden off-screen ref specifically formatted for high-res social image exports
  const exportCardRef = useRef<HTMLDivElement>(null);

  const handleCopyText = () => {
    onCopyRounds();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Generates a high-quality PNG image and shares via Web Share API
   * or falls back to direct download & clipboard copy.
   */
  const handleShareImage = async (mode: "share" | "download" = "share") => {
    if (!exportCardRef.current || isSharing) return;

    setIsSharing(true);
    setStatusMessage("Generating match card...");

    try {
      // 1. Generate PNG blob with 2x retina sharpness
      const blob = await toBlob(exportCardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      if (!blob) throw new Error("Image generation failed");

      const fileName = `badminton-schedule-${rounds.length}rounds.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // 2. Check if mobile Web Share with file is supported and requested
      if (
        mode === "share" &&
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Badminton Match Schedule",
          text: `🏸 Badminton Match Schedule: ${rounds.length} Rounds`,
        });
        setStatusMessage("Shared successfully! 🏸");
      } else {
        // 3. Fallback or explicit download: download PNG file
        const dataUrl = await toPng(exportCardRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });

        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Try copying image directly to clipboard for instant pasting into WhatsApp Web
        let copiedToClipboard = false;
        try {
          if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            copiedToClipboard = true;
          }
        } catch {
          // Clipboard write might be restricted in some browser contexts
        }

        if (copiedToClipboard) {
          setStatusMessage("✅ Image saved & copied to clipboard! Paste directly in WhatsApp.");
        } else {
          setStatusMessage("✅ Image downloaded! Ready to share on WhatsApp.");
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        console.error("Failed to export image:", err);
        setStatusMessage("Could not generate image. Please try again.");
      }
    } finally {
      setIsSharing(false);
      setTimeout(() => setStatusMessage(null), 4500);
    }
  };

  return (
    <div className="mt-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {categorizeBy === "courts" ? "Court Schedules" : "Suggested Rounds"}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {rounds.length} {rounds.length === 1 ? "Round" : "Rounds"} scheduled
            {hasMultipleCourts && ` • ${maxCourts} Courts`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Categorization Switcher (Courts vs Rounds) if multi-court */}
          {hasMultipleCourts && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => setCategorizeBy("courts")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  categorizeBy === "courts"
                    ? "bg-white text-emerald-800 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Categorize by Courts"
              >
                <span>🏟️ Courts</span>
              </button>
              <button
                type="button"
                onClick={() => setCategorizeBy("rounds")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  categorizeBy === "rounds"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Categorize by Rounds"
              >
                <span>🔄 Rounds</span>
              </button>
            </div>
          )}

          {/* Copy Text Button */}
          <button
            type="button"
            onClick={handleCopyText}
            title="Copy text breakdown"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fairness stats */}
      {stats.length > 0 && <FairnessStats stats={stats} />}

      {/* ========================================================== */}
      {/* OPTION A: CATEGORIZED BY COURTS (> 7 players / multi-court) */}
      {/* ========================================================== */}
      {categorizeBy === "courts" && hasMultipleCourts ? (
        <div className="space-y-4 mb-4">
          {/* Court Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCourtTab("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCourtTab === "all"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Courts ({maxCourts})
            </button>
            {Array.from({ length: maxCourts }).map((_, c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCourtTab(c + 1)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCourtTab === c + 1
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Court {c + 1}
              </button>
            ))}
          </div>

          {/* Individual Court Cards */}
          {Array.from({ length: maxCourts }).map((_, c) => {
            const courtNum = c + 1;
            if (selectedCourtTab !== "all" && selectedCourtTab !== courtNum) return null;

            return (
              <div
                key={courtNum}
                className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Court Banner */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏟️</span>
                    <h4 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase">
                      Court {courtNum} Schedule
                    </h4>
                  </div>
                  <span className="text-[11px] bg-emerald-950/40 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold border border-emerald-600/50">
                    {rounds.length} Matches
                  </span>
                </div>

                {/* Match List for this Court */}
                <div className="p-2.5 sm:p-3 space-y-2">
                  {rounds.map((round) => {
                    const game =
                      round.courtGames && round.courtGames[c]
                        ? round.courtGames[c]
                        : c === 0
                        ? {
                            courtNumber: 1,
                            courtName: "Court 1",
                            team1: round.team1,
                            team2: round.team2,
                          }
                        : null;

                    if (!game) return null;

                    return (
                      <div
                        key={round.roundNumber}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors"
                      >
                        {/* Round Badge */}
                        <div className="shrink-0 flex items-center justify-center w-12 py-1 rounded-md bg-slate-900 text-white font-black text-xs">
                          RND {round.roundNumber}
                        </div>

                        {/* Matchup */}
                        <div className="flex-1 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
                          {/* Team 1 */}
                          <div className="flex-1 flex items-center justify-center text-center px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-900 font-bold text-xs sm:text-sm capitalize shadow-2xs leading-snug">
                            <span>
                              {game.team1[0]} &amp; {game.team1[1]}
                            </span>
                          </div>

                          {/* VS */}
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white border border-slate-200 shadow-2xs">
                            VS
                          </span>

                          {/* Team 2 */}
                          <div className="flex-1 flex items-center justify-center text-center px-2 py-1.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-900 font-bold text-xs sm:text-sm capitalize shadow-2xs leading-snug">
                            <span>
                              {game.team2[0]} &amp; {game.team2[1]}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Resting Players by Round Schedule */}
          {selectedCourtTab === "all" && (
            <>
              {rounds.some((r) => r.resting.length > 0) ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-100/70 border-b border-amber-200 text-amber-900 font-bold text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>💤</span>
                      <span>Resting Rotation by Round</span>
                    </div>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Sit out &amp; recharge
                    </span>
                  </div>

                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rounds.map((round) => (
                      <div
                        key={round.roundNumber}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-amber-200/80 text-xs shadow-2xs"
                      >
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-black text-[11px] shrink-0">
                          RND {round.roundNumber}
                        </span>
                        {round.resting.length > 0 ? (
                          <span className="font-semibold text-amber-900 capitalize truncate">
                            {round.resting.join(", ")}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-xs">
                            ✨ All Playing
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs">
                  <span>✨</span>
                  <span>All {stats.length} players active every round (no resting needed).</span>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* ========================================================== */
        /* OPTION B: CATEGORIZED BY ROUNDS (<= 7 players or toggled)  */
        /* ========================================================== */
        <div className="space-y-3 mb-4">
          {rounds.map((round) => {
            const games =
              round.courtGames && round.courtGames.length > 0
                ? round.courtGames
                : [
                    {
                      courtNumber: 1,
                      courtName: "Court 1",
                      team1: round.team1,
                      team2: round.team2,
                    },
                  ];

            return (
              <div
                key={round.roundNumber}
                className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Round Header Bar */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-black text-xs tracking-wide">
                      ROUND {round.roundNumber}
                    </span>
                    {hasMultipleCourts && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {games.length} Courts
                      </span>
                    )}
                  </div>

                  {/* Resting status right on top */}
                  {round.resting.length > 0 ? (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/90 text-amber-800 text-[11px] font-semibold">
                      <span>💤</span>
                      <span className="text-amber-700 font-bold">Resting:</span>
                      <span className="capitalize">{round.resting.join(", ")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                      <span>✨ All Playing</span>
                    </div>
                  )}
                </div>

                {/* Matchups Container */}
                <div className="p-2.5 sm:p-3 space-y-2">
                  {games.map((game, gIdx) => (
                    <div
                      key={`${round.roundNumber}-game-${game.courtNumber || gIdx}`}
                      className="p-2 sm:p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/60 space-y-1.5"
                    >
                      {/* Court Indicator (if multiple courts) */}
                      {hasMultipleCourts && (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-2xs">
                            {game.courtName || `Court ${game.courtNumber}`}
                          </span>
                        </div>
                      )}

                      {/* Matchup: Team 1 VS Team 2 */}
                      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                        {/* Team 1 */}
                        <div className="flex-1 flex items-center justify-center text-center px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-900 font-bold text-xs sm:text-sm capitalize shadow-2xs leading-snug">
                          <span>
                            {game.team1[0]} &amp; {game.team1[1]}
                          </span>
                        </div>

                        {/* VS Badge */}
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white border border-slate-200 shadow-2xs">
                          VS
                        </span>

                        {/* Team 2 */}
                        <div className="flex-1 flex items-center justify-center text-center px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-900 font-bold text-xs sm:text-sm capitalize shadow-2xs leading-snug">
                          <span>
                            {game.team2[0]} &amp; {game.team2[1]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prominent Share & Download Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          type="button"
          onClick={() => handleShareImage("share")}
          disabled={isSharing}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        >
          {isSharing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Image...</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share Image to WhatsApp</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleShareImage("download")}
          disabled={isSharing}
          title="Download PNG image directly"
          className="flex items-center justify-center gap-1.5 px-3.5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      {/* Feedback notification status */}
      {statusMessage && (
        <div className="mt-2.5 p-2 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg animate-fade-in">
          {statusMessage}
        </div>
      )}

      {/* ========================================================== */}
      {/* HIDDEN PRECISE CARD: Offscreen template for high-res image */}
      {/* ========================================================== */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0px",
          width: "600px",
          zIndex: -999,
          pointerEvents: "none",
        }}
      >
        <div
          ref={exportCardRef}
          style={{
            width: "600px",
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: "#0f172a",
            boxSizing: "border-box",
          }}
        >
          {/* Card Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "2px solid #e2e8f0",
              paddingBottom: "14px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>🏸</span>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Badminton Match Schedule
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Fair Play Doubles Rotation
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#ecfdf5",
                color: "#047857",
                border: "1px solid #a7f3d0",
                padding: "5px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {rounds.length} Matches • {stats.length} Players{hasMultipleCourts ? ` • ${maxCourts} Courts` : ""}
            </div>
          </div>

          {/* If multi-court, export categorized by COURTS */}
          {categorizeBy === "courts" && hasMultipleCourts ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {Array.from({ length: maxCourts }).map((_, c) => {
                const courtNum = c + 1;
                return (
                  <div
                    key={courtNum}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Court Banner */}
                    <div
                      style={{
                        backgroundColor: "#065f46",
                        color: "#ffffff",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.03em" }}>
                        🏟️ COURT {courtNum} SCHEDULE
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#a7f3d0" }}>
                        {rounds.length} Matches
                      </span>
                    </div>

                    {/* Court Matches */}
                    <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {rounds.map((round) => {
                        const game =
                          round.courtGames && round.courtGames[c]
                            ? round.courtGames[c]
                            : c === 0
                            ? {
                                courtNumber: 1,
                                courtName: "Court 1",
                                team1: round.team1,
                                team2: round.team2,
                              }
                            : null;

                        if (!game) return null;

                        return (
                          <div
                            key={round.roundNumber}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              backgroundColor: "#f8fafc",
                              border: "1px solid #f1f5f9",
                              borderRadius: "8px",
                              padding: "5px 8px",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#0f172a",
                                color: "#ffffff",
                                padding: "2px 8px",
                                borderRadius: "5px",
                                fontSize: "11px",
                                fontWeight: 800,
                              }}
                            >
                              RND {round.roundNumber}
                            </span>

                            {/* Team 1 */}
                            <div
                              style={{
                                flex: 1,
                                backgroundColor: "#eff6ff",
                                color: "#1e40af",
                                border: "1px solid #bfdbfe",
                                padding: "5px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 700,
                                textAlign: "center",
                                textTransform: "capitalize",
                              }}
                            >
                              {game.team1[0]} &amp; {game.team1[1]}
                            </div>

                            {/* VS */}
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 900,
                                color: "#94a3b8",
                                padding: "2px 6px",
                                backgroundColor: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                              }}
                            >
                              VS
                            </span>

                            {/* Team 2 */}
                            <div
                              style={{
                                flex: 1,
                                backgroundColor: "#fff1f2",
                                color: "#9f1239",
                                border: "1px solid #fecdd3",
                                padding: "5px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 700,
                                textAlign: "center",
                                textTransform: "capitalize",
                              }}
                            >
                              {game.team2[0]} &amp; {game.team2[1]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Resting Players Schedule in export card */}
              {rounds.some((r) => r.resting.length > 0) && (
                <div
                  style={{
                    backgroundColor: "#fefce8",
                    border: "1px solid #fef08a",
                    borderRadius: "10px",
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#854d0e",
                      marginBottom: "6px",
                    }}
                  >
                    💤 RESTING ROTATION BY ROUND
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {rounds.map((round) => (
                      <span
                        key={round.roundNumber}
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #fde047",
                          padding: "2px 8px",
                          borderRadius: "5px",
                          fontSize: "11px",
                          color: "#713f12",
                        }}
                      >
                        <strong>RND {round.roundNumber}:</strong>{" "}
                        <span style={{ textTransform: "capitalize" }}>
                          {round.resting.length > 0 ? round.resting.join(", ") : "None"}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Single Court (or Round View) */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {rounds.map((round) => {
                const games =
                  round.courtGames && round.courtGames.length > 0
                    ? round.courtGames
                    : [
                        {
                          courtNumber: 1,
                          courtName: "Court 1",
                          team1: round.team1,
                          team2: round.team2,
                        },
                      ];

                return (
                  <div
                    key={round.roundNumber}
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {/* Round Header Bar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #e2e8f0",
                        paddingBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#0f172a",
                          color: "#ffffff",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 800,
                          letterSpacing: "0.02em",
                        }}
                      >
                        ROUND {round.roundNumber}
                      </span>

                      {round.resting.length > 0 ? (
                        <div
                          style={{
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            border: "1px solid #fde68a",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          💤 <strong>Resting:</strong> {round.resting.join(", ")}
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "#ecfdf5",
                            color: "#047857",
                            border: "1px solid #a7f3d0",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          ✨ All Playing
                        </div>
                      )}
                    </div>

                    {/* Matches */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {games.map((game, gIdx) => (
                        <div
                          key={gIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #f1f5f9",
                            borderRadius: "8px",
                            padding: "6px 10px",
                          }}
                        >
                          {/* Team 1 */}
                          <div
                            style={{
                              flex: 1,
                              backgroundColor: "#eff6ff",
                              color: "#1e40af",
                              border: "1px solid #bfdbfe",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              textAlign: "center",
                              textTransform: "capitalize",
                            }}
                          >
                            {game.team1[0]} &amp; {game.team1[1]}
                          </div>

                          {/* VS */}
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 900,
                              color: "#94a3b8",
                              padding: "2px 6px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "4px",
                            }}
                          >
                            VS
                          </span>

                          {/* Team 2 */}
                          <div
                            style={{
                              flex: 1,
                              backgroundColor: "#fff1f2",
                              color: "#9f1239",
                              border: "1px solid #fecdd3",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              textAlign: "center",
                              textTransform: "capitalize",
                            }}
                          >
                            {game.team2[0]} &amp; {game.team2[1]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fairness Distribution Summary */}
          {stats.length > 0 && (
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "6px",
                }}
              >
                Playtime Distribution
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {stats.map((s) => (
                  <span
                    key={s.name}
                    style={{
                      fontSize: "11px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      color: "#1e293b",
                    }}
                  >
                    <strong style={{ textTransform: "capitalize" }}>{s.name}:</strong>{" "}
                    <span style={{ color: "#059669", fontWeight: 700 }}>
                      {s.matchesPlayed} games
                    </span>{" "}
                    <span style={{ color: "#94a3b8" }}>({s.restCount} rests)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "10px",
              fontSize: "11px",
              color: "#94a3b8",
            }}
          >
            <span>🏸 Badminton Manager</span>
            <span>{new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
