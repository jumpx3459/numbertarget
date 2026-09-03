import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CardItem, BinaryOp, UnaryOp, ThemeAura, Language } from '../types';
import { BINARY_OPS, UNARY_OPS } from '../utils/gameLogic';
import { sound } from '../utils/audio';
import { Calculator, Sparkles, GripHorizontal, Move, ChevronDown } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { setDragPayload } from '../utils/dragState';

interface OperatorPanelProps {
  cards: CardItem[];
  selectedIds: string[];
  onApplyBinary: (op: BinaryOp) => void;
  onApplyUnary: (op: UnaryOp) => void;
  disabled?: boolean;
  theme: 'dark' | 'light';
  language?: Language;
  aura?: ThemeAura;
  enableMicroHaptics?: boolean;
}

export const OperatorPanel: React.FC<OperatorPanelProps> = ({
  cards,
  selectedIds,
  onApplyBinary,
  onApplyUnary,
  disabled = false,
  theme,
  language = 'ko',
  aura = 'teal',
  enableMicroHaptics = true,
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);
  const [hoveredOp, setHoveredOp] = useState<string | null>(null);
  const [draggingOpKey, setDraggingOpKey] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);

  const selectedCardA = selectedIds[0] ? cards.find((c) => c.id === selectedIds[0]) : selectedIds.length === 0 && cards.length === 2 ? cards[0] : undefined;
  const selectedCardB = selectedIds[1] ? cards.find((c) => c.id === selectedIds[1]) : selectedIds.length === 0 && cards.length === 2 ? cards[1] : undefined;

  const isBinaryReady = (selectedIds.length === 2 || (selectedIds.length === 0 && cards.length === 2)) && Boolean(selectedCardA && selectedCardB);
  const isUnaryReady = (selectedIds.length === 1 || (selectedIds.length === 0 && cards.length === 1)) && Boolean(selectedCardA);

  const handleDisabledBinaryClick = (op: BinaryOp) => {
    if (cards.length === 2) {
      sound.playMerge();
      onApplyBinary(op);
      return;
    }
    if (selectedIds.length === 1) {
      setHintMessage(
        language === 'ko'
          ? '💡 다른 카드를 1장 더 클릭하여 선택하거나, 연산자를 숫자 사이 [ + ]로 드래그하세요!'
          : '💡 Click 1 more card to pair, or drag the operator into the [ + ] slot between cards!'
      );
      sound.playError();
      setTimeout(() => setHintMessage(null), 3000);
    } else if (selectedIds.length === 0) {
      setHintMessage(
        language === 'ko'
          ? '💡 카드 2장을 차례로 클릭하거나, 연산자를 카드 사이 [ + ] 영역으로 드래그하세요!'
          : '💡 Click 2 cards first or drag an operator into the [ + ] slot between cards!'
      );
      sound.playError();
      setTimeout(() => setHintMessage(null), 3000);
    }
  };

  const getAuraColor = () => {
    switch (aura) {
      case 'mint':
        return {
          binaryActive: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-emerald-600/30',
          unaryActive: 'bg-teal-600 hover:bg-teal-500 border-teal-400 text-white shadow-teal-600/30',
          hudBg: isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900',
          iconColor: 'text-emerald-400',
          dragBadge: 'bg-emerald-500 text-white',
        };
      case 'rose':
        return {
          binaryActive: 'bg-rose-600 hover:bg-rose-500 border-rose-400 text-white shadow-rose-600/30',
          unaryActive: 'bg-pink-600 hover:bg-pink-500 border-pink-400 text-white shadow-pink-600/30',
          hudBg: isDark ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900',
          iconColor: 'text-rose-400',
          dragBadge: 'bg-rose-500 text-white',
        };
      case 'violet':
        return {
          binaryActive: 'bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-400 text-white shadow-fuchsia-600/30',
          unaryActive: 'bg-violet-600 hover:bg-violet-500 border-violet-400 text-white shadow-violet-600/30',
          hudBg: isDark ? 'bg-fuchsia-950/40 border-fuchsia-500/30 text-fuchsia-200' : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
          iconColor: 'text-fuchsia-400',
          dragBadge: 'bg-fuchsia-500 text-white',
        };
      case 'amber':
        return {
          binaryActive: 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-white shadow-amber-600/30',
          unaryActive: 'bg-orange-600 hover:bg-orange-500 border-orange-400 text-white shadow-orange-600/30',
          hudBg: isDark ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900',
          iconColor: 'text-amber-400',
          dragBadge: 'bg-amber-500 text-white',
        };
      case 'teal':
      default:
        return {
          binaryActive: 'bg-teal-600 hover:bg-teal-500 border-teal-400 text-white shadow-teal-600/30',
          unaryActive: 'bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-400 text-white shadow-fuchsia-600/30',
          hudBg: isDark ? 'bg-teal-950/40 border-teal-500/30 text-teal-200' : 'bg-teal-50 border-teal-200 text-teal-900',
          iconColor: 'text-teal-400',
          dragBadge: 'bg-teal-500 text-white',
        };
    }
  };

  const auraColor = getAuraColor();

  // Compute live ghost result for binary
  const getBinaryResult = (op: BinaryOp) => {
    if (!isBinaryReady || !selectedCardA || !selectedCardB) return null;
    const a = selectedCardA.value;
    const b = selectedCardB.value;
    const res1 = op.fn(a, b);
    if (res1 !== null) return { a, b, res: res1, formula: `${a} ${op.symbol} ${b} = ${res1}` };

    if (['-', '/', '^', '%'].includes(op.key)) {
      const res2 = op.fn(b, a);
      if (res2 !== null) return { a: b, b: a, res: res2, formula: `${b} ${op.symbol} ${a} = ${res2}` };
    }
    return null;
  };

  // Compute live ghost result for unary
  const getUnaryResult = (op: UnaryOp) => {
    if (!isUnaryReady || !selectedCardA) return null;
    const a = selectedCardA.value;
    const res = op.fn(a);
    if (res !== null) return { a, res, formula: `${op.symbol}(${a}) = ${res}` };
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-4">
      {/* Live Formula Preview HUD */}
      <div
        className={`w-full py-3 px-4 mb-3.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 ${
          hintMessage
            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
            : isBinaryReady || isUnaryReady
            ? `${auraColor.hudBg} border-teal-400/80 shadow-md`
            : isDark
            ? 'bg-zinc-900/90 border-zinc-700/80 text-zinc-300'
            : 'bg-white border-zinc-300 text-zinc-800 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 text-sm sm:text-base">
          <Calculator className={`w-5 h-5 sm:w-6 sm:h-6 ${auraColor.iconColor} shrink-0`} />
          <span className="font-semibold">
            {hintMessage ? (
              <span className="text-amber-400 font-bold">{hintMessage}</span>
            ) : isBinaryReady ? (
              <span className="font-mono-num font-bold">
                {language === 'ko' ? (
                  <>
                    선택된 카드: <strong className={`text-sm sm:text-base ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>{selectedCardA?.value}</strong> 및{' '}
                    <strong className={`text-sm sm:text-base ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>{selectedCardB?.value}</strong> (연산자 클릭 또는 드래그)
                  </>
                ) : (
                  <>
                    Selected: <strong className={`text-sm sm:text-base ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>{selectedCardA?.value}</strong> &{' '}
                    <strong className={`text-sm sm:text-base ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>{selectedCardB?.value}</strong> (click or drag operator)
                  </>
                )}
              </span>
            ) : isUnaryReady ? (
              <span className="font-mono-num font-bold">
                {language === 'ko' ? (
                  <>
                    선택된 카드: <strong className={`text-sm sm:text-base ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-700'}`}>{selectedCardA?.value}</strong> (단항 연산자 선택 또는 사칙연산자를 카드 사이로 드래그)
                  </>
                ) : (
                  <>
                    Selected: <strong className={`text-sm sm:text-base ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-700'}`}>{selectedCardA?.value}</strong> (pick unary operator or drag operator between cards)
                  </>
                )}
              </span>
            ) : (
              language === 'ko'
                ? '연산자를 드래그하여 두 숫자 카드 사이 [ + ]에 놓거나, 카드를 클릭 후 연산하세요'
                : 'Drag an operator into the [ + ] between cards, or click cards then choose an operator'
            )}
          </span>
        </div>

        {/* Hover preview tooltip */}
        {hoveredOp && (
          <div className={`hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-mono-num font-extrabold ${auraColor.iconColor} animate-pulse`}>
            <Sparkles className="w-4 h-4" />
            <span>{hoveredOp}</span>
          </div>
        )}
      </div>

      {/* Operator Deck Grid */}
      <div className="flex flex-col gap-3.5">
        {/* Section 1: Binary Operators (2 cards or Drag to slot) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className={`text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-1.5 flex-wrap ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
              <Move className="w-4 h-4 text-teal-400" />
              <span>{t.operators.categoryBasic}</span>
              <span className="text-sm text-teal-400 font-bold lowercase">
                {language === 'ko' ? '(숫자 사이로 드래그 또는 2장 선택)' : '(drag to slot or pick 2 cards)'}
              </span>
            </span>
            <span className="text-sm text-zinc-400 font-medium hidden sm:inline font-mono-num">
              {language === 'ko' ? '단축키: + - * / ^ %' : 'Hotkeys: + - * / ^ %'}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
            {BINARY_OPS.map((op) => {
              const preview = getBinaryResult(op);
              const isEnabled = isBinaryReady && preview !== null && !disabled;
              const isDragging = draggingOpKey === op.key;

              return (
                <motion.div
                  key={op.key}
                  draggable={!disabled}
                  onDragStart={(e) => {
                    setDraggingOpKey(op.key);
                    const payload = { type: 'binary' as const, key: op.key, label: op.label, symbol: op.symbol };
                    setDragPayload(payload);
                    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
                    e.dataTransfer.setData('application/json', JSON.stringify(payload));
                    e.dataTransfer.effectAllowed = 'copyMove';
                  }}
                  onDragEnd={() => {
                    setDraggingOpKey(null);
                    setDragPayload(null);
                  }}
                  whileHover={!disabled && enableMicroHaptics ? { y: -3, scale: 1.04 } : undefined}
                  whileTap={!disabled && enableMicroHaptics ? { scale: 0.94 } : undefined}
                  onMouseEnter={() => {
                    if (preview) setHoveredOp(preview.formula);
                  }}
                  onMouseLeave={() => setHoveredOp(null)}
                  onClick={() => {
                    if (!isEnabled) {
                      handleDisabledBinaryClick(op);
                      return;
                    }
                    sound.playMerge();
                    onApplyBinary(op);
                  }}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={`${op.name}: ${op.description}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!isEnabled) {
                        handleDisabledBinaryClick(op);
                        return;
                      }
                      sound.playMerge();
                      onApplyBinary(op);
                    }
                  }}
                  className={`group relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-2xl font-bold transition-all duration-150 select-none cursor-grab active:cursor-grabbing border-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/70 ${
                    isDragging
                      ? 'opacity-50 ring-4 ring-teal-400 scale-95'
                      : isEnabled
                      ? `${auraColor.binaryActive} shadow-lg scale-[1.02]`
                      : isDark
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:border-teal-400 hover:bg-zinc-800 shadow-sm'
                      : 'bg-gradient-to-b from-white to-teal-50/60 border-teal-200 text-teal-900 hover:border-teal-400 hover:to-teal-100/70 shadow-md shadow-teal-100/60'
                  }`}
                  title={`${op.name}: ${op.description} (${language === 'ko' ? '드래그하여 숫자 사이에 놓으세요' : 'drag between cards'})`}
                >
                  {/* Drag indicator icon */}
                  <span className="absolute top-1.5 right-1.5 opacity-40 group-hover:opacity-90 transition-opacity">
                    <GripHorizontal className="w-3 h-3" />
                  </span>

                  <span className="text-2xl sm:text-3xl md:text-4xl leading-none font-mono-num font-black">{op.label}</span>

                  {/* Live preview badge */}
                  {isEnabled && preview && (
                    <span className="text-xs font-mono-num leading-tight font-extrabold mt-0.5 text-white drop-shadow-xs">
                      ={preview.res}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Unary Operators (1 card or Drag onto a card) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            className="w-full flex items-center justify-between px-1 mb-1.5 group/toggle"
          >
            <span className={`text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-1.5 flex-wrap ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
              <Move className="w-4 h-4 text-fuchsia-400" />
              <span>{t.operators.categoryAdvanced}</span>
              <span className="text-sm text-fuchsia-400 font-bold lowercase hidden sm:inline">
                {language === 'ko' ? '(카드 위로 드래그 또는 1장 선택)' : '(drag onto card or pick 1 card)'}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 font-medium hidden sm:inline font-mono-num">
                {language === 'ko' ? '단축키: s(√) !(팩토리얼) n(부호)' : 'Hotkeys: s(√) !(factorial) n(neg)'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''} ${
                  isDark ? 'text-zinc-400 group-hover/toggle:text-white' : 'text-zinc-500 group-hover/toggle:text-zinc-900'
                }`}
              />
            </span>
          </button>

          {showAdvanced && (
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
            {UNARY_OPS.map((op) => {
              const preview = getUnaryResult(op);
              const isEnabled = isUnaryReady && preview !== null && !disabled;
              const isDragging = draggingOpKey === op.key;

              return (
                <motion.div
                  key={op.key}
                  draggable={!disabled}
                  onDragStart={(e) => {
                    setDraggingOpKey(op.key);
                    const payload = { type: 'unary' as const, key: op.key, label: op.label, symbol: op.symbol };
                    setDragPayload(payload);
                    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
                    e.dataTransfer.setData('application/json', JSON.stringify(payload));
                    e.dataTransfer.effectAllowed = 'copyMove';
                  }}
                  onDragEnd={() => {
                    setDraggingOpKey(null);
                    setDragPayload(null);
                  }}
                  whileHover={!disabled && enableMicroHaptics ? { y: -3, scale: 1.04 } : undefined}
                  whileTap={!disabled && enableMicroHaptics ? { scale: 0.94 } : undefined}
                  onMouseEnter={() => {
                    if (preview) setHoveredOp(preview.formula);
                  }}
                  onMouseLeave={() => setHoveredOp(null)}
                  onClick={() => {
                    if (!isEnabled) {
                      if (!isUnaryReady) {
                        setHintMessage(
                          language === 'ko'
                            ? '💡 단항 연산자를 적용할 카드를 먼저 클릭하거나 카드 위로 드래그하세요!'
                            : '💡 Click a card first or drag the unary operator directly onto a card!'
                        );
                        sound.playError();
                        setTimeout(() => setHintMessage(null), 3000);
                      } else {
                        sound.playError();
                      }
                      return;
                    }
                    sound.playMerge();
                    onApplyUnary(op);
                  }}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={`${op.name}: ${op.description}`}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    if (!isEnabled) {
                      if (!isUnaryReady) {
                        setHintMessage(
                          language === 'ko'
                            ? '💡 단항 연산자를 적용할 카드를 먼저 클릭하거나 카드 위로 드래그하세요!'
                            : '💡 Click a card first or drag the unary operator directly onto a card!'
                        );
                        sound.playError();
                        setTimeout(() => setHintMessage(null), 3000);
                      } else {
                        sound.playError();
                      }
                      return;
                    }
                    sound.playMerge();
                    onApplyUnary(op);
                  }}
                  className={`group relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-2xl font-bold transition-all duration-150 select-none cursor-grab active:cursor-grabbing border-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/70 ${
                    isDragging
                      ? 'opacity-50 ring-4 ring-fuchsia-400 scale-95'
                      : isEnabled
                      ? `${auraColor.unaryActive} shadow-lg scale-[1.02]`
                      : isDark
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:border-fuchsia-400 hover:bg-zinc-800 shadow-sm'
                      : 'bg-gradient-to-b from-white to-fuchsia-50/60 border-fuchsia-200 text-fuchsia-900 hover:border-fuchsia-400 hover:to-fuchsia-100/70 shadow-md shadow-fuchsia-100/60'
                  }`}
                  title={`${op.name}: ${op.description} (${language === 'ko' ? '드래그하여 카드 위에 놓으세요' : 'drag onto card'})`}
                >
                  {/* Drag indicator icon */}
                  <span className="absolute top-1.5 right-1.5 opacity-40 group-hover:opacity-90 transition-opacity">
                    <GripHorizontal className="w-3 h-3" />
                  </span>

                  <span className="text-xl sm:text-2xl md:text-3xl leading-none font-mono-num font-black">{op.label}</span>

                  {/* Live preview badge */}
                  {isEnabled && preview && (
                    <span className="text-xs font-mono-num leading-tight font-extrabold mt-0.5 text-white drop-shadow-xs">
                      ={preview.res}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

