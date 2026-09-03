import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, SkipForward, Volume2 } from 'lucide-react';
import { Language } from '../types';
import { MASCOT_NAME } from './Mascot';

interface IntroSplashProps {
  isOpen: boolean;
  onFinish: () => void;
  language?: Language;
}

/**
 * One-time "tap to start" splash that plays the 마디마디 intro clip before the game
 * appears. Starts paused on the video's first frame — browsers block autoplay-with-
 * sound until a real user gesture, and a deliberate "시작하기" tap also just reads
 * better as the game's opening beat than a clip that barges in with audio on load.
 */
export const IntroSplash: React.FC<IntroSplashProps> = ({ isOpen, onFinish, language = 'ko' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    setHasStarted(true);
    videoRef.current?.play().catch(() => {
      // Autoplay-with-sound was refused for some reason — the skip/finish button
      // still lets the player through, so this isn't a dead end.
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      >
        <video
          ref={videoRef}
          src="/maldimaldi-intro.mp4"
          playsInline
          onEnded={onFinish}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Darkening wash so the title/buttons stay legible over any frame of the clip */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60 pointer-events-none" />

        <button
          onClick={onFinish}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
        >
          <span>{language === 'ko' ? '건너뛰기' : 'Skip'}</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg">
              🎯 {language === 'ko' ? '타겟너머' : 'Target Beyond'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/80 font-medium drop-shadow">
              {language === 'ko'
                ? `${MASCOT_NAME}와 함께 숫자 여행을 떠나볼까요?`
                : `Ready for a number adventure with ${MASCOT_NAME}?`}
            </p>
          </div>

          <AnimatePresence>
            {!hasStarted && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-base bg-gradient-to-r from-teal-500 to-fuchsia-500 text-white shadow-2xl shadow-fuchsia-900/40 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{language === 'ko' ? '소리 켜고 시작하기' : 'Start with sound'}</span>
              </motion.button>
            )}
          </AnimatePresence>

          {hasStarted && (
            <div className="flex items-center gap-1.5 text-white/60 text-xs font-medium">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === 'ko' ? '재생 중...' : 'Playing...'}</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
