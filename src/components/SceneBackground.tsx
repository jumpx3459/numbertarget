import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface SceneBackgroundProps {
  theme: 'dark' | 'light';
}

// Simple deterministic-ish random generator scoped to one mount so stars/fireflies
// don't jump around on every re-render.
function useRandomPoints(count: number, seedSalt: number) {
  return useMemo(() => {
    let seed = seedSalt;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: count }).map(() => ({
      left: rand() * 100,
      top: rand() * 100,
      size: rand() * 2 + 1,
      delay: rand() * 4,
      duration: rand() * 3 + 2.5,
    }));
  }, [count, seedSalt]);
}

// A light sparkle layer that sits on top of the real photo backdrop (WorldBackdrop)
// without competing with it — just a few twinkling motes to add a touch of magic.
export const SceneBackground: React.FC<SceneBackgroundProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const stars = useRandomPoints(28, 17);
  const fireflies = useRandomPoints(6, 91);

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${s.left}%`,
            top: `${s.top * 0.6}%`,
            width: s.size,
            height: s.size,
            opacity: isDark ? 0.7 : 0.35,
            boxShadow: '0 0 4px 1px rgba(255,255,255,0.5)',
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {fireflies.map((f, i) => (
        <motion.div
          key={`f-${i}`}
          className={`absolute w-1.5 h-1.5 rounded-full ${
            isDark ? 'bg-teal-300 shadow-[0_0_10px_3px_rgba(45,212,191,0.5)]' : 'bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]'
          }`}
          style={{ left: `${f.left}%`, top: `${30 + f.top * 0.55}%` }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: f.duration + 3, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};
