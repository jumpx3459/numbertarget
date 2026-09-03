import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import maldimaldiImg from '../assets/maldimaldi.jpg';

export type MascotState = 'idle' | 'happy' | 'sad' | 'win';

/** The mascot's name, shown nowhere in the UI text yet but kept here as the single
 * place to reference it (alt text, future dialogue) if it needs to change. */
export const MASCOT_NAME = '마디마디';

interface MascotProps {
  state: MascotState;
  trigger: number;
  theme: 'dark' | 'light';
  language?: 'ko' | 'en';
}

const FACES: Record<MascotState, string> = {
  idle: '🙂',
  happy: '😄',
  sad: '😅',
  win: '🥳',
};

const BUBBLE_TEXT: Record<'ko' | 'en', Record<MascotState, string | null>> = {
  ko: { idle: null, happy: '나이스!', sad: '어라?', win: '해냈어요!' },
  en: { idle: null, happy: 'Nice!', sad: 'Oops!', win: 'You did it!' },
};

export const Mascot: React.FC<MascotProps> = ({ state, trigger, theme, language = 'ko' }) => {
  const isDark = theme === 'dark';
  const bubble = BUBBLE_TEXT[language][state];

  const bodyAnimate =
    state === 'happy'
      ? { scale: [1, 1.3, 0.95, 1.1, 1], rotate: [0, -8, 8, -4, 0] }
      : state === 'sad'
      ? { rotate: [0, -10, 10, -6, 0], x: [0, -4, 4, -2, 0] }
      : state === 'win'
      ? { scale: [1, 1.4, 1.05, 1.25, 1], rotate: [0, 360], y: [0, -18, 0] }
      : { y: [0, -6, 0] };

  const bodyTransition =
    state === 'idle'
      ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: state === 'win' ? 1.1 : 0.6, ease: 'easeOut' as const };

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 pointer-events-none select-none">
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={`${state}-${trigger}`}
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={`absolute -top-9 right-1 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap shadow-lg ${
              isDark ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-white text-zinc-800 border border-zinc-200'
            }`}
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={trigger}
        animate={bodyAnimate}
        transition={bodyTransition}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-teal-400 to-fuchsia-400 shadow-lg shadow-teal-500/30 border-[3px] border-white/30"
      >
        <img
          src={maldimaldiImg}
          alt={MASCOT_NAME}
          className="w-full h-full object-cover object-[center_20%] scale-125"
          draggable={false}
        />

        {/* Small emoji sticker on top of the character for an at-a-glance emotion cue —
            keeps 마디마디 visually consistent across states instead of swapping faces. */}
        {state !== 'idle' && (
          <span
            key={`badge-${state}-${trigger}`}
            className="absolute -bottom-0.5 -right-0.5 text-sm sm:text-base leading-none drop-shadow"
          >
            {FACES[state]}
          </span>
        )}
      </motion.div>
    </div>
  );
};
