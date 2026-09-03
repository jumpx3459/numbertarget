import { CardTheme } from '../types';

export interface CardThemeOption {
  id: CardTheme;
  nameKo: string;
  nameEn: string;
  descKo: string;
  descEn: string;
  /** Representative emoji shown on the picker swatch. */
  emoji: string;
  ageHintKo: string;
  ageHintEn: string;
}

export const CARD_THEMES: CardThemeOption[] = [
  {
    id: 'neo',
    nameKo: '기본 (네오)',
    nameEn: 'Default (Neo)',
    descKo: '지금 그대로의 군더더기 없는 미니멀 카드',
    descEn: 'The current clean, minimal card look',
    emoji: '🎯',
    ageHintKo: '모든 연령',
    ageHintEn: 'All ages',
  },
  {
    id: 'poker',
    nameKo: '포커 카드',
    nameEn: 'Poker',
    descKo: '스페이드·하트 등 클래식 카지노 카드 무늬',
    descEn: 'Classic casino playing-card suits',
    emoji: '♠️',
    ageHintKo: '성인 추천',
    ageHintEn: 'Adults',
  },
  {
    id: 'hwatu',
    nameKo: '화투 카드',
    nameEn: 'Hwatu',
    descKo: '매화·단풍·보름달 등 전통 화투 감성',
    descEn: 'Traditional Korean flower-card motifs',
    emoji: '🌸',
    ageHintKo: '성인·중장년 추천',
    ageHintEn: 'Adults & seniors',
  },
  {
    id: 'monster',
    nameKo: '몬스터 카드',
    nameEn: 'Monster',
    descKo: '알록달록 귀여운 몬스터 캐릭터 카드',
    descEn: 'Colorful, cute monster characters',
    emoji: '👾',
    ageHintKo: '어린이 추천',
    ageHintEn: 'Kids',
  },
  {
    id: 'fairytale',
    nameKo: '동화 파스텔',
    nameEn: 'Fairytale Pastel',
    descKo: '구름·별이 떠다니는 포근한 동화풍 카드',
    descEn: 'Dreamy pastel clouds & stars',
    emoji: '☁️',
    ageHintKo: '어린이·가족 추천',
    ageHintEn: 'Kids & families',
  },
];

/** Background watermark glyphs cycled by card index — empty for 'neo' so the default look is untouched. */
const WATERMARKS: Record<CardTheme, string[]> = {
  neo: [],
  poker: ['♠', '♥', '♦', '♣'],
  hwatu: ['🌸', '🍁', '🌕', '🌾'],
  monster: ['👾', '🐙', '🦖', '👹'],
  fairytale: ['☁️', '✨', '🌙', '⭐'],
};

export function getCardWatermark(themeId: CardTheme, idx: number): string | null {
  const arr = WATERMARKS[themeId];
  if (!arr || arr.length === 0) return null;
  return arr[idx % arr.length];
}

/** Poker suits render as plain glyphs (not emoji), so they need an explicit ink color. */
export function isRedPokerSuit(symbol: string): boolean {
  return symbol === '♥' || symbol === '♦';
}

/**
 * Theme-specific background/border for a card's idle state only (not selected, not the
 * computed/target-match highlight colors — those stay teal/fuchsia/emerald across every
 * theme since they're functional gameplay signals, not decoration).
 */
export function getThemeBaseCardClass(themeId: CardTheme, isDark: boolean): string {
  switch (themeId) {
    case 'poker':
      return isDark
        ? 'bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white border-zinc-500 hover:border-zinc-300 hover:shadow-xl shadow-lg'
        : 'bg-gradient-to-b from-white via-white to-red-50/40 text-zinc-950 border-zinc-800 hover:border-red-600 hover:shadow-xl shadow-md';
    case 'hwatu':
      return isDark
        ? 'bg-gradient-to-b from-[#1a1006] via-[#150c05] to-black text-white border-amber-600/70 hover:border-amber-400 hover:shadow-xl shadow-lg'
        : 'bg-gradient-to-b from-orange-50 via-amber-50/70 to-red-50/50 text-zinc-950 border-red-800/60 hover:border-amber-600 hover:shadow-xl shadow-md';
    case 'monster':
      return isDark
        ? 'bg-gradient-to-b from-violet-900/70 via-fuchsia-950/80 to-zinc-950 text-white border-lime-400/60 hover:border-lime-300 hover:shadow-xl shadow-lg'
        : 'bg-gradient-to-b from-lime-50 via-fuchsia-50/70 to-sky-50 text-zinc-950 border-fuchsia-400 hover:border-lime-500 hover:shadow-xl shadow-md';
    case 'fairytale':
      return isDark
        ? 'bg-gradient-to-b from-indigo-950/80 via-violet-950/70 to-zinc-950 text-white border-sky-300/50 hover:border-sky-200 hover:shadow-xl shadow-lg'
        : 'bg-gradient-to-b from-sky-50 via-violet-50/70 to-pink-50 text-zinc-950 border-sky-300 hover:border-violet-400 hover:shadow-xl shadow-md';
    case 'neo':
    default:
      return isDark
        ? 'bg-gradient-to-b from-zinc-800 via-zinc-800 to-zinc-900 text-white border-zinc-600 hover:border-zinc-400 hover:shadow-xl shadow-lg'
        : 'bg-gradient-to-b from-white via-amber-50/50 to-orange-50/40 text-zinc-950 border-amber-300 hover:border-teal-500 hover:shadow-xl shadow-md';
  }
}

/** Small swatch gradient used on the theme-picker button itself (always dark-safe). */
export function getThemeSwatchClass(themeId: CardTheme): string {
  switch (themeId) {
    case 'poker':
      return 'from-zinc-800 to-black';
    case 'hwatu':
      return 'from-[#2a1a0a] to-black';
    case 'monster':
      return 'from-fuchsia-700 to-lime-500';
    case 'fairytale':
      return 'from-sky-300 to-violet-300';
    case 'neo':
    default:
      return 'from-teal-600 to-fuchsia-600';
  }
}
