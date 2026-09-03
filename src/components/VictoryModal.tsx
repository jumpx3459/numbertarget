import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, HistoryStep, Language } from '../types';
import { Trophy, Star, Share2, ArrowRight, RotateCw } from 'lucide-react';
import { sound } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface VictoryModalProps {
  isOpen: boolean;
  target: number;
  moves: number;
  minPossibleMoves?: number;
  timeSec: number;
  mode: GameMode;
  history: HistoryStep[];
  onNextGame: () => void;
  onReplay: () => void;
  theme: 'dark' | 'light';
  language?: Language;
  score?: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  target,
  moves,
  minPossibleMoves = 4,
  timeSec,
  onNextGame,
  onReplay,
  theme,
  language = 'ko',
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);

  useEffect(() => {
    if (isOpen) {
      sound.playVictory();
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#d946ef', '#ec4899', '#10b981', '#f59e0b'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Rating calculation
  const stars = moves <= minPossibleMoves ? 3 : moves <= minPossibleMoves + 2 ? 2 : 1;

  const handleShare = () => {
    sound.playCardSelect();
    const starEmoji = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const text =
      language === 'ko'
        ? `🎯 [타겟너머] 퍼즐 클리어!\n${starEmoji}\n• 타겟: ${target}\n• 이동 횟수: ${moves}회\n• 소요 시간: ${timeSec}초\n\n지금 도전해보세요 👉 ${window.location.href}`
        : `🎯 [TARGET BEYOND] Puzzle Solved!\n${starEmoji}\n• Target: ${target}\n• Moves: ${moves}\n• Time: ${timeSec}s\n\nTry it yourself 👉 ${window.location.href}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      sound.playHint();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 md:p-8 border shadow-2xl relative overflow-hidden transition-all scale-100 ${
          isDark
            ? 'bg-zinc-900/95 border-zinc-800 text-white'
            : 'bg-white border-zinc-100 text-zinc-900'
        }`}
      >
        {/* Glow ambient */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-r from-teal-500 to-fuchsia-500 opacity-30 blur-2xl pointer-events-none" />

        {/* Top Trophy Icon */}
        <div className="relative z-10 flex flex-col items-center text-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3 animate-bounce">
            <Trophy className="w-9 h-9 text-white" />
          </div>

          <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight">
            {t.victory.title}
          </h2>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {t.victory.subtitle}
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mt-3">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 ${
                  s <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                    : isDark
                    ? 'text-zinc-700'
                    : 'text-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div
          className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl mb-5 border ${
            isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <span className={`text-[11px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.victory.totalMoves}
            </span>
            <span className="font-mono-num font-black text-xl text-teal-400 mt-0.5">
              {moves} <span className="text-xs font-normal text-zinc-500">{language === 'ko' ? '회' : 'moves'}</span>
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 text-center border-l border-zinc-700/30">
            <span className={`text-[11px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.victory.timeTaken}
            </span>
            <span className="font-mono-num font-black text-xl text-fuchsia-400 mt-0.5">
              {timeSec} <span className="text-xs font-normal text-zinc-500">{language === 'ko' ? '초' : 's'}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playCardSelect();
              onNextGame();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-teal-600 to-fuchsia-600 hover:from-teal-500 hover:to-fuchsia-500 text-white shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
          >
            <span>{t.victory.playNext}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.victory.shareResult}</span>
            </button>

            <button
              onClick={() => {
                sound.playUndo();
                onReplay();
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t.history.reset}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

