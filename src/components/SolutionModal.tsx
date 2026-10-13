import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { SolutionStep, CardItem, CategorizedSolution, Language } from '../types';
import { useSolverSolutions } from '../utils/solverClient';
import { useModalA11y } from '../hooks/useModalA11y';
import {
  CheckCircle2,
  Play,
  Copy,
  Check,
  X,
  Sparkles,
  Brain,
  Filter,
  Calculator,
  Layers,
  Zap,
  RotateCcw,
  Undo2,
  Dices,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: number;
  initialCards: number[];
  currentCards: CardItem[];
  solution?: SolutionStep[];
  allSolutions?: CategorizedSolution[];
  /** `source` says which board the steps were computed from: the puzzle's starting
   * cards ('initial') or the cards currently on the board ('current'). */
  onApplyFullSolution?: (steps: SolutionStep[], source: 'initial' | 'current') => void;
  onResetBoard?: () => void;
  onUndo?: () => void;
  onNewGame?: () => void;
  canUndo?: boolean;
  theme: 'dark' | 'light';
  language?: Language;
}

export const SolutionModal: React.FC<SolutionModalProps> = ({
  isOpen,
  onClose,
  target,
  initialCards,
  currentCards,
  solution,
  allSolutions,
  onApplyFullSolution,
  onResetBoard,
  onUndo,
  onNewGame,
  canUndo = false,
  theme,
  language = 'ko',
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSolutionIdx, setActiveSolutionIdx] = useState<number>(0);
  const [sourceTab, setSourceTab] = useState<'initial' | 'current'>('initial');

  const panelRef = useModalA11y(isOpen, onClose);

  // Start every opening from the default view rather than wherever it was left.
  useEffect(() => {
    if (!isOpen) return;
    setSourceTab('initial');
    setSelectedCategory('all');
    setActiveSolutionIdx(0);
  }, [isOpen]);

  // Searches only run while the modal is open, in a Web Worker (see solverClient).
  // Generated puzzles already carry `allSolutions`, so the initial search is only
  // needed for custom/shared puzzles.
  const hasPrecomputed = !!allSolutions && allSolutions.length > 0;
  const initialSearch = useSolverSolutions(initialCards, target, 12, isOpen && !hasPrecomputed, solution);

  // Compute all available solutions with guaranteed fallback
  const initialAllSolutions = useMemo((): CategorizedSolution[] => {
    if (allSolutions && allSolutions.length > 0) return allSolutions;
    if (initialSearch.solutions.length > 0) return initialSearch.solutions;
    if (solution && solution.length > 0) {
      return [
        {
          id: 'sol-verified-primary',
          title: language === 'ko' ? '⚡ 생성 검증 최단 해법' : '⚡ Verified Optimal Solution',
          category: 'shortest' as const,
          categoryLabel: language === 'ko' ? '최적 공식' : 'Optimal Formula',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          description: language === 'ko' ? '생성 엔진에서 검증된 정답 풀이 공식' : 'Verified answer formula from generation engine',
          usedOps: Array.from(new Set(solution.map((s) => s.opKey))),
          stepCount: solution.length,
          steps: solution,
        },
      ];
    }
    return [];
  }, [allSolutions, initialSearch.solutions, solution, language]);

  const currentCardValues = useMemo(() => currentCards.map((c) => c.value), [currentCards]);
  const currentSearch = useSolverSolutions(currentCardValues, target, 8, isOpen);
  const currentAllSolutions = currentSearch.solutions;

  if (!isOpen) return null;

  const activeSolutionList =
    sourceTab === 'current' ? currentAllSolutions : initialAllSolutions;
  const isSearching = sourceTab === 'current' ? currentSearch.loading : initialSearch.loading;

  // Filter solutions by operator categories
  const filteredSolutions = activeSolutionList.filter((sol) => {
    if (selectedCategory === 'all') return true;
    return sol.category === selectedCategory;
  });

  const selectedSol =
    filteredSolutions[activeSolutionIdx] || filteredSolutions[0] || activeSolutionList[0];

  // Available category tabs with counts
  const categoryFilters = [
    {
      id: 'all',
      label: language === 'ko' ? '전체 공식' : 'All Solutions',
      count: activeSolutionList.length,
      icon: Layers,
    },
    {
      id: 'shortest',
      label: language === 'ko' ? '⚡ 최단 공식' : '⚡ Shortest',
      count: activeSolutionList.filter((s) => s.category === 'shortest').length,
      icon: Zap,
    },
    {
      id: 'arithmetic',
      label: language === 'ko' ? '사칙연산 (+,−,×,÷)' : 'Basic (+,−,×,÷)',
      count: activeSolutionList.filter((s) => s.category === 'arithmetic').length,
      icon: Calculator,
    },
    {
      id: 'add_sub',
      label: language === 'ko' ? '덧셈/뺄셈 전용 (+,−)' : 'Add/Sub Only (+,−)',
      count: activeSolutionList.filter((s) => s.category === 'add_sub').length,
      icon: Calculator,
    },
    {
      id: 'mul_div',
      label: language === 'ko' ? '곱셈/나눗셈 전용 (×,÷)' : 'Mul/Div Only (×,÷)',
      count: activeSolutionList.filter((s) => s.category === 'mul_div').length,
      icon: Calculator,
    },
    {
      id: 'power_exp',
      label: language === 'ko' ? '거듭제곱/제곱근 (xʸ,√)' : 'Powers/Roots (xʸ,√)',
      count: activeSolutionList.filter((s) => s.category === 'power_exp').length,
      icon: Sparkles,
    },
    {
      id: 'special_unary',
      label: language === 'ko' ? '특수 연산 (!,×2,½)' : 'Special Ops (!,×2,½)',
      count: activeSolutionList.filter((s) => s.category === 'special_unary').length,
      icon: Brain,
    },
  ].filter((f) => f.id === 'all' || f.count > 0);

  const handleCopySingle = (sol: CategorizedSolution) => {
    const text = language === 'ko'
      ? `🎯 [목표 숫자] ${target}\n🔢 [시작 카드]: [${initialCards.join(', ')}]\n\n📖 [${sol.title}] (총 ${sol.stepCount}단계):\n${sol.steps
          .map((s, idx) => `${idx + 1}. ${s.explanation}`)
          .join('\n')}`
      : `🎯 [Target Number] ${target}\n🔢 [Initial Cards]: [${initialCards.join(', ')}]\n\n📖 [${sol.title}] (Total ${sol.stepCount} steps):\n${sol.steps
          .map((s, idx) => `${idx + 1}. ${s.explanation}`)
          .join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(sol.id);
    sound.playVictory();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteSolution = (steps: SolutionStep[]) => {
    if (!onApplyFullSolution) return;
    sound.playMerge();
    onApplyFullSolution(steps, sourceTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="solution-modal-title"
        tabIndex={-1}
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl p-5 sm:p-6 border shadow-2xl relative overflow-hidden transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="solution-modal-title" className="font-display font-extrabold text-lg sm:text-xl">
                  {language === 'ko' ? '연산자별 다각도 정답 탐색' : 'Multi-Operator Solution Explorer'}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 ${
                    isDark ? 'text-emerald-300' : 'text-emerald-700'
                  }`}
                >
                  {isSearching ? '…' : activeSolutionList.length} {language === 'ko' ? '개 공식 발견' : 'found'}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {language === 'ko'
                  ? '사칙연산, 덧셈/뺄셈, 제곱/거듭제곱, 특수연산 등 연산자 유형별 다양한 해답을 확인하세요'
                  : 'Explore diverse solutions filtered by arithmetic, exponents, and special operators'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playCardDeselect();
              onClose();
            }}
            aria-label={language === 'ko' ? '닫기' : 'Close'}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Target & Initial Cards Banner */}
        <div
          className={`my-3 p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          {/* Cards List */}
          <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
              {sourceTab === 'initial'
                ? (language === 'ko' ? '초기 카드 구성' : 'Initial Cards')
                : (language === 'ko' ? '현재 남은 카드' : 'Current Cards')}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {(sourceTab === 'initial' ? initialCards : currentCardValues).map((val, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl font-mono-num font-extrabold text-sm border shadow-xs ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white'
                      : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                >
                  {val}
                </span>
              ))}
            </div>
          </div>

          {/* Target Preview */}
          <div className="flex items-center gap-2 pl-0 sm:pl-3 border-t sm:border-t-0 sm:border-l border-zinc-800 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-400 block">
                {language === 'ko' ? '목표 숫자' : 'Target'}
              </span>
              <span className="text-[9px] text-zinc-500">TARGET</span>
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono-num font-black text-2xl">
              {target}
            </div>
          </div>
        </div>

        {/* Mode Switch: Initial Game vs Current Live State */}
        <div
          className={`flex rounded-xl p-1 mb-2.5 border shrink-0 ${
            isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          <button
            onClick={() => {
              sound.playCardSelect();
              setSourceTab('initial');
              setActiveSolutionIdx(0);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sourceTab === 'initial'
                ? 'bg-teal-600 text-white shadow-sm'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>
              {language === 'ko'
                ? `처음 카드 기준 해법 (${initialSearch.loading ? '…' : initialAllSolutions.length})`
                : `From Start Cards (${initialSearch.loading ? '…' : initialAllSolutions.length})`}
            </span>
          </button>
          <button
            onClick={() => {
              sound.playCardSelect();
              setSourceTab('current');
              setActiveSolutionIdx(0);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sourceTab === 'current'
                ? 'bg-teal-600 text-white shadow-sm'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'ko'
                ? `현재 남은 카드 기준 (${currentSearch.loading ? '…' : currentAllSolutions.length})`
                : `From Current Cards (${currentSearch.loading ? '…' : currentAllSolutions.length})`}
            </span>
          </button>
        </div>

        {/* Operator Usage Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 mr-1 shrink-0">
            <Filter className="w-3 h-3 text-teal-400" />
            <span>{language === 'ko' ? '연산자 필터:' : 'Filters:'}</span>
          </div>
          {categoryFilters.map((f) => {
            const isSelected = selectedCategory === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  sound.playCardSelect();
                  setSelectedCategory(f.id);
                  setActiveSolutionIdx(0);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-num font-black ${
                    isSelected ? 'bg-black/30 text-white' : isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-300 text-zinc-700'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Solution Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-0">
          {isSearching ? (
            <div
              role="status"
              className={`p-6 rounded-3xl border flex items-center justify-center gap-2 text-sm font-bold ${
                isDark ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
              }`}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{language === 'ko' ? '정답을 탐색하는 중…' : 'Searching for solutions…'}</span>
            </div>
          ) : filteredSolutions.length > 0 ? (
            <>
              {/* Solution Picker if multiple in category */}
              {filteredSolutions.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none shrink-0">
                  {filteredSolutions.map((sol, idx) => {
                    const isPicked = idx === activeSolutionIdx;
                    return (
                      <button
                        key={sol.id}
                        onClick={() => {
                          sound.playCardSelect();
                          setActiveSolutionIdx(idx);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                          isPicked
                            ? 'bg-teal-600 border-teal-400 text-white shadow-md ring-2 ring-teal-400/40'
                            : isDark
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <span>{language === 'ko' ? `공식 #${idx + 1}` : `Formula #${idx + 1}`}</span>
                        <span className="text-[10px] opacity-80">
                          ({sol.stepCount}{language === 'ko' ? '단계' : ' steps'})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Selected Solution Card */}
              {selectedSol && (
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  {/* Title & Operator Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-zinc-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {selectedSol.title}
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${selectedSol.badgeColor}`}>
                          {selectedSol.stepCount} {language === 'ko' ? '단계 풀이' : 'Steps'}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{selectedSol.description}</p>
                    </div>

                    {/* Used Operator Symbols */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-zinc-500 mr-1">
                        {language === 'ko' ? '사용 연산자:' : 'Operators:'}
                      </span>
                      {selectedSol.usedOps.map((opKey, oIdx) => (
                        <span
                          key={oIdx}
                          className={`px-2 py-0.5 rounded-lg text-xs font-mono-num font-extrabold bg-teal-500/20 border border-teal-500/30 ${
                            isDark ? 'text-teal-300' : 'text-teal-700'
                          }`}
                        >
                          {opKey}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step-by-Step Equations List */}
                  <div className="flex flex-col gap-2">
                    {selectedSol.steps.map((step, sIdx) => (
                      <motion.div
                        key={sIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sIdx * 0.05 }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-500/40'
                            : 'bg-white border-zinc-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono-num font-black text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
                            {sIdx + 1}
                          </span>
                          <div>
                            <div className={`font-mono-num font-bold text-sm tracking-wide ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                              {step.explanation}
                            </div>
                            <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {step.type === 'binary'
                                ? (language === 'ko' ? `이항 연산 (${step.opLabel})` : `Binary Op (${step.opLabel})`)
                                : (language === 'ko' ? `단항 연산 (${step.opLabel})` : `Unary Op (${step.opLabel})`)}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono-num font-black bg-emerald-500 text-black shadow-xs shrink-0">
                          ={step.result}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Bar for Current Solution */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleCopySingle(selectedSol)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                        copiedId === selectedSol.id
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isDark
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {copiedId === selectedSol.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedId === selectedSol.id
                          ? (language === 'ko' ? '복사됨!' : 'Copied!')
                          : (language === 'ko' ? '이 공식 복사' : 'Copy Solution')}
                      </span>
                    </button>

                    {onApplyFullSolution && (
                      <button
                        onClick={() => handleExecuteSolution(selectedSol.steps)}
                        className="py-2 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{language === 'ko' ? '이 공식대로 즉시 연산 적용' : 'Auto-Execute Solution'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Helpful Dead-End / No Solution Resolution Guide */
            <div
              className={`p-6 rounded-3xl border text-center ${
                isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className={`text-base font-extrabold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {sourceTab === 'current'
                  ? (language === 'ko'
                      ? '현재 남은 카드로는 목표 숫자에 도달할 수 없습니다'
                      : 'No possible solutions with current remaining cards')
                  : (language === 'ko'
                      ? '선택한 연산자 필터에 해당하는 정답이 없거나 막다른 길입니다'
                      : 'No solution matches this filter or reached a dead end')}
              </h4>
              <p className={`text-xs max-w-md mx-auto mb-5 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {sourceTab === 'current'
                  ? (language === 'ko'
                      ? '진행 중인 연산으로 인해 막다른 길(Dead-end)에 도달했습니다. 아래 해결 방법 중 하나를 선택해 다시 도전해보세요!'
                      : 'The current operations led to a dead-end. Choose one of the quick actions below to recover!')
                  : (language === 'ko'
                      ? '상단의 [전체 공식] 탭을 누르거나, 처음 카드로 다시 리셋하거나 새 문제를 받아보세요.'
                      : 'Click the [All Solutions] filter, reset to initial cards, or start a new puzzle.')}
              </p>

              {/* Quick Resolution Actions */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg mx-auto">
                {onUndo && canUndo && (
                  <button
                    onClick={() => {
                      sound.playUndo();
                      onUndo();
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition-all flex items-center gap-1.5"
                  >
                    <Undo2 className="w-4 h-4" />
                    <span>{language === 'ko' ? '↩️ 직전 연산 되돌리기' : '↩️ Undo Last Step'}</span>
                  </button>
                )}

                {onResetBoard && (
                  <button
                    onClick={() => {
                      sound.playUndo();
                      onResetBoard();
                      setSourceTab('initial');
                    }}
                    className={`py-2.5 px-4 rounded-2xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                      isDark
                        ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                        : 'bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-800'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>{language === 'ko' ? '🔄 처음 카드 상태로 리셋' : '🔄 Reset to Start'}</span>
                  </button>
                )}

                {onNewGame && (
                  <button
                    onClick={() => {
                      sound.playVictory();
                      onNewGame();
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5"
                  >
                    <Dices className="w-4 h-4" />
                    <span>{language === 'ko' ? '🎲 새로운 문제 받기' : '🎲 New Puzzle'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/60 shrink-0">
          <span className="text-[11px] text-zinc-500 font-medium">
            💡 {language === 'ko' ? '단축키: ' : 'Shortcut: '}
            <kbd
              className={`px-1.5 py-0.5 rounded font-mono ${
                isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'
              }`}
            >
              A
            </kbd>{' '}
            {language === 'ko' ? '로 정답창 열기' : 'to open Solution Explorer'}
          </span>

          <button
            onClick={() => {
              sound.playCardDeselect();
              onClose();
            }}
            className={`py-2 px-4 rounded-xl font-bold text-xs border ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
            }`}
          >
            {language === 'ko' ? '닫기' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

