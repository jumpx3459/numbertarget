import React, { useState, useEffect, useMemo } from 'react';
import { CardItem, SolutionStep, Language } from '../types';
import { useSolverSolutions } from '../utils/solverClient';
import { useModalA11y } from '../hooks/useModalA11y';
import { Lightbulb, X, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { sound } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardItem[];
  target: number;
  onOpenFullSolution?: () => void;
  theme: 'dark' | 'light';
  language?: Language;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  cards,
  target,
  onOpenFullSolution,
  theme,
  language = 'ko',
}) => {
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
  const isDark = theme === 'dark';
  const t = getTranslation(language);

  const panelRef = useModalA11y(isOpen, onClose);

  // Each opening starts again from the gentlest hint.
  useEffect(() => {
    if (isOpen) setHintLevel(1);
  }, [isOpen]);

  // Hints are always for the cards currently on the board. There's deliberately no
  // fallback to the puzzle's initial solution: its steps reference cards that may
  // already have been merged away, which made the hint point at numbers not on the board.
  const currentCardValues = useMemo(() => cards.map((c) => c.value), [cards]);
  const isAlreadySolved = currentCardValues.length === 1 && currentCardValues[0] === target;
  const { solutions, loading } = useSolverSolutions(
    isAlreadySolved ? null : currentCardValues,
    target,
    1,
    isOpen
  );
  const displaySolution: SolutionStep[] | null = useMemo(
    () => (solutions.length > 0 ? solutions[0].steps : null),
    [solutions]
  );
  const nextStep = displaySolution && displaySolution.length > 0 ? displaySolution[0] : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hint-modal-title"
        tabIndex={-1}
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative overflow-hidden transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Lightbulb className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <h3 id="hint-modal-title" className="font-display font-extrabold text-lg">
                {t.hintModal.title}
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {language === 'ko' ? (
                  <>
                    목표 <strong className="text-teal-400 font-mono-num font-bold">{target}</strong> 도달을 위한 연산 가이드
                  </>
                ) : (
                  <>
                    Calculation guide to reach target <strong className="text-teal-400 font-mono-num font-bold">{target}</strong>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playCardDeselect();
              onClose();
            }}
            aria-label={language === 'ko' ? '닫기' : 'Close'}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on solution availability */}
        {loading ? (
          <div
            role="status"
            className={`py-8 flex items-center justify-center gap-2 text-sm font-bold ${
              isDark ? 'text-zinc-300' : 'text-zinc-600'
            }`}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'ko' ? '현재 카드로 풀이를 찾는 중…' : 'Looking for a path from your current cards…'}</span>
          </div>
        ) : isAlreadySolved ? (
          <div className="text-center py-6">
            <p className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {language === 'ko' ? '🎉 이미 목표 숫자에 도달했습니다!' : '🎉 You already reached the target!'}
            </p>
          </div>
        ) : nextStep ? (
          <div className="flex flex-col gap-3.5">
            {/* Step 1 Hint */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                hintLevel >= 1
                  ? isDark
                    ? 'bg-zinc-800/80 border-amber-500/30'
                    : 'bg-amber-50/50 border-amber-200'
                  : isDark
                  ? 'bg-zinc-950/40 border-zinc-800 opacity-60'
                  : 'bg-zinc-50 border-zinc-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <span>💡 {t.hintModal.level1Title}</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {language === 'ko' ? '조합할 카드 안내' : 'Target cards recommendation'}
                </span>
              </div>
              <p className="text-sm font-medium">
                {nextStep.type === 'binary' ? (
                  <span>
                    {language === 'ko' ? (
                      <>
                        숫자 <strong className="text-teal-400 font-mono-num font-bold">{nextStep.a}</strong> 와(과){' '}
                        <strong className="text-teal-400 font-mono-num font-bold">{nextStep.b}</strong> 카드를 먼저 결합해보세요!
                      </>
                    ) : (
                      <>
                        Try combining cards <strong className="text-teal-400 font-mono-num font-bold">{nextStep.a}</strong> and{' '}
                        <strong className="text-teal-400 font-mono-num font-bold">{nextStep.b}</strong> first!
                      </>
                    )}
                  </span>
                ) : (
                  <span>
                    {language === 'ko' ? (
                      <>
                        숫자 <strong className="text-fuchsia-400 font-mono-num font-bold">{nextStep.a}</strong> 카드에 단항 연산을 적용해보세요!
                      </>
                    ) : (
                      <>
                        Try applying a unary operation to card <strong className="text-fuchsia-400 font-mono-num font-bold">{nextStep.a}</strong>!
                      </>
                    )}
                  </span>
                )}
              </p>
            </div>

            {/* Step 2 Hint */}
            {hintLevel >= 2 && (
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDark ? 'bg-zinc-800/80 border-teal-500/30' : 'bg-teal-50/50 border-teal-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                    <span>⚡ {t.hintModal.level2Title}</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {language === 'ko' ? '연산식 공개' : 'Formula preview'}
                  </span>
                </div>
                <p className={`text-sm font-semibold font-mono-num ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {language === 'ko' ? '👉 다음 연산:' : '👉 Next move:'}{' '}
                  <span
                    className={`px-2 py-0.5 rounded-lg bg-teal-500/20 border border-teal-500/40 font-bold ${
                      isDark ? 'text-white' : 'text-teal-900'
                    }`}
                  >
                    {nextStep.explanation}
                  </span>
                </p>
              </div>
            )}

            {/* Step 3: Full Solution Pathway */}
            {hintLevel >= 3 && displaySolution && (
              <div
                className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400">🏁 {t.hintModal.level3Title}</span>
                  <span className="text-[10px] text-zinc-500">
                    {language === 'ko' ? `총 ${displaySolution.length}단계` : `Total ${displaySolution.length} steps`}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {displaySolution.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono-num ${
                        isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
                      }`}
                    >
                      <span className="text-zinc-500">#{idx + 1}</span>
                      <span className="font-bold text-emerald-400">{step.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hint Navigation Actions */}
            <div className="flex items-center gap-2 mt-2">
              {hintLevel < 3 && (
                <button
                  onClick={() => {
                    sound.playCardSelect();
                    setHintLevel((l) => (l + 1) as 1 | 2 | 3);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/25"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ko' ? `더 자세한 힌트 (${hintLevel}/3)` : `More details (${hintLevel}/3)`}
                  </span>
                </button>
              )}

              {onOpenFullSolution && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenFullSolution();
                  }}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.victory.viewSolutions}</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playCardDeselect();
                  onClose();
                }}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs border ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                }`}
              >
                {t.rulesModal.close}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className={`text-base font-extrabold mb-1 ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
              {language === 'ko' ? '풀이 없음' : 'No solution'}
            </p>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {t.solutionModal.noSolutionCurrentTitle}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {language === 'ko'
                ? '[되돌리기]로 이전 카드로 돌아가거나 [초기화]를 눌러보세요!'
                : 'Try [Undo] to restore previous cards or [Reset] to start over!'}
            </p>
            {onOpenFullSolution && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullSolution();
                }}
                className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                {t.victory.viewSolutions}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

