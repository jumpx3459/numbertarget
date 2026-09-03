import React from 'react';
import { motion } from 'motion/react';
import { GameMode, UserProfile, ThemeAura, Language } from '../types';
import { Volume2, VolumeX, Trophy, HelpCircle, Sun, Moon, Sparkles, Zap, Calendar, Sliders, User, Languages } from 'lucide-react';
import { sound } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface NavbarProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onOpenCustom: () => void;
  onOpenOnboarding: () => void;
  dailyStreak: number;
  profile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onSelectMode,
  isMuted,
  onToggleMute,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
  onOpenStats,
  onOpenRules,
  onOpenCustom,
  onOpenOnboarding,
  dailyStreak,
  profile,
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);

  const getAuraColorClass = (aura: ThemeAura) => {
    switch (aura) {
      case 'mint':
        return 'from-emerald-400 to-teal-500 text-emerald-400 border-emerald-400/40 shadow-emerald-500/20';
      case 'rose':
        return 'from-rose-400 to-pink-500 text-rose-400 border-rose-400/40 shadow-rose-500/20';
      case 'violet':
        return 'from-fuchsia-400 to-violet-500 text-fuchsia-400 border-fuchsia-400/40 shadow-fuchsia-500/20';
      case 'amber':
        return 'from-amber-400 to-orange-500 text-amber-400 border-amber-400/40 shadow-amber-500/20';
      case 'teal':
      default:
        return 'from-teal-400 to-fuchsia-400 text-teal-400 border-teal-400/40 shadow-teal-500/20';
    }
  };

  const auraClasses = getAuraColorClass(profile.aura || 'teal');

  return (
    <header className="w-full max-w-2xl mx-auto pt-4 pb-3 px-3 sm:px-4 flex flex-col gap-3">
      {/* Top Brand & Utility Bar */}
      <div className="flex items-center justify-between flex-wrap gap-y-2">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.playCardSelect();
              onOpenOnboarding();
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-teal-500 via-fuchsia-500 to-pink-500 p-[2px] shadow-lg shadow-teal-500/20 flex items-center justify-center cursor-pointer shrink-0"
            title={language === 'ko' ? '프로필 & 온보딩 설정 열기' : 'Open Profile & Onboarding'}
            aria-label={language === 'ko' ? '프로필 & 온보딩 설정 열기' : 'Open Profile & Onboarding'}
          >
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
              <span className="text-2xl sm:text-3xl select-none leading-none">{profile.avatarEmoji || '🧠'}</span>
            </div>
          </motion.button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                className={`font-display font-black text-2xl sm:text-3xl tracking-tight whitespace-nowrap ${
                  isDark ? 'text-teal-300' : 'text-teal-600'
                }`}
              >
                {t.appName}
              </h1>
              <button
                onClick={() => {
                  sound.playCardSelect();
                  onOpenOnboarding();
                }}
                className={`hidden sm:inline-block text-xs font-mono-num font-bold px-2.5 py-1 rounded-full border transition-all hover:scale-105 whitespace-nowrap shrink-0 ${
                  isDark ? `bg-zinc-900 ${auraClasses}` : 'bg-teal-50 text-teal-600 border-teal-200'
                }`}
                title={language === 'ko' ? '프로필 변경' : 'Change Profile'}
              >
                {profile.nickname || (language === 'ko' ? '넘버마스터' : 'MathMaster')}
              </button>
            </div>
            <p className={`hidden sm:block text-sm font-medium leading-none mt-0.5 whitespace-nowrap ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {dailyStreak > 0 && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold ${
                isDark ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' : 'bg-orange-50 border border-orange-200 text-orange-600'
              }`}
              title={language === 'ko' ? `${dailyStreak}일 연속 챌린지 성공!` : `${dailyStreak}-day streak!`}
            >
              <span>🔥</span>
              <span className="font-mono-num">{dailyStreak}{language === 'ko' ? '일' : 'd'}</span>
            </motion.div>
          )}

          {/* Language Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.playCardSelect();
              onToggleLanguage();
            }}
            className={`px-2 sm:px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs'
            }`}
            title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            aria-label={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
          >
            <Languages className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[11px] font-mono-num uppercase">{language === 'ko' ? 'EN' : '한글'}</span>
          </motion.button>

          {/* Profile / Personalize Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.playCardSelect();
              onOpenOnboarding();
            }}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs'
            }`}
            title={t.nav.profile}
            aria-label={t.nav.profile}
          >
            <User className="w-4 h-4 text-teal-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.playCardSelect();
              onOpenRules();
            }}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs'
            }`}
            title={t.nav.rules}
            aria-label={t.nav.rules}
          >
            <HelpCircle className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.playCardSelect();
              onOpenStats();
            }}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs'
            }`}
            title={t.nav.stats}
            aria-label={t.nav.stats}
          >
            <Trophy className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs'
            }`}
            title={isMuted ? t.nav.soundOff : t.nav.soundOn}
            aria-label={isMuted ? t.nav.soundOff : t.nav.soundOn}
            aria-pressed={isMuted}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-amber-300 hover:bg-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200 text-teal-600 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs'
            }`}
            title={isDark ? t.nav.themeLight : t.nav.themeDark}
            aria-label={isDark ? t.nav.themeLight : t.nav.themeDark}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Mode Selector Tab Pills with Fluid Animated Indicator */}
      <div
        className={`grid grid-cols-4 gap-1 p-1 rounded-2xl border relative ${
          isDark ? 'bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md' : 'bg-zinc-100/90 border-zinc-200'
        }`}
      >
        <button
          onClick={() => {
            sound.playCardSelect();
            onSelectMode('classic');
          }}
          className={`relative flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-0.5 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors z-10 whitespace-nowrap ${
            mode === 'classic'
              ? 'text-white font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {mode === 'classic' && (
            <motion.div
              layoutId="activeModePill"
              className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl shadow-md shadow-teal-600/30 -z-10"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="text-sm sm:hidden">🎯</span>
          <Sparkles className="w-3.5 h-3.5 hidden sm:inline" />
          <span>{t.modes.classic.name}</span>
        </button>

        <button
          onClick={() => {
            sound.playCardSelect();
            onSelectMode('blitz');
          }}
          className={`relative flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-0.5 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors z-10 whitespace-nowrap ${
            mode === 'blitz'
              ? 'text-white font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {mode === 'blitz' && (
            <motion.div
              layoutId="activeModePill"
              className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl shadow-md shadow-orange-500/30 -z-10"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="text-sm sm:hidden">⚡</span>
          <Zap className="w-3.5 h-3.5 hidden sm:inline" />
          <span>{t.modes.blitz.name}</span>
        </button>

        <button
          onClick={() => {
            sound.playCardSelect();
            onSelectMode('daily');
          }}
          className={`relative flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-0.5 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors z-10 whitespace-nowrap ${
            mode === 'daily'
              ? 'text-white font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {mode === 'daily' && (
            <motion.div
              layoutId="activeModePill"
              className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl shadow-md shadow-teal-500/30 -z-10"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="text-sm sm:hidden">📅</span>
          <Calendar className="w-3.5 h-3.5 hidden sm:inline" />
          <span className="sm:hidden">{language === 'ko' ? '데일리' : t.modes.daily.name}</span>
          <span className="hidden sm:inline">{t.modes.daily.name}</span>
        </button>

        <button
          onClick={() => {
            sound.playCardSelect();
            onOpenCustom();
          }}
          className={`relative flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-0.5 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors z-10 whitespace-nowrap ${
            mode === 'custom'
              ? 'text-white font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {mode === 'custom' && (
            <motion.div
              layoutId="activeModePill"
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-500 rounded-xl shadow-md shadow-pink-500/30 -z-10"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="text-sm sm:hidden">🎨</span>
          <Sliders className="w-3.5 h-3.5 hidden sm:inline" />
          <span>{t.modes.custom.name}</span>
        </button>
      </div>
    </header>
  );
};

