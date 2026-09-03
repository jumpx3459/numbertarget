import React from 'react';
import { HistoryStep, Language } from '../types';
import { RotateCcw, RotateCw, History, Lightbulb, CheckCircle2, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface HistoryTimelineProps {
  history: HistoryStep[];
  onRollback: (index: number) => void;
  onUndo: () => void;
  onReset: () => void;
  onOpenHint: () => void;
  onOpenSolution: () => void;
  onNewGame: () => void;
  disabled?: boolean;
  theme: 'dark' | 'light';
  language?: Language;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  history,
  onRollback,
  onUndo,
  onReset,
  onOpenHint,
  onOpenSolution,
  onNewGame,
  disabled = false,
  theme,
  language = 'ko',
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-6">
      {/* Primary Action Controls Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
        {/* Undo */}
        <button
          onClick={() => {
            sound.playUndo();
            onUndo();
          }}
          disabled={history.length === 0 || disabled}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl text-sm sm:text-base font-bold transition-all ${
            history.length > 0 && !disabled
              ? isDark
                ? 'bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white shadow-sm'
                : 'bg-zinc-100 border border-zinc-300 text-zinc-700 hover:bg-white hover:border-zinc-400 shadow-sm'
              : isDark
              ? 'bg-zinc-900/40 border border-zinc-800/40 text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed'
          }`}
          title={language === 'ko' ? '단축키: U 또는 Ctrl+Z' : 'Shortcut: U or Ctrl+Z'}
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>{t.history.undo}</span>
        </button>

        {/* Reset Initial State */}
        <button
          onClick={() => {
            sound.playUndo();
            onReset();
          }}
          disabled={history.length === 0 || disabled}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl text-sm sm:text-base font-bold transition-all ${
            history.length > 0 && !disabled
              ? isDark
                ? 'bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white shadow-sm'
                : 'bg-zinc-100 border border-zinc-300 text-zinc-700 hover:bg-white hover:border-zinc-400 shadow-sm'
              : isDark
              ? 'bg-zinc-900/40 border border-zinc-800/40 text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed'
          }`}
          title={language === 'ko' ? '현재 퍼즐 처음 상태로 리셋' : 'Reset to puzzle start'}
        >
          <RotateCw className="w-4 h-4 shrink-0" />
          <span>{t.history.reset}</span>
        </button>

        {/* Smart Hint */}
        <button
          onClick={() => {
            sound.playHint();
            onOpenHint();
          }}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl text-sm sm:text-base font-bold transition-all ${
            isDark
              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 hover:border-amber-500/50 shadow-sm'
              : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 shadow-xs'
          }`}
          title={language === 'ko' ? '단계별 힌트 (단축키: H)' : 'Step hint (Shortcut: H)'}
        >
          <Lightbulb className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0" />
          <span>{t.nav.hint}</span>
        </button>

        {/* Full Solution */}
        <button
          onClick={() => {
            sound.playCardSelect();
            onOpenSolution();
          }}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl text-sm sm:text-base font-bold transition-all ${
            isDark
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 shadow-sm'
              : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-xs'
          }`}
          title={language === 'ko' ? '전체 공식 및 정답 확인 (단축키: S 또는 A)' : 'Show solution (Shortcut: S or A)'}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.nav.solution}</span>
        </button>

        {/* New Puzzle Game */}
        <button
          onClick={() => {
            sound.playCardSelect();
            onNewGame();
          }}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1 sm:gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl text-sm sm:text-base font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/25 transition-all hover:scale-[1.02]"
          title={language === 'ko' ? '새로운 숫자 퍼즐 생성' : 'Generate new puzzle'}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{t.nav.newGame}</span>
        </button>
      </div>

      {/* History Breadcrumb Steps List */}
      {history.length > 0 && (
        <div
          className={`p-3 rounded-2xl border ${
            isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-400">
              <History className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {language === 'ko'
                  ? `계산 히스토리 (${history.length}단계)`
                  : `History (${history.length} steps)`}
              </span>
            </div>
            <span className="text-xs text-zinc-500">
              {language === 'ko' ? '클릭하여 해당 시점으로 점프' : 'Click step to jump'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
            {history.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => {
                  sound.playUndo();
                  onRollback(idx);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-mono-num font-semibold transition-all ${
                  isDark
                    ? 'bg-zinc-800 text-zinc-200 hover:bg-teal-600 hover:text-white border border-zinc-700'
                    : 'bg-white text-zinc-800 hover:bg-teal-600 hover:text-white border border-zinc-200 shadow-xs'
                }`}
                title={language === 'ko' ? `스텝 ${idx + 1}로 롤백` : `Rollback to step ${idx + 1}`}
              >
                <span className="text-xs text-zinc-400 font-normal">#{idx + 1}</span>
                <span>{step.actionDescription}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

