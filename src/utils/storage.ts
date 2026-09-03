import { CardTheme, GameStats, Language, PuzzleHistoryEntry, UserProfile } from '../types';

const STATS_KEY = 'number_target_stats_v1';
const SOUND_KEY = 'number_target_sound_v1';
const THEME_KEY = 'number_target_theme_v1';
const PROFILE_KEY = 'number_target_profile_v1';
const LANG_KEY = 'number_target_lang_v1';
const CARD_THEME_KEY = 'number_target_card_theme_v1';
const PUZZLE_HISTORY_KEY = 'number_target_puzzle_history_v1';
const PUZZLE_HISTORY_MAX = 200;

export const DEFAULT_PROFILE: UserProfile = {
  nickname: '넘버마스터',
  archetype: 'strategist',
  avatarEmoji: '🧠',
  aura: 'teal',
  soundFlavor: 'modern',
  language: 'ko',
  defaultDifficulty: 'normal',
  enableConfetti: true,
  enableMicroHaptics: true,
  hasCompletedOnboarding: false,
};

export const INITIAL_STATS: GameStats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestBlitzScore: 0,
  fastestSolveSec: 0,
  minMoves: {
    easy: 0,
    normal: 0,
    hard: 0,
    expert: 0,
  },
  dailyCompletedDates: [],
  achievements: [],
};

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return INITIAL_STATS;
    return { ...INITIAL_STATS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_STATS;
  }
}

export function saveGameStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function loadSoundSetting(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function saveSoundSetting(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // Ignore
  }
}

export function loadThemeSetting(): 'dark' | 'light' {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveThemeSetting(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function loadLanguageSetting(): Language {
  try {
    const raw = localStorage.getItem(LANG_KEY);
    if (raw === 'en' || raw === 'ko') return raw;
    const profile = loadUserProfile();
    if (profile.language === 'en' || profile.language === 'ko') return profile.language;
    // Default to browser language or Korean
    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('en')) return 'en';
    return 'ko';
  } catch {
    return 'ko';
  }
}

export function saveLanguageSetting(lang: Language): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Ignore
  }
}

const VALID_CARD_THEMES: CardTheme[] = ['neo', 'poker', 'hwatu', 'monster', 'fairytale'];

export function loadCardThemeSetting(): CardTheme {
  try {
    const raw = localStorage.getItem(CARD_THEME_KEY);
    if (raw && (VALID_CARD_THEMES as string[]).includes(raw)) return raw as CardTheme;
    return 'neo';
  } catch {
    return 'neo';
  }
}

export function saveCardThemeSetting(cardTheme: CardTheme): void {
  try {
    localStorage.setItem(CARD_THEME_KEY, cardTheme);
  } catch {
    // Ignore
  }
}

export function loadPuzzleHistory(): PuzzleHistoryEntry[] {
  try {
    const raw = localStorage.getItem(PUZZLE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePuzzleHistory(entries: PuzzleHistoryEntry[]): void {
  try {
    // Keep only the most recent PUZZLE_HISTORY_MAX entries — trimming from the front
    // since entries are appended oldest-first, same as the daily-completed-dates list.
    const trimmed =
      entries.length > PUZZLE_HISTORY_MAX ? entries.slice(entries.length - PUZZLE_HISTORY_MAX) : entries;
    localStorage.setItem(PUZZLE_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save puzzle history', e);
  }
}
