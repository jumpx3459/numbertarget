export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

export type GameMode = 'classic' | 'blitz' | 'daily' | 'custom';

export type Language = 'ko' | 'en';

export type LicensePlateCountry = 'kr' | 'us' | 'eu' | 'jp' | 'gb' | 'fr';

export interface LicensePlateTheme {
  id: LicensePlateCountry;
  name: string;
  country: string;
  flag: string;
  subLabel: string;
  accentColor: string;
}

export interface CardItem {
  id: string;
  value: number;
  isNew?: boolean;
  isComputed?: boolean;
}

export interface BinaryOp {
  key: string;
  label: string;
  symbol: string;
  name: string;
  description: string;
  fn: (a: number, b: number) => number | null;
}

export interface UnaryOp {
  key: string;
  label: string;
  symbol: string;
  name: string;
  description: string;
  fn: (a: number) => number | null;
}

export interface HistoryStep {
  id: string;
  cards: CardItem[];
  actionDescription: string;
  operandA?: number;
  operandB?: number;
  operatorSymbol?: string;
  result?: number;
  timestamp: number;
}

export interface SolutionStep {
  type: 'binary' | 'unary';
  opKey: string;
  opLabel: string;
  a: number;
  b?: number;
  result: number;
  explanation: string;
}

export interface CategorizedSolution {
  id: string;
  title: string;
  category: 'arithmetic' | 'add_sub' | 'mul_div' | 'power_exp' | 'special_unary' | 'shortest' | 'all';
  categoryLabel: string;
  badgeColor: string;
  description: string;
  usedOps: string[];
  stepCount: number;
  steps: SolutionStep[];
}

export interface Puzzle {
  target: number;
  initialCards: number[];
  cards?: number[];
  difficulty: Difficulty;
  solution?: SolutionStep[];
  allSolutions?: CategorizedSolution[];
  seed?: string;
}

export type ThemeAura = 'teal' | 'mint' | 'rose' | 'violet' | 'amber';

export type SoundFlavor = 'modern' | 'retro' | 'minimal';

export interface UserProfile {
  nickname: string;
  archetype: 'speedrunner' | 'strategist' | 'minimalist' | 'alchemist';
  avatarEmoji: string;
  aura: ThemeAura;
  soundFlavor: SoundFlavor;
  language: Language;
  defaultDifficulty: Difficulty;
  enableConfetti: boolean;
  enableMicroHaptics: boolean;
  hasCompletedOnboarding: boolean;
}

export interface GameStats {
  totalPlayed: number;
  totalWon: number;
  currentStreak: number;
  maxStreak: number;
  bestBlitzScore: number;
  fastestSolveSec: number;
  minMoves: Record<Difficulty, number>;
  dailyCompletedDates: string[];
  achievements: string[];
}
