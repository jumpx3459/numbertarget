import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Difficulty,
  GameMode,
  CardItem,
  CardTheme,
  HistoryStep,
  BinaryOp,
  UnaryOp,
  GameStats,
  UserProfile,
  SolutionStep,
  Language,
  PuzzleHistoryEntry,
} from './types';
import {
  BINARY_OPS,
  UNARY_OPS,
  generatePuzzle,
  getTodaySeed,
  decodeCustomPuzzle,
  computeDailyStreak,
  getDailyPuzzleNumber,
} from './utils/gameLogic';
import {
  loadGameStats,
  saveGameStats,
  loadSoundSetting,
  saveSoundSetting,
  loadThemeSetting,
  saveThemeSetting,
  loadUserProfile,
  saveUserProfile,
  loadLanguageSetting,
  saveLanguageSetting,
  loadCardThemeSetting,
  saveCardThemeSetting,
  loadPuzzleHistory,
  savePuzzleHistory,
} from './utils/storage';
import { sound } from './utils/audio';
import { getTranslation } from './utils/i18n';
import { getQuoteForPuzzle } from './utils/quotes';

import { Navbar } from './components/Navbar';
import { WorldBackdrop } from './components/WorldBackdrop';
import { SceneBackground } from './components/SceneBackground';
import { MascotState } from './components/Mascot';
import { TargetDisplay } from './components/TargetDisplay';
import { CardDeck } from './components/CardDeck';
import { OperatorPanel } from './components/OperatorPanel';
import { HistoryTimeline } from './components/HistoryTimeline';
import { VictoryModal } from './components/VictoryModal';
import { HintModal } from './components/HintModal';
import { StatsModal } from './components/StatsModal';
import { CustomGameModal } from './components/CustomGameModal';
import { RulesModal } from './components/RulesModal';
import { OnboardingModal } from './components/OnboardingModal';
import { IntroSplash } from './components/IntroSplash';
import { SolutionModal } from './components/SolutionModal';
import { CardThemeModal } from './components/CardThemeModal';

const CARD_COUNTS: Record<Difficulty, number> = {
  easy: 4,
  normal: 5,
  hard: 6,
  expert: 7,
};

