import React, { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'motion/react';
import { GameMode, ThemeAura, Language } from '../types';
import { Target, Timer, Flame, Hash, Compass } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

const STAR_ACCENTS = [
  { left: 8, top: 12, size: 2, delay: 0 },
  { left: 18, top: 28, size: 1.5, delay: 0.6 },
  { left: 30, top: 10, size: 1.5, delay: 1.2 },
  { left: 62, top: 14, size: 2, delay: 0.3 },
  { left: 88, top: 22, size: 1.5, delay: 1.6 },
  { left: 95, top: 8, size: 1.5, delay: 0.9 },
  { left: 5, top: 40, size: 1.5, delay: 2.1 },
  { left: 72, top: 34, size: 1.5, delay: 1.8 },
];

interface TargetDisplayProps {
  target: number;
  moves: number;
  mode: GameMode;
  timeLeft?: number;
  score?: number;
  combo?: number;
  theme: 'dark' | 'light';
  language?: Language;
  closestValue?: number;
  aura?: ThemeAura;
}

export const TargetDisplay: React.FC<TargetDisplayProps> = ({
  target,
  moves,
  mode,
  timeLeft = 0,
  score = 0,
  combo = 0,
  theme,
  language = 'ko',
  closestValue,
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);
  const diff = closestValue !== undefined ? Math.abs(target - closestValue) : null;

  // Count-up animation whenever the target number changes (new puzzle / new game)
  const [displayTarget, setDisplayTarget] = useState(target);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    const from = prevTargetRef.current;
    prevTargetRef.current = target;
    if (from === target) {
      setDisplayTarget(target);
      return;
    }
    const controls = animate(from, target, {
      duration: 0.85,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayTarget(Math.round(v)),
    });
    return () => controls.stop();
  }, [target]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-3">
      <motion.div
        layout
        className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-b from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 border border-zinc-800/80 shadow-2xl'
            : 'bg-gradient-to-b from-white via-teal-50/30 to-white border border-teal-100 shadow-xl shadow-teal-100/50'
        }`}
      >
        {/* Ambient background glow */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none opacity-30 blur-3xl ${
            mode === 'blitz'
              ? 'bg-amber-500'
              : mode === 'daily'
              ? 'bg-teal-500'
              : mode === 'custom'
              ? 'bg-pink-500'
              : 'bg-orange-400'
          }`}
        />

        {/* Mini night-sky starfield accent (dark theme only) */}
        {isDark && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {STAR_ACCENTS.map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: s.size,
                  height: s.size,
                  opacity: 0.7,
                  boxShadow: '0 0 4px 1px rgba(255,255,255,0.5)',
                  animationDelay: `${s.delay}s`,
                  animationDuration: '3s',
                }}
              />
            ))}
            <span className="absolute top-3 right-4 text-base opacity-40 select-none">✨</span>
          </div>
        )}

        {/* Top Status Header */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
          {/* Target Label */}
          <div className="flex items-center gap-1.5">
            <span className={`p-1.5 rounded-xl ${isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
              <Target className="w-4 h-4" />
            </span>
            <span className="text-base font-black uppercase tracking-wider text-teal-400">
              {t.board.target}
            </span>
          </div>

          {/* Mode-specific Stats */}
          <div className="flex items-center gap-2">
            {mode === 'blitz' ? (
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-base font-mono-num font-extrabold ${
                    timeLeft <= 15
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                      : isDark
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>

                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-base font-mono-num font-extrabold ${
                    isDark ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                  }`}
                >
                  <span>{t.board.score}</span>
                  <span className="text-amber-400">{score}</span>
                </div>

                {combo > 1 && (
                  <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-black shadow-xs animate-bounce">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>x{combo}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {diff !== null && diff > 0 && diff <= 50 && (
                  <div
                    className={`hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full text-base font-semibold ${
                      isDark ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    <Compass className="w-3 h-3 text-teal-400" />
                    <span>{language === 'ko' ? `최소 오차: ±${diff}` : `Closest: ±${diff}`}</span>
                  </div>
                )}

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-base font-mono-num font-bold ${
                    isDark ? 'bg-zinc-800/90 text-zinc-300 border border-zinc-700' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {language === 'ko' ? `연산 ${moves}회` : `${moves} ${moves === 1 ? 'move' : 'moves'}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Big Crisp Target Number */}
        <div className="relative z-10 flex flex-col items-center justify-center py-2">
          <motion.div
            layout
            key={target}
            initial={{ scale: 0.7, opacity: 0, rotate: -4 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="flex items-baseline justify-center gap-1"
          >
            <motion.span
              animate={{ scale: [1, 1.025, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className={`font-mono-num font-black text-5xl sm:text-6xl md:text-7xl tracking-tight inline-block ${
                isDark
                  ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 drop-shadow-lg'
                  : 'text-zinc-950'
              }`}
            >
              {displayTarget}
            </motion.span>
          </motion.div>

          <p className={`text-base sm:text-lg font-medium mt-1.5 text-center ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            {language === 'ko' ? (
              <>
                숫자 카드들을 사칙연산하여 정확히 <strong className="text-teal-400 font-mono-num font-bold">{target}</strong>을 만드세요!
              </>
            ) : (
              <>
                Combine cards with math operators to reach exactly <strong className="text-teal-400 font-mono-num font-bold">{target}</strong>!
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

