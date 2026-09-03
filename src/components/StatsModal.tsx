import React from 'react';
import { GameStats, Language } from '../types';
import { Trophy, Award, X } from 'lucide-react';
import { sound } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  theme: 'dark' | 'light';
  language?: Language;
}

const getAchievements = (lang: Language | string = 'ko') => [
  {
    id: 'first_win',
    name: lang === 'ko' ? '첫걸음' : 'First Step',
    desc: lang === 'ko' ? '퍼즐 1회 클리어' : 'Solve 1 puzzle',
    icon: '🎯',
  },
  {
    id: 'streak_3',
    name: lang === 'ko' ? '불타는 스트릭' : 'On Fire',
    desc: lang === 'ko' ? '3일 연속 데일리 클리어' : 'Complete 3 daily streaks',
    icon: '🔥',
  },
  {
    id: 'blitz_5',
    name: lang === 'ko' ? '스피드 러너' : 'Speed Runner',
    desc: lang === 'ko' ? '블리츠 모드 5점 이상 달성' : 'Score 5+ in Blitz mode',
    icon: '⚡',
  },
  {
    id: 'expert_win',
    name: lang === 'ko' ? '수학 천재' : 'Math Genius',
    desc: lang === 'ko' ? '익스퍼트(7장) 난이도 클리어' : 'Beat Expert (7 cards) puzzle',
    icon: '🧠',
  },
  {
    id: 'minimalist',
    name: lang === 'ko' ? '최소 연산' : 'Minimalist',
    desc: lang === 'ko' ? '최단 수로 퍼즐 완벽 해결' : 'Solve in minimum moves',
    icon: '✨',
  },
];

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  theme,
  language = 'ko',
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);
  const achievements = getAchievements(language);

  if (!isOpen) return null;

  const winRate = stats.totalPlayed > 0 ? Math.round((stats.totalWon / stats.totalPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative overflow-hidden transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg">{t.statsModal.title}</h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.statsModal.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playCardDeselect();
              onClose();
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats 4-Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <span className={`text-[11px] font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.statsModal.totalGames}
            </span>
            <span className="font-mono-num font-black text-xl text-teal-400 mt-0.5">
              {stats.totalWon} <span className="text-xs font-normal text-zinc-500">/ {stats.totalPlayed}</span>
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <span className={`text-[11px] font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.statsModal.winRate}
            </span>
            <span className="font-mono-num font-black text-xl text-emerald-400 mt-0.5">
              {winRate}%
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <span className={`text-[11px] font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.statsModal.currentStreak}
            </span>
            <span className="font-mono-num font-black text-xl text-orange-400 mt-0.5 flex items-center gap-1">
              🔥 {stats.currentStreak}{language === 'ko' ? '일' : 'd'}
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <span className={`text-[11px] font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.statsModal.bestBlitz}
            </span>
            <span className="font-mono-num font-black text-xl text-amber-400 mt-0.5">
              {stats.bestBlitzScore} <span className="text-xs font-normal text-zinc-500">{language === 'ko' ? '점' : 'pts'}</span>
            </span>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'ko' ? '도전 과제' : 'Achievements'}</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono-num">
              {stats.achievements.length} / {achievements.length} {language === 'ko' ? '해금' : 'unlocked'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {achievements.map((ach) => {
              const isUnlocked = stats.achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isUnlocked
                      ? isDark
                        ? 'bg-zinc-800/60 border-teal-500/30 text-white'
                        : 'bg-teal-50/50 border-teal-200 text-zinc-900'
                      : isDark
                      ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-600 opacity-50'
                      : 'bg-zinc-100/50 border-zinc-200 text-zinc-400 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ach.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{ach.name}</h4>
                      <p className="text-[10px] text-zinc-400">{ach.desc}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isUnlocked ? (language === 'ko' ? '완료' : 'Done') : (language === 'ko' ? '미달성' : 'Locked')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            sound.playCardDeselect();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer"
        >
          {t.statsModal.close}
        </button>
      </div>
    </div>
  );
};