export default function App() {
  // Language Localization state
  const [language, setLanguage] = useState<Language>(() => loadLanguageSetting());
  const t = getTranslation(language);

  const handleToggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      saveLanguageSetting(next);
      return next;
    });
  }, []);

  // User Profile & Customization state
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !profile.hasCompletedOnboarding);

  // 마디마디 intro splash — plays once per browser tab (sessionStorage, not
  // localStorage) so it greets you again on a fresh visit but doesn't replay every
  // time you start a new puzzle within the same session.
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('number_target_intro_seen_v1') !== 'true';
    } catch {
      return true;
    }
  });
  const dismissIntro = useCallback(() => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('number_target_intro_seen_v1', 'true');
    } catch {
      // Ignore — worst case the intro plays again next time.
    }
  }, []);

  // Persistence states
  const [stats, setStats] = useState<GameStats>(() => {
    const loaded = loadGameStats();
    // The streak is derived from the completed-dates history rather than trusted as
    // stored, so a gap (the app wasn't opened, or a daily was missed) is reflected
    // correctly the moment the app is opened again — not just after the next win.
    const correctedStreak = computeDailyStreak(loaded.dailyCompletedDates, getTodaySeed());
    if (correctedStreak !== loaded.currentStreak) {
      return { ...loaded, currentStreak: correctedStreak, maxStreak: Math.max(loaded.maxStreak, correctedStreak) };
    }
    return loaded;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => !loadSoundSetting());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadThemeSetting());
  const [cardTheme, setCardTheme] = useState<CardTheme>(() => loadCardThemeSetting());

  // "문제 번호" — mirrors GameStats.totalPlayed, kept in lockstep inside startNewGame's
  // setStats call below. Initialized from the already-loaded stats so a returning
  // player's very first puzzle (shown before any startNewGame call) shows the right
  // number instead of always "1".
  const [puzzleNumber, setPuzzleNumber] = useState<number>(() => stats.totalPlayed + 1);

  // Game configuration
  const [mode, setMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>(() => profile.defaultDifficulty || 'normal');

  // Active puzzle state
  const [puzzle, setPuzzle] = useState(() =>
    generatePuzzle(CARD_COUNTS[profile.defaultDifficulty || 'normal'], profile.defaultDifficulty || 'normal')
  );
  const [initialCards, setInitialCards] = useState<number[]>(() => puzzle.cards);
  const [cards, setCards] = useState<CardItem[]>(() =>
    puzzle.cards.map((v, i) => ({ id: `card-${i}-${Date.now()}`, value: v }))
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);

  // Timers and scoring
  const [timeSec, setTimeSec] = useState<number>(0);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState<number>(60);
  const [blitzScore, setBlitzScore] = useState<number>(0);
  const [blitzCombo, setBlitzCombo] = useState<number>(0);

  // Mirrors timeSec for verifyGameEnd to read without needing timeSec in its own
  // dependency array — that would recreate it (and everything chained off it) every
  // second the timer ticks.
  const timeSecRef = useRef(timeSec);
  useEffect(() => {
    timeSecRef.current = timeSec;
  }, [timeSec]);

  // Mascot companion state
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [mascotTrigger, setMascotTrigger] = useState<number>(0);
  const triggerMascot = useCallback((next: MascotState) => {
    setMascotState(next);
    setMascotTrigger((t) => t + 1);
  }, []);

  useEffect(() => {
    if (mascotState === 'idle') return;
    const timeout = setTimeout(() => setMascotState('idle'), mascotState === 'win' ? 3200 : 1100);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mascotState, mascotTrigger]);

  // Modals
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [showCardThemes, setShowCardThemes] = useState<boolean>(false);

  // Sync sound flavor
  useEffect(() => {
    sound.setSoundFlavor(profile.soundFlavor || 'modern');
  }, [profile.soundFlavor]);

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
    if (newProfile.defaultDifficulty !== difficulty && moves === 0) {
      setDifficulty(newProfile.defaultDifficulty);
      startNewGame('classic', newProfile.defaultDifficulty);
    }
  };

  // Sync audio mute state
  useEffect(() => {
    sound.setMuted(isMuted);
    saveSoundSetting(!isMuted);
  }, [isMuted]);

  // Sync theme
  useEffect(() => {
    saveThemeSetting(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Save stats on update
  useEffect(() => {
    saveGameStats(stats);
  }, [stats]);

  // Persist the chosen card skin (poker / hwatu / monster / fairytale / neo)
  useEffect(() => {
    saveCardThemeSetting(cardTheme);
  }, [cardTheme]);

  // Timer loop for regular modes and Blitz mode
  useEffect(() => {
    if (isWon) return;

    const timer = setInterval(() => {
      setTimeSec((t) => t + 1);

      if (mode === 'blitz') {
        setBlitzTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            sound.playError();
            // Update stats
            setStats((s) => ({
              ...s,
              bestBlitzScore: Math.max(s.bestBlitzScore, blitzScore),
            }));
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isWon, mode, blitzScore]);

  // Countdown to the next daily challenge (local midnight). Runs independently of
  // `isWon` so it keeps ticking even after today's daily has been completed — that's
  // exactly when it matters most.
  const [nextDailyIn, setNextDailyIn] = useState<string>('');
  useEffect(() => {
    if (mode !== 'daily') return;
    const update = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
      const h = Math.floor(diffMs / 3_600_000);
      const m = Math.floor((diffMs % 3_600_000) / 60_000);
      const s = Math.floor((diffMs % 60_000) / 1000);
      setNextDailyIn(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [mode]);

  const todaysDailySeed = getTodaySeed();
  const dailyAlreadyCompletedToday = stats.dailyCompletedDates.includes(todaysDailySeed);
  const dailyPuzzleNumber = getDailyPuzzleNumber(todaysDailySeed);

  // Start new puzzle
  const startNewGame = useCallback(
    (
      newMode = mode,
      newDiff = difficulty,
      customData?: { target: number; cards: number[] }
    ) => {
      let newPuzzle;
      if (customData) {
        newPuzzle = {
          target: customData.target,
          cards: customData.cards,
          difficulty: newDiff,
        };
      } else if (newMode === 'daily') {
        const seed = getTodaySeed();
        newPuzzle = generatePuzzle(5, 'normal', seed);
      } else if (newMode === 'blitz') {
        newPuzzle = generatePuzzle(4, 'easy');
      } else {
        newPuzzle = generatePuzzle(CARD_COUNTS[newDiff], newDiff);
      }

      setPuzzle(newPuzzle);
      setInitialCards(newPuzzle.cards);
      setCards(
        newPuzzle.cards.map((v, i) => ({
          id: `card-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          value: v,
        }))
      );
      setSelected([]);
      setHistory([]);
      setMoves(0);
      setIsWon(false);
      setShowVictory(false);
      setTimeSec(0);

      if (newMode === 'blitz' && mode !== 'blitz') {
        setBlitzTimeLeft(60);
        setBlitzScore(0);
        setBlitzCombo(0);
      }

      setStats((prev) => {
        // Reviewing/replaying a daily challenge already completed today shouldn't
        // count as a new "game played" — otherwise switching back to the Daily tab
        // repeatedly inflates totalPlayed and skews the win-rate stat.
        const isReplayingCompletedDaily =
          newMode === 'daily' && !customData && prev.dailyCompletedDates.includes(getTodaySeed());
        if (isReplayingCompletedDaily) return prev;
        // "문제 번호" tracks totalPlayed 1:1, so it's bumped here too — and skipped
        // in the same replay case, keeping the number the player already saw.
        setPuzzleNumber(prev.totalPlayed + 1);
        return { ...prev, totalPlayed: prev.totalPlayed + 1 };
      });
    },
    [mode, difficulty]
  );

  // Check URL param on mount for shared custom puzzles
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customParam = params.get('p');
    if (customParam) {
      const decoded = decodeCustomPuzzle(customParam);
      if (decoded) {
        setMode('custom');
        startNewGame('custom', 'normal', decoded);
      }
    }
  }, []);

  // Card select toggle
  const toggleSelectCard = useCallback(
    (id: string) => {
      if (isWon) return;
      setSelected((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }
        if (prev.length >= 2) {
          // If already 2 selected, replace the second one
          return [prev[0], id];
        }
        return [...prev, id];
      });
    },
    [isWon]
  );

  // Handle Win Condition Verification
  const verifyGameEnd = useCallback(
    (nextCards: CardItem[], currentMoves: number) => {
      if (nextCards.length === 1 && nextCards[0].value === puzzle.target) {
        setIsWon(true);
        setShowVictory(true);
        triggerMascot('win');

        const newAchievements = [...stats.achievements];
        if (!newAchievements.includes('first_win')) newAchievements.push('first_win');
        if (difficulty === 'expert' && !newAchievements.includes('expert_win')) {
          newAchievements.push('expert_win');
        }
        // Perfect solve: reached the target using the theoretical minimum number
        // of moves (CARD_COUNTS[difficulty] - 1 binary merges, no wasted moves).
        if (
          currentMoves === CARD_COUNTS[difficulty] - 1 &&
          !newAchievements.includes('minimalist')
        ) {
          newAchievements.push('minimalist');
        }

        // Daily challenge tracking — the streak is recomputed from the completed-dates
        // history (not incremented blindly), so it breaks correctly if a day was missed.
        let newStreak = stats.currentStreak;
        let newDailyDates = [...stats.dailyCompletedDates];
        if (mode === 'daily') {
          const today = getTodaySeed();
          if (!newDailyDates.includes(today)) {
            newDailyDates.push(today);
          }
          newStreak = computeDailyStreak(newDailyDates, today);
          if (newStreak >= 3 && !newAchievements.includes('streak_3')) {
            newAchievements.push('streak_3');
          }
        }

        // Blitz mode combo & score
        if (mode === 'blitz') {
          const comboMult = blitzCombo + 1;
          const pointsEarned = 10 * comboMult;
          setBlitzScore((s) => s + pointsEarned);
          setBlitzCombo((c) => c + 1);
          setBlitzTimeLeft((t) => Math.min(90, t + 10)); // Bonus 10s
          sound.playCombo(comboMult);

          if (blitzScore + pointsEarned >= 5 && !newAchievements.includes('blitz_5')) {
            newAchievements.push('blitz_5');
          }
        }

        setStats((prev) => ({
          ...prev,
          totalWon: prev.totalWon + 1,
          currentStreak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          dailyCompletedDates: newDailyDates,
          achievements: newAchievements,
          minMoves: {
            ...prev.minMoves,
            [difficulty]:
              prev.minMoves[difficulty] === 0
                ? currentMoves
                : Math.min(prev.minMoves[difficulty], currentMoves),
          },
        }));

        // Record this clear for the "문제 번호 + 명언 + 브래깅 공유" recap and the
        // (optional) history list in StatsModal.
        const entry: PuzzleHistoryEntry = {
          puzzleNumber,
          target: puzzle.target,
          moves: currentMoves,
          minPossibleMoves: CARD_COUNTS[difficulty] - 1,
          timeSec: timeSecRef.current,
          difficulty,
          mode,
          quoteAuthor: getQuoteForPuzzle(puzzleNumber).author,
          dateISO: new Date().toISOString(),
        };
        savePuzzleHistory([...loadPuzzleHistory(), entry]);
      }
    },
    [puzzle.target, stats, difficulty, mode, blitzCombo, blitzScore, triggerMascot, puzzleNumber]
  );

  // Apply Binary Operation by IDs (+, -, *, /, ^, %)
  const handleApplyBinaryBetween = useCallback(
    (idA: string, idB: string, opKey: string) => {
      if (isWon) return;

      const cardA = cards.find((c) => c.id === idA);
      const cardB = cards.find((c) => c.id === idB);
      if (!cardA || !cardB) return;

      const op = BINARY_OPS.find((o) => o.key === opKey);
      if (!op) return;

      let result = op.fn(cardA.value, cardB.value);
      let usedA = cardA.value;
      let usedB = cardB.value;

      if (result === null && ['-', '/', '^', '%'].includes(op.key)) {
        const alt = op.fn(cardB.value, cardA.value);
        if (alt !== null) {
          result = alt;
          usedA = cardB.value;
          usedB = cardA.value;
        }
      }

      if (result === null) {
        sound.playError();
        triggerMascot('sad');
        return;
      }

      const nextMoves = moves + 1;
      setMoves(nextMoves);
      triggerMascot('happy');

      // Record step in history
      const step: HistoryStep = {
        id: `step-${Date.now()}`,
        cards: [...cards],
        actionDescription: `${usedA} ${op.symbol} ${usedB} = ${result}`,
        operandA: usedA,
        operandB: usedB,
        operatorSymbol: op.symbol,
        result,
        timestamp: Date.now(),
      };
      setHistory((prev) => [...prev, step]);

      const newCard: CardItem = {
        id: `card-res-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        value: result,
        isNew: true,
        isComputed: true,
      };

      const remainingCards = cards.filter((c) => c.id !== idA && c.id !== idB);
      const nextCards = [...remainingCards, newCard];

      setCards(nextCards);
      setSelected([]);
      verifyGameEnd(nextCards, nextMoves);
    },
    [isWon, cards, moves, verifyGameEnd, triggerMascot]
  );

  // Apply Binary Operation (+, -, *, /, ^, %)
  const handleApplyBinary = useCallback(
    (op: BinaryOp) => {
      if (isWon) return;
      if (selected.length === 2) {
        handleApplyBinaryBetween(selected[0], selected[1], op.key);
      } else if (cards.length === 2) {
        handleApplyBinaryBetween(cards[0].id, cards[1].id, op.key);
      }
    },
    [selected, cards, isWon, handleApplyBinaryBetween]
  );

  // Apply Unary Operation by ID
  const handleApplyUnaryOnCard = useCallback(
    (id: string, opKey: string) => {
      if (isWon) return;

      const card = cards.find((c) => c.id === id);
      if (!card) return;

      const op = UNARY_OPS.find((o) => o.key === opKey);
      if (!op) return;

      const result = op.fn(card.value);
      if (result === null) {
        sound.playError();
        triggerMascot('sad');
        return;
      }

      const nextMoves = moves + 1;
      setMoves(nextMoves);
      triggerMascot('happy');

      const step: HistoryStep = {
        id: `step-${Date.now()}`,
        cards: [...cards],
        actionDescription: `${op.symbol}(${card.value}) = ${result}`,
        operandA: card.value,
        operatorSymbol: op.symbol,
        result,
        timestamp: Date.now(),
      };
      setHistory((prev) => [...prev, step]);

      const newCard: CardItem = {
        id: `card-res-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        value: result,
        isNew: true,
        isComputed: true,
      };

      const remainingCards = cards.filter((c) => c.id !== id);
      const nextCards = [...remainingCards, newCard];

      setCards(nextCards);
      setSelected([]);
      verifyGameEnd(nextCards, nextMoves);
    },
    [isWon, cards, moves, verifyGameEnd, triggerMascot]
  );

  // Apply Unary Operation (√, !, x², ×2, ½, ±)
  const handleApplyUnary = useCallback(
    (op: UnaryOp) => {
      if (selected.length !== 1 || isWon) return;
      handleApplyUnaryOnCard(selected[0], op.key);
    },
    [selected, isWon, handleApplyUnaryOnCard]
  );

  // Apply Full Solution directly (Auto-Solve)
  const handleApplyFullSolution = useCallback(
    (steps: SolutionStep[]) => {
      let currentCardList: CardItem[] = initialCards.map((v, i) => ({
        id: `card-${i}-${Date.now()}-${i}`,
        value: v,
      }));
      const newHistory: HistoryStep[] = [];

      for (let sIdx = 0; sIdx < steps.length; sIdx++) {
        const step = steps[sIdx];
        const stepSnapshot = [...currentCardList];

        if (step.type === 'binary' && step.b !== undefined) {
          const idxA = currentCardList.findIndex((c) => c.value === step.a);
          let idxB = currentCardList.findIndex((c, idx) => c.value === step.b && idx !== idxA);
          if (idxA === -1 || idxB === -1) {
            idxB = currentCardList.findIndex((c) => c.value === step.b);
          }

          if (idxA !== -1 && idxB !== -1) {
            const rem = currentCardList.filter((_, i) => i !== idxA && i !== idxB);
            const merged: CardItem = {
              id: `card-sol-${sIdx}-${Date.now()}`,
              value: step.result,
              isComputed: true,
            };
            currentCardList = [...rem, merged];
          }
        } else if (step.type === 'unary') {
          const idx = currentCardList.findIndex((c) => c.value === step.a);
          if (idx !== -1) {
            const rem = currentCardList.filter((_, i) => i !== idx);
            const transformed: CardItem = {
              id: `card-sol-${sIdx}-${Date.now()}`,
              value: step.result,
              isComputed: true,
            };
            currentCardList = [...rem, transformed];
          }
        }

        newHistory.push({
          id: `step-sol-${sIdx}-${Date.now()}`,
          actionDescription: step.explanation,
          cards: stepSnapshot,
          timestamp: Date.now(),
        });
      }

      setCards(currentCardList);
      setHistory(newHistory);
      setMoves(steps.length);
      setSelected([]);
      verifyGameEnd(currentCardList, steps.length);
    },
    [initialCards, verifyGameEnd]
  );

  // Undo last step
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastStep = history[history.length - 1];
    setCards(lastStep.cards);
    setHistory((prev) => prev.slice(0, -1));
    setSelected([]);
    setIsWon(false);
    setShowVictory(false);
    setMoves((m) => Math.max(0, m - 1));
  }, [history]);

  // Rollback to specific history step index
  const handleRollback = useCallback(
    (index: number) => {
      if (index < 0 || index >= history.length) return;
      const targetStep = history[index];
      setCards(targetStep.cards);
      setHistory((prev) => prev.slice(0, index));
      setSelected([]);
      setIsWon(false);
      setShowVictory(false);
      setMoves(index);
    },
    [history]
  );

  // Reset current puzzle to starting cards
  const handleReset = useCallback(() => {
    setCards(
      initialCards.map((v, i) => ({
        id: `card-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        value: v,
      }))
    );
    setSelected([]);
    setHistory([]);
    setMoves(0);
    setIsWon(false);
    setShowVictory(false);
  }, [initialCards]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // 1 ~ 7 key: Select Card
      if (/^[1-7]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < cards.length) {
          e.preventDefault();
          toggleSelectCard(cards[idx].id);
        }
        return;
      }

      // Binary operators
      if (e.key === '+') {
        const op = BINARY_OPS.find((o) => o.key === '+');
        if (op) {
          e.preventDefault();
          handleApplyBinary(op);
        }
      } else if (e.key === '-') {
        const op = BINARY_OPS.find((o) => o.key === '-');
        if (op) {
          e.preventDefault();
          handleApplyBinary(op);
        }
      } else if (e.key === '*') {
        const op = BINARY_OPS.find((o) => o.key === '*');
        if (op) {
          e.preventDefault();
          handleApplyBinary(op);
        }
      } else if (e.key === '/') {
        const op = BINARY_OPS.find((o) => o.key === '/');
        if (op) {
          e.preventDefault();
          handleApplyBinary(op);
        }
      } else if (e.key === '^') {
        const op = BINARY_OPS.find((o) => o.key === '^');
        if (op) {
          e.preventDefault();
          handleApplyBinary(op);
        }
      } else if (e.key === '%') {
        const op = BINARY_OPS.find((o) => o.key === '%');
        if (op) {
          e.preventDefault();
          handleApplyBinary(op);
        }
      }

      // Unary operators
      else if (e.key.toLowerCase() === 's') {
        const op = UNARY_OPS.find((o) => o.key === 'sqrt');
        if (op) {
          e.preventDefault();
          handleApplyUnary(op);
        }
      } else if (e.key === '!') {
        const op = UNARY_OPS.find((o) => o.key === 'fact');
        if (op) {
          e.preventDefault();
          handleApplyUnary(op);
        }
      }

      // Undo / Reset / Hint / Solution / New Game
      else if (e.key.toLowerCase() === 'u' || (e.ctrlKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        sound.playUndo();
        handleUndo();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        sound.playUndo();
        handleReset();
      } else if (e.key.toLowerCase() === 'h' || e.key === ' ') {
        e.preventDefault();
        sound.playHint();
        setShowHint(true);
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        sound.playCardSelect();
        setShowSolution(true);
      } else if (e.key.toLowerCase() === 'o' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        sound.playCardSelect();
        setShowOnboarding(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards, toggleSelectCard, handleApplyBinary, handleApplyUnary, handleUndo, handleReset]);

  return (
    <div
      className={`relative isolate overflow-hidden min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-[#0d1b2e] via-zinc-950 to-[#1a0f2e] text-zinc-100'
          : 'bg-gradient-to-b from-sky-200 via-cyan-50 via-30% to-amber-50 text-zinc-900'
      }`}
    >
      {/* Real-world photo backdrop, changes daily like a wallpaper of the day */}
      <WorldBackdrop theme={theme} language={language} />
      <SceneBackground theme={theme} />

      {/* Floating glass panel holding the whole game, framed by the photo behind it */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 md:p-10">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className={`w-full max-w-3xl max-h-[92vh] flex flex-col justify-between rounded-[1.75rem] sm:rounded-[2.25rem] border backdrop-blur-xl shadow-2xl overflow-y-auto transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-zinc-950/45 border-white/10 shadow-black/50'
              : 'bg-white/40 border-white/60 shadow-zinc-900/10'
          }`}
        >
      {/* Top Header Navigation */}
      <Navbar
        mode={mode}
        onSelectMode={(newMode) => {
          // Re-tapping the already-active mode shouldn't wipe an in-progress (or just
          // completed) puzzle — that was silently resetting the board and inflating
          // totalPlayed every time someone tapped the Daily tab they were already on.
          if (newMode === mode) return;
          setMode(newMode);
          startNewGame(newMode, difficulty);
        }}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenStats={() => setShowStats(true)}
        onOpenRules={() => setShowRules(true)}
        onOpenCustom={() => setShowCustom(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenCardThemes={() => setShowCardThemes(true)}
        dailyStreak={stats.currentStreak}
        profile={profile}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Playing Field */}
      <main className="flex-1 flex flex-col justify-center py-2">
        {/* Daily Challenge identity + "already completed today" status banner */}
        {mode === 'daily' && (
          <div className="w-full max-w-2xl mx-auto px-4 mb-3">
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between gap-2 flex-wrap transition-all ${
                dailyAlreadyCompletedToday
                  ? theme === 'dark'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-emerald-50 border-emerald-200'
                  : theme === 'dark'
                  ? 'bg-zinc-900/60 border-zinc-800/80'
                  : 'bg-white border-zinc-200 shadow-xs'
              }`}
            >
              <span
                className={`text-xs sm:text-sm font-bold font-mono-num ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                {language === 'ko' ? `데일리 챌린지 Day #${dailyPuzzleNumber}` : `Daily Challenge Day #${dailyPuzzleNumber}`}
              </span>

              {dailyAlreadyCompletedToday ? (
                <span
                  className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  <span>
                    {language === 'ko' ? '✅ 오늘의 챌린지 완료' : '✅ Completed today'}
                  </span>
                  <span className="opacity-60">·</span>
                  <span className="font-mono-num">
                    {language === 'ko' ? `다음 문제까지 ${nextDailyIn}` : `Next in ${nextDailyIn}`}
                  </span>
                </span>
              ) : stats.currentStreak > 0 ? (
                <span
                  className={`text-xs sm:text-sm font-bold flex items-center gap-1 ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  }`}
                >
                  🔥 {language === 'ko' ? `${stats.currentStreak}일 연속 도전 중` : `${stats.currentStreak}-day streak`}
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* Difficulty Settings (for Classic mode) */}
        {mode === 'classic' && (
          <div className="w-full max-w-2xl mx-auto px-4 mb-3">
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-900/60 border-zinc-800/80'
                  : 'bg-white border-zinc-200 shadow-xs'
              }`}
            >
              <span
                className={`text-sm sm:text-base font-bold ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                {language === 'ko' ? '난이도 선택' : 'Difficulty'}
              </span>
              <div className="flex flex-wrap justify-end gap-1">
                {(
                  [
                    ['easy', language === 'ko' ? '쉬움 (4장)' : 'Easy (4)'],
                    ['normal', language === 'ko' ? '보통 (5장)' : 'Normal (5)'],
                    ['hard', language === 'ko' ? '어려움 (6장)' : 'Hard (6)'],
                    ['expert', language === 'ko' ? '익스퍼트 (7장)' : 'Expert (7)'],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => {
                      sound.playCardSelect();
                      setDifficulty(val);
                      startNewGame('classic', val);
                    }}
                    className={`text-sm font-bold px-2.5 py-1.5 rounded-xl transition-all ${
                      difficulty === val
                        ? 'bg-teal-600 text-white shadow-xs'
                        : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Target Display */}
        <TargetDisplay
          target={puzzle.target}
          moves={moves}
          mode={mode}
          timeLeft={blitzTimeLeft}
          timeSec={timeSec}
          score={blitzScore}
          combo={blitzCombo}
          theme={theme}
          puzzleNumber={puzzleNumber}
          closestValue={
            cards.length > 0
              ? cards.reduce(
                  (prev, curr) =>
                    Math.abs(curr.value - puzzle.target) < Math.abs(prev - puzzle.target)
                      ? curr.value
                      : prev,
                  cards[0].value
                )
              : undefined
          }
          aura={profile.aura}
          language={language}
        />

        {/* Card Deck with Tactile Drag-and-Drop */}
        <CardDeck
          cards={cards}
          selected={selected}
          onToggleSelect={toggleSelectCard}
          onApplyBinaryBetween={handleApplyBinaryBetween}
          onApplyUnaryOnCard={handleApplyUnaryOnCard}
          disabled={isWon}
          theme={theme}
          target={puzzle.target}
          aura={profile.aura}
          enableMicroHaptics={profile.enableMicroHaptics}
          language={language}
          cardTheme={cardTheme}
          mascotState={mascotState}
          mascotTrigger={mascotTrigger}
        />

        {/* Operator Dock with Live Ghost Result Preview */}
        <OperatorPanel
          cards={cards}
          selectedIds={selected}
          onApplyBinary={handleApplyBinary}
          onApplyUnary={handleApplyUnary}
          disabled={isWon}
          theme={theme}
          aura={profile.aura}
          enableMicroHaptics={profile.enableMicroHaptics}
          language={language}
        />

        {/* Action Controls & Interactive History Rollback */}
        <HistoryTimeline
          history={history}
          onRollback={handleRollback}
          onUndo={handleUndo}
          onReset={handleReset}
          onOpenHint={() => setShowHint(true)}
          onOpenSolution={() => setShowSolution(true)}
          onNewGame={() => startNewGame(mode, difficulty)}
          disabled={isWon}
          theme={theme}
          language={language}
        />

      </main>

      {/* Footer Branding */}
      <footer
        className={`w-full text-center py-3 text-sm font-medium border-t ${
          theme === 'dark'
            ? 'border-zinc-900 text-zinc-600'
            : 'border-zinc-200 text-zinc-400'
        }`}
      >
        TARGET BEYOND • Designed for Sensory Minimalism & Tactile Math
      </footer>
        </motion.div>
      </div>

      {/* Dialog Modals */}
      <VictoryModal
        isOpen={showVictory}
        target={puzzle.target}
        moves={moves}
        minPossibleMoves={CARD_COUNTS[difficulty] - 1}
        timeSec={timeSec}
        mode={mode}
        puzzleNumber={puzzleNumber}
        history={history}
        onNextGame={() => startNewGame(mode, difficulty)}
        onReplay={handleReset}
        theme={theme}
        score={blitzScore}
        language={language}
        dailyPuzzleNumber={dailyPuzzleNumber}
        dailyStreak={stats.currentStreak}
      />

      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        cards={cards}
        target={puzzle.target}
        initialCards={initialCards}
        initialSolution={puzzle.solution}
        onOpenFullSolution={() => setShowSolution(true)}
        theme={theme}
        language={language}
      />

      <SolutionModal
        isOpen={showSolution}
        onClose={() => setShowSolution(false)}
        target={puzzle.target}
        initialCards={initialCards}
        currentCards={cards}
        solution={puzzle.solution}
        allSolutions={puzzle.allSolutions}
        onApplyFullSolution={handleApplyFullSolution}
        onResetBoard={handleReset}
        onUndo={handleUndo}
        onNewGame={() => startNewGame(mode, difficulty)}
        canUndo={history.length > 0}
        theme={theme}
        language={language}
      />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        theme={theme}
        language={language}
      />

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        theme={theme}
        language={language}
      />

      <CustomGameModal
        isOpen={showCustom}
        onClose={() => setShowCustom(false)}
        onStartCustom={(target, customCards) => {
          setMode('custom');
          startNewGame('custom', 'normal', { target, cards: customCards });
        }}
        theme={theme}
        language={language}
      />

      <CardThemeModal
        isOpen={showCardThemes}
        onClose={() => setShowCardThemes(false)}
        cardTheme={cardTheme}
        onSelectCardTheme={setCardTheme}
        theme={theme}
        language={language}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSaveProfile={handleSaveProfile}
        initialProfile={profile}
        theme={theme}
        language={language}
      />

      <IntroSplash isOpen={showIntro} onFinish={dismissIntro} language={language} />
    </div>
  );
}

