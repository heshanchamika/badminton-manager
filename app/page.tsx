"use client";

import { useBadmintonManager } from "@/hooks/useBadmintonManager";
import { Header } from "@/components/Header";
import { TabNavigation } from "@/components/TabNavigation";
import { CostSplitterView } from "@/components/CostSplitter/CostSplitterView";
import { MatchRoundsView } from "@/components/MatchRounds/MatchRoundsView";
import { NotificationToast } from "@/components/NotificationToast";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    totalCost,
    setTotalCost,
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
    numMatches,
    setNumMatches,
    splitSummary,
    rounds,
    playerStats,
    calculateSplit,
    generateMatches,
    resetToDefault,
    copySplitText,
    copyRoundsText,
    saveSession,
    discardChanges,
    hasUnsavedChanges,
    syncStatus,
    lastSavedTime,
    notification,
  } = useBadmintonManager();

  return (
    <main className="min-h-screen bg-slate-100 flex items-start justify-center p-4 sm:p-6 md:p-10 pt-8 sm:pt-12 pb-24">
      <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 w-full max-w-lg transition-all">
        {/* Header */}
        <Header
          playerCount={players.length}
          syncStatus={syncStatus}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSavedTime={lastSavedTime}
          onReset={resetToDefault}
          onSaveSession={saveSession}
        />

        {/* Tab Switcher */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          playerCount={players.length}
        />

        {/* Tab Content */}
        {activeTab === "splitter" ? (
          <CostSplitterView
            totalCost={totalCost}
            players={players}
            splitSummary={splitSummary}
            onCostChange={setTotalCost}
            onAddPlayer={addPlayer}
            onUpdatePlayer={updatePlayer}
            onRemovePlayer={removePlayer}
            onCalculate={calculateSplit}
            onCopySplit={copySplitText}
          />
        ) : (
          <MatchRoundsView
            playerCount={players.length}
            numMatches={numMatches}
            rounds={rounds}
            playerStats={playerStats}
            onNumMatchesChange={setNumMatches}
            onGenerate={generateMatches}
            onCopyRounds={copyRoundsText}
          />
        )}

        {/* Subtle Footer */}
        <footer className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          Badminton Manager • Fair games, easy payments
        </footer>
      </div>

      {/* Unsaved changes confirmation action bar */}
      <UnsavedChangesPrompt
        hasUnsavedChanges={hasUnsavedChanges}
        syncStatus={syncStatus}
        onSave={saveSession}
        onDiscard={discardChanges}
      />

      {/* Floating feedback toast */}
      <NotificationToast message={notification} />
    </main>
  );
}
