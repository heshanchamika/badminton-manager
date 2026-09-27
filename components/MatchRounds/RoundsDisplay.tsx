"use client";

import React, { useState, useRef } from "react";
import { RoundMatch, PlayerMatchStats } from "@/types/badminton";
import { FairnessStats } from "./FairnessStats";
import { Share2, Check, Download, Loader2 } from "lucide-react";
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
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Suggested Rounds</h3>
          <p className="text-xs text-slate-500 font-medium">
            {rounds.length} {rounds.length === 1 ? "Round" : "Rounds"} scheduled
          </p>
        </div>

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

      {/* Fairness stats */}
      {stats.length > 0 && <FairnessStats stats={stats} />}

      {/* Rounds Table View */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-[11px] sm:text-xs uppercase tracking-wider text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 text-slate-700">Rnd</th>
                <th className="py-2.5 px-3 text-blue-700">Team 1</th>
                <th className="py-2.5 px-3 text-rose-700">Team 2</th>
                <th className="py-2.5 px-3 text-slate-500">Resting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rounds.map((round) => (
                <tr key={round.roundNumber} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-black text-xs">
                      {round.roundNumber}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-blue-900 capitalize">
                    <span className="inline-block bg-blue-50/90 text-blue-800 border border-blue-200/60 px-2.5 py-1 rounded-lg">
                      {round.team1[0]} &amp; {round.team1[1]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-rose-900 capitalize">
                    <span className="inline-block bg-rose-50/90 text-rose-800 border border-rose-200/60 px-2.5 py-1 rounded-lg">
                      {round.team2[0]} &amp; {round.team2[1]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs capitalize">
                    {round.resting.length > 0 ? (
                      <span className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-medium">
                        {round.resting.join(", ")}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prominent Share & Download Buttons below table */}
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
          width: "560px",
          zIndex: -999,
          pointerEvents: "none",
        }}
      >
        <div
          ref={exportCardRef}
          style={{
            width: "560px",
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
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {rounds.length} Matches • {stats.length} Players
            </div>
          </div>

          {/* Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              marginBottom: "18px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                <th
                  style={{
                    padding: "8px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    textAlign: "center",
                    width: "48px",
                  }}
                >
                  RND
                </th>
                <th
                  style={{
                    padding: "8px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#1d4ed8",
                  }}
                >
                  TEAM 1
                </th>
                <th
                  style={{
                    padding: "8px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#be123c",
                  }}
                >
                  TEAM 2
                </th>
                <th
                  style={{
                    padding: "8px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#b45309",
                  }}
                >
                  RESTING
                </th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, idx) => (
                <tr
                  key={round.roundNumber}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfcfd",
                  }}
                >
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <span
                      style={{
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      {round.roundNumber}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        backgroundColor: "#eff6ff",
                        color: "#1e40af",
                        border: "1px solid #bfdbfe",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {round.team1[0]} &amp; {round.team1[1]}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        backgroundColor: "#fff1f2",
                        color: "#9f1239",
                        border: "1px solid #fecdd3",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {round.team2[0]} &amp; {round.team2[1]}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    {round.resting.length > 0 ? (
                      <span
                        style={{
                          backgroundColor: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fde68a",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {round.resting.join(", ")}
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "11px" }}>None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
