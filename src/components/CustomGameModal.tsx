import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, X, Share2, Play, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { encodeCustomPuzzle } from '../utils/gameLogic';
import { useSolverSolutions } from '../utils/solverClient';
import { useModalA11y } from '../hooks/useModalA11y';
import { sound } from '../utils/audio';
import { Language } from '../types';
import { getTranslation } from '../utils/i18n';

const parseCards = (input: string) =>
  input
    .split(/[\s,]+/)
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);

/** Delay before re-running the solvability check after the player stops typing. */
const VALIDATION_DEBOUNCE_MS = 350;

interface CustomGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustom: (target: number, cards: number[]) => void;
  theme: 'dark' | 'light';
  language?: Language;
}

export const CustomGameModal: React.FC<CustomGameModalProps> = ({
  isOpen,
  onClose,
  onStartCustom,
  theme,
  language = 'ko',
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);
  
  const [targetInput, setTargetInput] = useState('24');
  const [cardsInput, setCardsInput] = useState('3, 8, 4, 1');
  // Transient notices (e.g. "link copied") override the validation message until
  // the inputs change again.
  const [notice, setNotice] = useState<string | null>(null);
  const panelRef = useModalA11y(isOpen, onClose);

  // Debounced copy of the inputs: the (expensive) solvability search only follows
  // these, so typing "953" doesn't kick off searches for 9 and 95 on the way.
  const [debounced, setDebounced] = useState({ target: targetInput, cards: cardsInput });
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebounced({ target: targetInput, cards: cardsInput }),
      VALIDATION_DEBOUNCE_MS
    );
    return () => window.clearTimeout(timer);
  }, [targetInput, cardsInput]);

  useEffect(() => {
    setNotice(null);
  }, [targetInput, cardsInput, isOpen]);

  const target = parseInt(targetInput, 10);
  const cards = useMemo(() => parseCards(cardsInput), [cardsInput]);
  const isTargetValid = !isNaN(target) && target > 0;
  const isCardCountValid = cards.length >= 2 && cards.length <= 8;
  const isValid = isTargetValid && isCardCountValid;

  const debouncedTarget = parseInt(debounced.target, 10);
  const debouncedCards = useMemo(() => parseCards(debounced.cards), [debounced.cards]);
  const debouncedValid =
    !isNaN(debouncedTarget) && debouncedTarget > 0 && debouncedCards.length >= 2 && debouncedCards.length <= 8;
  const isSettled = debounced.target === targetInput && debounced.cards === cardsInput;

  // Only search while the modal is open (the component stays mounted while closed).
  const { solutions, loading } = useSolverSolutions(
    debouncedValid ? debouncedCards : null,
    debouncedTarget,
    8,
    isOpen
  );

  let validationMsg: { type: 'ok' | 'error' | 'warn' | 'pending'; text: string } | null;
  if (notice) {
    validationMsg = { type: 'ok', text: notice };
  } else if (!isTargetValid) {
    validationMsg = {
      type: 'error',
      text: language === 'ko' ? '1 이상의 올바른 목표 숫자를 입력해주세요.' : 'Please enter a valid target number greater than 0.',
    };
  } else if (!isCardCountValid) {
    validationMsg = {
      type: 'error',
      text: language === 'ko' ? '2장 이상 8장 이하의 카드 숫자를 입력해주세요.' : 'Please enter between 2 and 8 card numbers.',
    };
  } else if (!isSettled || loading) {
    validationMsg = {
      type: 'pending',
      text: language === 'ko' ? '풀이 가능 여부를 확인하는 중…' : 'Checking whether this is solvable…',
    };
  } else if (solutions.length > 0) {
    validationMsg = {
      type: 'ok',
      text:
        language === 'ko'
          ? `✨ 목표 [${target}] 달성 가능! 총 ${solutions.length}가지의 수학적 해법이 확인되었습니다.`
          : `✨ Target [${target}] is solvable! Found ${solutions.length} verified mathematical pathways.`,
    };
  } else {
    validationMsg = {
      type: 'warn',
      text:
        language === 'ko'
          ? `⚠️ 기본 연산으로 즉시 풀리지 않을 수 있습니다 (거듭제곱/특수연산 필요할 수 있음).`
          : `⚠️ May require advanced powers or factorial operations to solve.`,
    };
  }

  if (!isOpen) return null;

  const handleStartPlay = () => {
    if (!isValid) {
      sound.playError();
      return;
    }

    sound.playCardSelect();
    onStartCustom(target, cards);
    onClose();
  };

  const handleShareLink = () => {
    if (!isValid) return;
    const code = encodeCustomPuzzle(target, cards);
    const url = `${window.location.origin}${window.location.pathname}?p=${code}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      sound.playHint();
      setNotice(language === 'ko' ? '📋 커스텀 퍼즐 도전 링크가 클립보드에 복사되었습니다!' : '📋 Puzzle challenge link copied to clipboard!');
    }
  };

  const PRESETS = [
    { label: language === 'ko' ? '클래식 24 (3, 8, 4, 1)' : 'Classic 24 (3, 8, 4, 1)', target: 24, cards: [3, 8, 4, 1] },
    { label: language === 'ko' ? '카운트다운 (25, 50, 75, 100, 3, 6)' : 'Countdown 953', target: 953, cards: [25, 50, 75, 100, 3, 6] },
    { label: language === 'ko' ? '황금 비율 (10, 20, 4, 2)' : 'Golden Ratio (10, 20, 4, 2)', target: 52, cards: [10, 20, 4, 2] },
    { label: language === 'ko' ? '거듭제곱 마스터 (2, 3, 4, 5)' : 'Power Master (2, 3, 4, 5)', target: 100, cards: [2, 3, 4, 5] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-modal-title"
        tabIndex={-1}
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 border shadow-2xl relative transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-600 to-blue-700 text-white shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 id="custom-modal-title" className="font-display font-extrabold text-lg">
                {t.customModal.title}
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.customModal.subtitle}
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

        {/* Inputs */}
        <div className="flex flex-col gap-3.5 mb-4">
          <div>
            <label
              htmlFor="custom-target-input"
              className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              🎯 {t.customModal.targetLabel}
            </label>
            <input
              id="custom-target-input"
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="예: 24, 100, 953"
              className={`w-full px-4 py-2.5 rounded-xl font-mono-num font-bold text-lg border outline-hidden transition-all ${
                isDark
                  ? 'bg-zinc-950 border-zinc-700 text-white focus:border-teal-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-teal-500'
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="custom-cards-input"
              className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              🔢 {t.customModal.cardsLabel}
            </label>
            <input
              id="custom-cards-input"
              type="text"
              value={cardsInput}
              onChange={(e) => setCardsInput(e.target.value)}
              placeholder="예: 3, 8, 4, 1"
              className={`w-full px-4 py-2.5 rounded-xl font-mono-num font-bold text-base border outline-hidden transition-all ${
                isDark
                  ? 'bg-zinc-950 border-zinc-700 text-white focus:border-teal-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-teal-500'
              }`}
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-zinc-400 block mb-1.5">{t.customModal.presetsLabel}</span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    sound.playCardSelect();
                    setTargetInput(preset.target.toString());
                    setCardsInput(preset.cards.join(', '));
                  }}
                  className={`text-left p-2 rounded-xl border text-xs font-bold transition-all ${
                    targetInput === preset.target.toString() && cardsInput === preset.cards.join(', ')
                      ? 'bg-teal-600/20 border-teal-400 text-teal-200'
                      : isDark
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <div>{preset.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Validation Feedback */}
          {validationMsg && (
            <div
              role="status"
              aria-live="polite"
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                validationMsg.type === 'pending'
                  ? isDark
                    ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                  : validationMsg.type === 'ok'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : validationMsg.type === 'warn'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {validationMsg.type === 'pending' ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              ) : validationMsg.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{validationMsg.text}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleStartPlay}
            disabled={!isValid}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 disabled:opacity-50 text-white shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.customModal.createButton}</span>
          </button>

          <button
            onClick={handleShareLink}
            disabled={!isValid}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.customModal.shareLinkButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

