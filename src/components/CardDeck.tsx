import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardItem, CardTheme, ThemeAura, Language } from '../types';
import { BINARY_OPS, UNARY_OPS } from '../utils/gameLogic';
import { sound } from '../utils/audio';
import { Layers, Plus, Sparkles } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { DragPayload, getDragPayload, setDragPayload, subscribeDragPayload } from '../utils/dragState';
import { getCardWatermark, getThemeBaseCardClass, isRedPokerSuit } from '../utils/cardThemes';
import { Mascot, MascotState } from './Mascot';

interface CardDeckProps {
  cards: CardItem[];
  selected: string[];
  onToggleSelect: (id: string) => void;
  onApplyBinaryBetween: (idA: string, idB: string, opKey: string) => void;
  onApplyUnaryOnCard: (id: string, opKey: string) => void;
  disabled?: boolean;
  theme: 'dark' | 'light';
  language?: Language;
  target: number;
  aura?: ThemeAura;
  enableMicroHaptics?: boolean;
  cardTheme?: CardTheme;
  mascotState: MascotState;
  mascotTrigger: number;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  cards,
  selected,
  onToggleSelect,
  onApplyBinaryBetween,
  onApplyUnaryOnCard,
  disabled = false,
  theme,
  language = 'ko',
  target,
  enableMicroHaptics = true,
  cardTheme = 'neo',
  mascotState,
  mascotTrigger,
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);
  const [activeDropSlot, setActiveDropSlot] = useState<number | null>(null);
  const [slotPreview, setSlotPreview] = useState<{ formula: string; res: number } | null>(null);
  const [hoveredCardDrop, setHoveredCardDrop] = useState<string | null>(null);
  const [cardPreview, setCardPreview] = useState<{ formula: string; res: number } | null>(null);
  const [globalDrag, setGlobalDrag] = useState<DragPayload | null>(null);

  // Subscribe to global drag state across components
  useEffect(() => {
    return subscribeDragPayload((payload) => {
      setGlobalDrag(payload);
      if (!payload) {
        setActiveDropSlot(null);
        setSlotPreview(null);
        setHoveredCardDrop(null);
        setCardPreview(null);
      }
    });
  }, []);

  const parseDragData = (e: React.DragEvent): DragPayload | null => {
    try {
      const dataStr = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed && typeof parsed === 'object') return parsed as DragPayload;
      }
    } catch {
      // ignore
    }
    return getDragPayload();
  };

  const computeBinaryPreview = (valA: number, valB: number, opKey: string) => {
    const op = BINARY_OPS.find((o) => o.key === opKey);
    if (!op) return null;
    let res = op.fn(valA, valB);
    let f = `${valA} ${op.symbol} ${valB}`;
    if (res === null && ['-', '/', '^', '%'].includes(opKey)) {
      const alt = op.fn(valB, valA);
      if (alt !== null) {
        res = alt;
        f = `${valB} ${op.symbol} ${valA}`;
      }
    }
    if (res === null) return null;
    return { formula: `${f} = ${res}`, res };
  };

  const computeUnaryPreview = (val: number, opKey: string) => {
    const op = UNARY_OPS.find((o) => o.key === opKey);
    if (!op) return null;
    const res = op.fn(val);
    if (res === null) return null;
    return { formula: `${op.symbol}(${val}) = ${res}`, res };
  };

  // Slot Drag & Drop Handlers
  const handleSlotDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setActiveDropSlot(slotIdx);

    const dragItem = getDragPayload() || parseDragData(e);
    if (dragItem && dragItem.type === 'binary' && cards[slotIdx] && cards[slotIdx + 1]) {
      const prev = computeBinaryPreview(cards[slotIdx].value, cards[slotIdx + 1].value, dragItem.key);
      setSlotPreview(prev);
    }
  };

  const handleSlotDragLeave = (e: React.DragEvent) => {
    // Only reset if we're actually leaving the slot container
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    setActiveDropSlot(null);
    setSlotPreview(null);
  };

  const handleSlotDrop = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropSlot(null);
    setSlotPreview(null);

    const data = parseDragData(e) || getDragPayload();
    if (!data || disabled) return;

    if (data.type === 'binary' && cards[slotIdx] && cards[slotIdx + 1]) {
      sound.playMerge();
      onApplyBinaryBetween(cards[slotIdx].id, cards[slotIdx + 1].id, data.key);
    }
    setDragPayload(null);
  };

  // Card Drag & Drop Handlers
  const handleCardDragOver = (e: React.DragEvent, card: CardItem) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setHoveredCardDrop(card.id);

    const dragItem = getDragPayload() || parseDragData(e);
    if (dragItem) {
      if (dragItem.type === 'unary') {
        const prev = computeUnaryPreview(card.value, dragItem.key);
        setCardPreview(prev);
      } else if (dragItem.type === 'binary') {
        if (selected.length === 1 && selected[0] !== card.id) {
          const cardA = cards.find((c) => c.id === selected[0]);
          if (cardA) {
            const prev = computeBinaryPreview(cardA.value, card.value, dragItem.key);
            setCardPreview(prev);
          }
        } else if (cards.length === 2) {
          const other = cards.find((c) => c.id !== card.id);
          if (other) {
            const prev = computeBinaryPreview(other.value, card.value, dragItem.key);
            setCardPreview(prev);
          }
        }
      } else if (dragItem.type === 'card' && dragItem.cardId !== card.id) {
        setCardPreview({
          formula: `${dragItem.value} + ${card.value} = ${dragItem.value + card.value}`,
          res: dragItem.value + card.value,
        });
      }
    }
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    setHoveredCardDrop(null);
    setCardPreview(null);
  };

  const handleCardDrop = (e: React.DragEvent, targetCard: CardItem) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredCardDrop(null);
    setCardPreview(null);

    const data = parseDragData(e) || getDragPayload();
    if (!data || disabled) return;

    if (data.type === 'unary') {
      sound.playMerge();
      onApplyUnaryOnCard(targetCard.id, data.key);
    } else if (data.type === 'binary') {
      if (selected.length === 1 && selected[0] !== targetCard.id) {
        sound.playMerge();
        onApplyBinaryBetween(selected[0], targetCard.id, data.key);
      } else if (cards.length === 2) {
        const otherCard = cards.find((c) => c.id !== targetCard.id);
        if (otherCard) {
          sound.playMerge();
          onApplyBinaryBetween(otherCard.id, targetCard.id, data.key);
        }
      } else {
        // If no prior selection, select target card
        onToggleSelect(targetCard.id);
      }
    } else if (data.type === 'card' && data.cardId !== targetCard.id) {
      sound.playMerge();
      onApplyBinaryBetween(data.cardId, targetCard.id, '+');
    }
    setDragPayload(null);
  };

  const handleSlotClick = (slotIdx: number) => {
    if (disabled || !cards[slotIdx] || !cards[slotIdx + 1]) return;
    sound.playMerge();
    onApplyBinaryBetween(cards[slotIdx].id, cards[slotIdx + 1].id, '+');
  };

  const isDraggingBinary = globalDrag?.type === 'binary';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-4">
      {/* Visual Instruction & Selected Status */}
      <div className="flex items-center justify-between mb-2.5 px-2">
        <div className="flex items-center gap-2 text-base font-bold text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>
              {language === 'ko'
                ? `보유 카드 (${cards.length}장)`
                : `Cards (${cards.length})`}
            </span>
          </div>

          {/* 마디마디 mascot, anchored here instead of floating over the corner of the
              whole screen — this section is where it's most relevant to the player. */}
          <Mascot state={mascotState} trigger={mascotTrigger} theme={theme} language={language} inline />

          {/* Quick Color Legend */}
          {cards.some((c) => c.isComputed) && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-semibold border ${
                isDark
                  ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-600/70'
                  : 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300'
              }`}
            >
              <span>✨</span>
              <span>{language === 'ko' ? '보라색: 연산된 숫자' : 'Purple: Computed'}</span>
            </span>
          )}

          {selected.length > 0 && (
            <span className="text-sm text-teal-400 font-bold">
              · {language === 'ko' ? `${selected.length}개 선택됨` : `${selected.length} selected`}
            </span>
          )}
        </div>

        <span className="text-sm text-zinc-500 font-medium hidden sm:inline">
          {language === 'ko' ? '단축키: 1, 2, 3, 4 ...' : 'Hotkeys: 1, 2, 3, 4 ...'}
        </span>
      </div>

      {/* Cards Deck Container with Interspersed Drop Zones */}
      <div
        className={`flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 p-4 sm:p-6 rounded-3xl border-2 transition-all duration-300 ${
          isDraggingBinary
            ? 'border-teal-400 ring-4 ring-teal-500/20 bg-teal-950/20'
            : isDark
            ? 'bg-zinc-950/90 border-zinc-700/80 shadow-2xl backdrop-blur-md ring-1 ring-white/5'
            : 'bg-gradient-to-b from-cyan-100/70 via-sky-50/60 to-amber-50/70 border-cyan-200 shadow-xl shadow-cyan-200/50'
        }`}
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card, idx) => {
            const isSelected = selected.includes(card.id);
            const selectIndex = selected.indexOf(card.id);
            const isCardHoveredForDrop = hoveredCardDrop === card.id;
            const isTargetMatch = card.value === target;
            const isComputed = Boolean(card.isComputed);

            // Pre-calculate live preview for this slot if dragging binary operator
            const slotPreviewForIdx =
              isDraggingBinary && cards[idx + 1] && globalDrag?.type === 'binary'
                ? computeBinaryPreview(card.value, cards[idx + 1].value, globalDrag.key)
                : null;

            return (
              <div key={card.id} className="flex items-center gap-2 sm:gap-3">
                {/* 1. Tactile Number Card */}
                <motion.div
                  layout
                  initial={{ scale: 0.4, opacity: 0, y: -160, rotate: idx % 2 === 0 ? -10 : 10 }}
                  animate={{
                    scale: [0.4, 1.08, 0.96, 1],
                    opacity: 1,
                    y: [-160, 0, -10, 0],
                    rotate: 0,
                  }}
                  exit={{ scale: 0.6, opacity: 0, y: 12 }}
                  transition={{
                    duration: isComputed ? 0.65 : 0.55,
                    times: [0, 0.55, 0.8, 1],
                    ease: 'easeOut',
                    delay: Math.min(idx * 0.06, 0.35),
                  }}
                  whileHover={
                    enableMicroHaptics && !disabled
                      ? { y: -4, scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 17 } }
                      : undefined
                  }
                  whileTap={enableMicroHaptics && !disabled ? { scale: 0.96 } : undefined}
                  draggable={!disabled}
                  onDragStart={(e) => {
                    const payload: DragPayload = { type: 'card', cardId: card.id, value: card.value };
                    setDragPayload(payload);
                    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
                    e.dataTransfer.setData('application/json', JSON.stringify(payload));
                    e.dataTransfer.effectAllowed = 'copyMove';
                  }}
                  onDragEnd={() => {
                    setDragPayload(null);
                  }}
                  onDragOver={(e) => handleCardDragOver(e, card)}
                  onDragLeave={handleCardDragLeave}
                  onDrop={(e) => handleCardDrop(e, card)}
                  onClick={() => {
                    if (disabled) return;
                    if (isSelected) {
                      sound.playCardDeselect();
                    } else {
                      sound.playCardSelect();
                    }
                    onToggleSelect(card.id);
                  }}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-pressed={isSelected}
                  aria-label={
                    language === 'ko'
                      ? `카드 ${idx + 1}: ${card.value}${isSelected ? ' (선택됨)' : ''}`
                      : `Card ${idx + 1}: ${card.value}${isSelected ? ' (selected)' : ''}`
                  }
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isSelected) {
                        sound.playCardDeselect();
                      } else {
                        sound.playCardSelect();
                      }
                      onToggleSelect(card.id);
                    }
                  }}
                  className={`group relative isolate select-none cursor-grab active:cursor-grabbing transition-all rounded-2xl p-3.5 sm:p-5 text-center border-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/70 ${
                    cards.length <= 4
                      ? 'min-w-[96px] sm:min-w-[124px] min-h-[105px] sm:min-h-[130px]'
                      : cards.length <= 6
                      ? 'min-w-[82px] sm:min-w-[104px] min-h-[95px] sm:min-h-[115px]'
                      : 'min-w-[72px] sm:min-w-[88px] min-h-[85px] sm:min-h-[102px]'
                  } flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-teal-600 via-teal-700 to-teal-800 text-white border-teal-300 ring-4 ring-teal-500/50 scale-105 shadow-2xl'
                      : isTargetMatch
                      ? 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-300 ring-4 ring-emerald-400/50 animate-bounce shadow-2xl'
                      : isComputed
                      ? isDark
                        ? 'bg-gradient-to-b from-fuchsia-900/90 via-fuchsia-950 to-zinc-950 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-950/60 hover:border-fuchsia-300 hover:shadow-fuchsia-900/50 ring-2 ring-fuchsia-500/40'
                        : 'bg-gradient-to-b from-fuchsia-100 via-fuchsia-50 to-white text-fuchsia-950 border-fuchsia-500 shadow-md hover:border-fuchsia-600 hover:shadow-lg ring-2 ring-fuchsia-400/50'
                      : getThemeBaseCardClass(cardTheme, isDark)
                  }`}
                  title={
                    language === 'ko'
                      ? isComputed
                        ? '연산으로 생성된 숫자 카드입니다. 다른 카드와 결합해보세요!'
                        : '클릭하여 선택하거나 드래그하여 다른 카드/연산자와 결합하세요'
                      : isComputed
                      ? 'Calculated number card. Combine with other cards!'
                      : 'Click to select or drag to combine with another card'
                  }
                >
                  {/* Landing Impact Glow — a brief expanding ring timed to the moment the
                      card touches down (parent delay + duration*0.55), only for computed
                      result cards, using the same fuchsia tone as their card face. */}
                  {isComputed && (
                    <motion.span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 m-auto z-0 w-3/4 h-3/4 rounded-full border-4 ${
                        isDark ? 'border-fuchsia-400' : 'border-fuchsia-500'
                      }`}
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: 'easeOut',
                        delay: Math.min(idx * 0.06, 0.35) + 0.65 * 0.55,
                      }}
                    />
                  )}

                  {/* Decorative Theme Corner Mark — a small, real-card-style corner glyph
                      rather than a giant background watermark (an earlier version filled
                      the whole card and read as a smudge, not a design). Tucked into the
                      one corner nothing else uses (index pill = top-left outside the card,
                      computed/selected badge = top-right, target flag = bottom-center).
                      Empty (null) for the 'neo' default theme. */}
                  {(() => {
                    const glyph = getCardWatermark(cardTheme, idx);
                    if (!glyph) return null;
                    const isPokerSuit = cardTheme === 'poker';
                    return (
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none select-none absolute bottom-1.5 left-2 sm:bottom-2 sm:left-2.5 text-base sm:text-lg leading-none z-0 ${
                          isPokerSuit
                            ? isRedPokerSuit(glyph)
                              ? 'text-red-500'
                              : isDark
                              ? 'text-zinc-300'
                              : 'text-zinc-700'
                            : 'opacity-90'
                        }`}
                      >
                        {glyph}
                      </span>
                    );
                  })()}

                  {/* Keyboard Index Pill */}
                  <span
                    className={`absolute -top-2 left-2 z-20 px-2 py-0.5 rounded-full text-[10px] font-mono-num font-extrabold border ${
                      isSelected
                        ? 'bg-teal-950 text-teal-100 border-teal-300'
                        : isComputed
                        ? isDark
                          ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-400'
                          : 'bg-fuchsia-200 text-fuchsia-900 border-fuchsia-400 shadow-xs'
                        : isDark
                        ? 'bg-zinc-950 text-zinc-200 border-zinc-600'
                        : 'bg-white text-zinc-800 border-zinc-400 shadow-xs'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  {/* Computed Result Badge */}
                  {isComputed && !isSelected && !isTargetMatch && (
                    <span
                      className={`absolute -top-2.5 right-2 z-20 px-2 py-0.5 rounded-full text-[9.5px] font-black tracking-tight border flex items-center gap-1 shadow-sm ${
                        isDark
                          ? 'bg-fuchsia-900 text-fuchsia-100 border-fuchsia-400'
                          : 'bg-fuchsia-200 text-fuchsia-950 border-fuchsia-400'
                      }`}
                    >
                      <span>✨</span>
                      <span>{language === 'ko' ? '연산결과' : 'CALC'}</span>
                    </span>
                  )}

                  {/* Selection Order Badge */}
                  {isSelected && (
                    <span className="absolute -top-2.5 right-2 z-20 w-6 h-6 rounded-full bg-amber-400 text-zinc-950 text-[11px] font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                      {selectIndex === 0 ? '①' : '②'}
                    </span>
                  )}

                  {/* Big Crisp Number Value */}
                  <motion.span
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.15 }}
                    className={`font-mono-num font-black leading-none block tracking-tight ${
                      cards.length <= 4
                        ? 'text-4xl sm:text-5xl md:text-6xl'
                        : cards.length <= 6
                        ? 'text-3xl sm:text-4xl'
                        : 'text-2xl sm:text-3xl'
                    } ${
                      isComputed && !isSelected && !isTargetMatch
                        ? isDark
                          ? 'text-fuchsia-100 drop-shadow-md'
                          : 'text-fuchsia-950 drop-shadow-xs font-black'
                        : isDark
                        ? 'text-white'
                        : 'text-zinc-950'
                    }`}
                  >
                    {card.value}
                  </motion.span>

                  {/* Live Drag & Drop Preview Tooltip */}
                  {isCardHoveredForDrop && cardPreview && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-black font-mono-num bg-teal-950 text-teal-100 px-2.5 py-0.5 rounded-full border-2 border-teal-400 shadow-xl animate-pulse whitespace-nowrap z-30">
                      {cardPreview.formula}
                    </span>
                  )}

                  {/* Target Match Celebration Flag */}
                  {isTargetMatch && (
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-lg border border-emerald-200 animate-bounce z-30 whitespace-nowrap">
                      GOAL MATCH!
                    </span>
                  )}
                </motion.div>

                {/* 2. Interactive Operator Drop Slot Between Adjacent Cards */}
                {idx < cards.length - 1 && (
                  <motion.div
                    layout
                    onDragOver={(e) => handleSlotDragOver(e, idx)}
                    onDragLeave={handleSlotDragLeave}
                    onDrop={(e) => handleSlotDrop(e, idx)}
                    onClick={() => handleSlotClick(idx)}
                    className={`group relative flex flex-col items-center justify-center transition-all duration-200 z-10 cursor-pointer ${
                      activeDropSlot === idx
                        ? 'w-20 sm:w-24 h-16 sm:h-20 scale-105'
                        : isDraggingBinary
                        ? 'w-16 sm:w-20 h-16 sm:h-20'
                        : 'w-8 sm:w-10 h-16 sm:h-20'
                    }`}
                  >
                    <div
                      className={`w-full flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-150 pointer-events-none ${
                        activeDropSlot === idx
                          ? 'h-14 sm:h-16 bg-teal-600 border-teal-300 text-white shadow-xl scale-105'
                          : isDraggingBinary
                          ? 'h-12 sm:h-14 bg-teal-500/20 border-teal-400 border-dashed text-teal-300 animate-pulse shadow-md'
                          : isDark
                          ? 'h-9 sm:h-10 bg-zinc-900 border-zinc-700 group-hover:border-zinc-500 text-zinc-300 group-hover:text-white group-hover:bg-zinc-800 group-hover:scale-110 shadow-xs'
                          : 'h-9 sm:h-10 bg-zinc-100 border-zinc-300 group-hover:border-teal-500 text-zinc-700 group-hover:text-teal-700 group-hover:bg-teal-50 group-hover:scale-110 shadow-xs'
                      }`}
                      title={
                        language === 'ko'
                          ? `${card.value}와 ${cards[idx + 1].value} 사이에 연산자를 드래그하여 계산 (또는 클릭하여 더하기)`
                          : `Drag operator between ${card.value} and ${cards[idx + 1].value}`
                      }
                    >
                      {activeDropSlot === idx ? (
                        <div className="flex flex-col items-center justify-center text-center px-1">
                          <span className="text-[10px] sm:text-xs font-black leading-none">DROP</span>
                          {slotPreview ? (
                            <span className="text-[11px] sm:text-xs font-bold font-mono-num mt-0.5 leading-tight text-amber-300">
                              ={slotPreview.res}
                            </span>
                          ) : (
                            <span className="text-[9px] opacity-75">{language === 'ko' ? '연산자' : 'Operator'}</span>
                          )}
                        </div>
                      ) : isDraggingBinary ? (
                        <div className="flex flex-col items-center justify-center text-center px-1">
                          <span className="text-xs font-black leading-none">{globalDrag?.symbol || '+'}</span>
                          {slotPreviewForIdx && (
                            <span className="text-[10px] font-bold font-mono-num mt-0.5 text-teal-300">
                              ={slotPreviewForIdx.res}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    {activeDropSlot === idx && slotPreview && (
                      <div className="absolute -top-7 text-[11px] font-bold font-mono-num bg-zinc-900 text-white px-2.5 py-0.5 rounded-lg border border-zinc-700 shadow-xl whitespace-nowrap z-30">
                        {slotPreview.formula}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Drag & Drop Quick Guide Hint */}
      <div className="mt-3 text-center">
        <p className={`text-sm sm:text-base flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-bold text-sm">
            {language === 'ko' ? '플레이 방법' : 'How to Play'}
          </span>
          <span>
            {language === 'ko' ? (
              <>
                <strong>①</strong> 카드 2장을 차례로 클릭 후 연산자 클릭 <strong>②</strong> 또는 연산자를 카드 사이 <strong className="text-teal-400 font-bold">[ + ]</strong> 슬롯으로 드래그!
              </>
            ) : (
              <>
                <strong>①</strong> Pick 2 cards then click operator <strong>②</strong> or drag operator into the <strong className="text-teal-400 font-bold">[ + ]</strong> slot between cards!
              </>
            )}
          </span>
        </p>
      </div>
    </div>
  );
};
