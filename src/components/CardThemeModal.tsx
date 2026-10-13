import React from 'react';
import { Palette, X, Check } from 'lucide-react';
import { CardTheme, Language } from '../types';
import { sound } from '../utils/audio';
import { useModalA11y } from '../hooks/useModalA11y';
import { CARD_THEMES, getCardWatermark, getThemeBaseCardClass, isRedPokerSuit } from '../utils/cardThemes';

interface CardThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTheme: CardTheme;
  onSelectCardTheme: (theme: CardTheme) => void;
  theme: 'dark' | 'light';
  language?: Language;
}

export const CardThemeModal: React.FC<CardThemeModalProps> = ({
  isOpen,
  onClose,
  cardTheme,
  onSelectCardTheme,
  theme,
  language = 'ko',
}) => {
  const isDark = theme === 'dark';

  const panelRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-theme-modal-title"
        tabIndex={-1}
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 border shadow-2xl relative transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60 sticky top-0 bg-inherit z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 id="card-theme-modal-title" className="font-display font-extrabold text-lg">
                {language === 'ko' ? '카드 테마' : 'Card Theme'}
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {language === 'ko'
                  ? '연령대와 취향에 맞는 카드 디자인을 골라보세요'
                  : 'Pick a card look that fits your taste and age group'}
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

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {CARD_THEMES.map((opt) => {
            const isActive = cardTheme === opt.id;
            const watermark = getCardWatermark(opt.id, 0);
            const previewCardClass = getThemeBaseCardClass(opt.id, isDark);

            return (
              <button
                key={opt.id}
                onClick={() => {
                  sound.playCardSelect();
                  onSelectCardTheme(opt.id);
                }}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-teal-400 ring-4 ring-teal-500/30'
                    : isDark
                    ? 'border-zinc-800 hover:border-zinc-700'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {isActive && (
                  <span className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}

                {/* Mini card preview matching the actual in-game skin (small corner mark,
                    same treatment as the real cards — not a giant center watermark) */}
                <div
                  className={`relative w-full h-16 rounded-xl border-2 flex items-center justify-center ${previewCardClass}`}
                >
                  {watermark && (
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none select-none absolute bottom-1 left-1.5 text-sm leading-none ${
                        opt.id === 'poker'
                          ? isRedPokerSuit(watermark)
                            ? 'text-red-500'
                            : isDark
                            ? 'text-zinc-300'
                            : 'text-zinc-700'
                          : 'opacity-90'
                      }`}
                    >
                      {watermark}
                    </span>
                  )}
                  <span className="relative font-mono-num font-black text-xl">7</span>
                </div>

                <div className="w-full">
                  <h4 className="text-xs font-bold leading-tight flex items-center gap-1">
                    <span>{opt.emoji}</span>
                    <span>{language === 'ko' ? opt.nameKo : opt.nameEn}</span>
                  </h4>
                  <p className={`text-[10px] leading-snug mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {language === 'ko' ? opt.descKo : opt.descEn}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {language === 'ko' ? opt.ageHintKo : opt.ageHintEn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            sound.playCardDeselect();
            onClose();
          }}
          className="w-full mt-4 py-3 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-md shadow-teal-600/30"
        >
          {language === 'ko' ? '닫기' : 'Close'}
        </button>
      </div>
    </div>
  );
};
