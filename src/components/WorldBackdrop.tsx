import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';

interface WorldPhoto {
  url: string;
  credit: string;
}

// Curated set of real-world landscape photos (Unsplash CDN, Unsplash License —
// free for commercial use, hotlinking permitted). One is shown per calendar day,
// rotating through the whole year like a "photo of the day" desktop wallpaper.
const WORLD_PHOTOS: WorldPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1771945484043-3a17fbf57a4b?w=1920&q=75&auto=format&fit=crop', credit: 'Hugh Whyte' },
  { url: 'https://images.unsplash.com/photo-1755371033904-21dd8a9d002b?w=1920&q=75&auto=format&fit=crop', credit: 'Daniel Seßler' },
  { url: 'https://images.unsplash.com/photo-1759675739458-6e5a4a60a117?w=1920&q=75&auto=format&fit=crop', credit: 'Jonny Gios' },
  { url: 'https://images.unsplash.com/photo-1491425432462-010715fd7ed7?w=1920&q=75&auto=format&fit=crop', credit: 'Nicolas Jehly' },
  { url: 'https://images.unsplash.com/photo-1733690577845-4f4641a456b3?w=1920&q=75&auto=format&fit=crop', credit: 'le Sixième Rêve' },
  { url: 'https://images.unsplash.com/photo-1782098125940-9dbb584834bd?w=1920&q=75&auto=format&fit=crop', credit: 'Leslie Cross' },
  { url: 'https://images.unsplash.com/photo-1605145661144-a54c42bfab8e?w=1920&q=75&auto=format&fit=crop', credit: 'Unsplash' },
  { url: 'https://images.unsplash.com/photo-1767536474726-55fd012dd09b?w=1920&q=75&auto=format&fit=crop', credit: 'Shutter Speed' },
  { url: 'https://images.unsplash.com/photo-1694271643834-4aaaef614add?w=1920&q=75&auto=format&fit=crop', credit: 'Benjamin Lehman' },
  { url: 'https://images.unsplash.com/photo-1738058170868-78462be12ff2?w=1920&q=75&auto=format&fit=crop', credit: 'Chris Yang' },
  { url: 'https://images.unsplash.com/photo-1666036891960-93af3efb6d14?w=1920&q=75&auto=format&fit=crop', credit: 'Michael M' },
  { url: 'https://images.unsplash.com/photo-1765825365130-52e276bca060?w=1920&q=75&auto=format&fit=crop', credit: 'Filip Kvasnak' },
  { url: 'https://images.unsplash.com/photo-1744768326067-8b9835957c86?w=1920&q=75&auto=format&fit=crop', credit: 'Aaron Burden' },
];

function getDayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

interface WorldBackdropProps {
  theme: 'dark' | 'light';
  language?: 'ko' | 'en';
}

export const WorldBackdrop: React.FC<WorldBackdropProps> = ({ theme, language = 'ko' }) => {
  const isDark = theme === 'dark';
  const startIndex = useMemo(() => getDayOfYear() % WORLD_PHOTOS.length, []);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const photo = WORLD_PHOTOS[(startIndex + attempt) % WORLD_PHOTOS.length];

  const handleError = () => {
    if (attempt < WORLD_PHOTOS.length - 1) {
      setAttempt((a) => a + 1);
    } else {
      setFailed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {!failed && (
        <motion.img
          key={photo.url}
          src={photo.url}
          alt=""
          onError={handleError}
          initial={{ scale: 1, x: 0, y: 0 }}
          animate={{ scale: 1.08, x: -14, y: -10 }}
          transition={{ duration: 50, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Theme-tinted scrim so foreground content stays readable over any photo */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-b from-[#0d1b2e]/80 via-zinc-950/70 to-[#1a0f2e]/85'
            : 'bg-gradient-to-b from-sky-100/60 via-white/45 to-amber-50/60'
        }`}
      />

      {/* Daily photo credit, small and unobtrusive like a wallpaper-of-the-day badge */}
      {!failed && (
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white/70 text-[10px] font-medium select-none">
          {language === 'ko' ? `오늘의 배경 · ${photo.credit} 촬영 (Unsplash)` : `Today's backdrop · Photo by ${photo.credit} (Unsplash)`}
        </div>
      )}
    </div>
  );
};
