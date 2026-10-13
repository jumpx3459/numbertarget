import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useModalA11y } from '../hooks/useModalA11y';
import {
  Sparkles,
  Zap,
  Brain,
  Leaf,
  Wand2,
  Volume2,
  Check,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Palette,
  Award,
  Dice5,
  X,
  Gamepad2,
} from 'lucide-react';
import { UserProfile, ThemeAura, SoundFlavor, Difficulty, Language } from '../types';
import { sound } from '../utils/audio';
import { getTranslation } from '../utils/i18n';
import forestBg from '../assets/maldimaldi-forest-bg.jpg';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  theme: 'dark' | 'light';
  language?: Language;
}

const NICKNAME_PRESETS = [
  'NeonSolver',
  'BrainHacker',
  'TargetSniper',
  'AlphaLogic',
  'ZenMaster',
  'MathNova',
  'SpeedQueen',
  'QuantumCoder',
  'PixelStrategist',
  'CyberEuler',
];

const getArchetypes = (lang: Language | string = 'ko') => [
  {
    id: 'speedrunner' as const,
    title: lang === 'ko' ? '스피드러너' : 'Speed Runner',
    subtitle: lang === 'ko' ? '초고속 직관 연산' : 'Rapid Intuition',
    icon: Zap,
    emoji: '⚡',
    desc: lang === 'ko' ? '빠른 반응속도로 순식간에 정답을 꿰뚫는 타임어택 플레이어' : 'High speed and lightning-fast mathematical intuition',
    tag: 'SPEED',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'strategist' as const,
    title: lang === 'ko' ? '전략가' : 'Strategist',
    subtitle: lang === 'ko' ? '최소 무브 수 설계자' : 'Minimal Moves Master',
    icon: Brain,
    emoji: '🧠',
    desc: lang === 'ko' ? '한 수 앞을 내다보고 가장 최적의 경로로 계산하는 브레인' : 'Plans multiple moves ahead for shortest mathematical solutions',
    tag: 'TACTIC',
    color: 'from-teal-500 to-fuchsia-500',
  },
  {
    id: 'minimalist' as const,
    title: lang === 'ko' ? '미니멀리스트' : 'Minimalist',
    subtitle: lang === 'ko' ? '감각적인 힐링 집중' : 'Zen Focus',
    icon: Leaf,
    emoji: '🌿',
    desc: lang === 'ko' ? '군더더기 없는 깔끔함과 깊은 몰입감을 즐기는 젠 모드' : 'Enjoys clean aesthetics and deep focused problem solving',
    tag: 'ZEN',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'alchemist' as const,
    title: lang === 'ko' ? '수식 연금술사' : 'Math Alchemist',
    subtitle: lang === 'ko' ? '다양한 연산자 마스터' : 'Advanced Operator Pro',
    icon: Wand2,
    emoji: '🔮',
    desc: lang === 'ko' ? '제곱근, 팩토리얼, 거듭제곱을 자유자재로 다루는 마술사' : 'Master of square roots, factorials, and powers',
    tag: 'MAGIC',
    color: 'from-pink-500 to-rose-500',
  },
];

const getAuras = (lang: Language | string = 'ko'): { id: ThemeAura; name: string; bgClass: string; borderClass: string; glowClass: string; hex: string }[] => [
  {
    id: 'teal',
    name: lang === 'ko' ? '오션 틸' : 'Ocean Teal',
    bgClass: 'bg-teal-500',
    borderClass: 'border-teal-500',
    glowClass: 'shadow-teal-500/40',
    hex: '#14b8a6',
  },
  {
    id: 'mint',
    name: lang === 'ko' ? '트로피컬 민트' : 'Tropical Mint',
    bgClass: 'bg-emerald-400',
    borderClass: 'border-emerald-400',
    glowClass: 'shadow-emerald-400/40',
    hex: '#34d399',
  },
  {
    id: 'rose',
    name: lang === 'ko' ? '선셋 로즈' : 'Sunset Rose',
    bgClass: 'bg-rose-500',
    borderClass: 'border-rose-500',
    glowClass: 'shadow-rose-500/40',
    hex: '#f43f5e',
  },
  {
    id: 'violet',
    name: lang === 'ko' ? '카니발 마젠타' : 'Carnival Magenta',
    bgClass: 'bg-fuchsia-500',
    borderClass: 'border-fuchsia-500',
    glowClass: 'shadow-fuchsia-500/40',
    hex: '#d946ef',
  },
  {
    id: 'amber',
    name: lang === 'ko' ? '선샤인 앰버' : 'Sunshine Amber',
    bgClass: 'bg-amber-400',
    borderClass: 'border-amber-400',
    glowClass: 'shadow-amber-400/40',
    hex: '#fbbf24',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onSaveProfile,
  theme,
  language = 'ko',
}) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);
  const archetypes = getArchetypes(language);
  const auras = getAuras(language);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [nickname, setNickname] = useState<string>(initialProfile.nickname || (language === 'ko' ? '넘버마스터' : 'NumberMaster'));
  const [archetype, setArchetype] = useState<UserProfile['archetype']>(initialProfile.archetype || 'strategist');
  const [aura, setAura] = useState<ThemeAura>(initialProfile.aura || 'teal');
  const [soundFlavor, setSoundFlavor] = useState<SoundFlavor>(initialProfile.soundFlavor || 'modern');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialProfile.defaultDifficulty || 'normal');
  const [enableConfetti, setEnableConfetti] = useState<boolean>(initialProfile.enableConfetti ?? true);
  const [enableMicroHaptics, setEnableMicroHaptics] = useState<boolean>(initialProfile.enableMicroHaptics ?? true);

  // Sandbox interactive state with 5 cards
  const [sandboxCards, setSandboxCards] = useState<{ id: string; value: number; isComputed?: boolean }[]>([
    { id: 'sb-1', value: 8 },
    { id: 'sb-2', value: 3 },
    { id: 'sb-3', value: 5 },
    { id: 'sb-4', value: 4 },
    { id: 'sb-5', value: 2 },
  ]);
  const [sandboxSelected, setSandboxSelected] = useState<string[]>([]);
  const [sandboxTarget] = useState<number>(22);
  const [sandboxSuccess, setSandboxSuccess] = useState<boolean>(false);

  const resetSandbox = () => {
    setSandboxCards([
      { id: `sb-1-${Date.now()}`, value: 8 },
      { id: `sb-2-${Date.now()}`, value: 3 },
      { id: `sb-3-${Date.now()}`, value: 5 },
      { id: `sb-4-${Date.now()}`, value: 4 },
      { id: `sb-5-${Date.now()}`, value: 2 },
    ]);
    setSandboxSelected([]);
    setSandboxSuccess(false);
  };

  const handleSandboxToggle = (id: string) => {
    sound.playCardSelect();
    if (sandboxSelected.includes(id)) {
      setSandboxSelected((prev) => prev.filter((item) => item !== id));
    } else {
      if (sandboxSelected.length >= 2) {
        setSandboxSelected([sandboxSelected[1], id]);
      } else {
        setSandboxSelected((prev) => [...prev, id]);
      }
    }
  };

  const handleSandboxBinary = (op: '+' | '-' | '*' | '/') => {
    if (sandboxSelected.length !== 2) return;
    const [idA, idB] = sandboxSelected;
    const cardA = sandboxCards.find((c) => c.id === idA);
    const cardB = sandboxCards.find((c) => c.id === idB);
    if (!cardA || !cardB) return;

    let res = 0;
    if (op === '+') res = cardA.value + cardB.value;
    else if (op === '-') res = Math.abs(cardA.value - cardB.value);
    else if (op === '*') res = cardA.value * cardB.value;
    else if (op === '/') {
      if (cardA.value % cardB.value === 0) res = cardA.value / cardB.value;
      else if (cardB.value % cardA.value === 0) res = cardB.value / cardA.value;
      else return;
    }

    sound.playMerge();
    const newCards = sandboxCards.filter((c) => c.id !== idA && c.id !== idB);
    newCards.push({ id: `res-${Date.now()}`, value: res, isComputed: true });
    setSandboxCards(newCards);
    setSandboxSelected([]);

    if (newCards.some((c) => c.value === sandboxTarget)) {
      setSandboxSuccess(true);
      sound.playVictory();
    }
  };

  const handleSandboxUnary = (op: 'double' | 'square' | 'sqrt') => {
    if (sandboxSelected.length !== 1) return;
    const idA = sandboxSelected[0];
    const cardA = sandboxCards.find((c) => c.id === idA);
    if (!cardA) return;

    let res = cardA.value;
    if (op === 'double') res = cardA.value * 2;
    else if (op === 'square') res = cardA.value * cardA.value;
    else if (op === 'sqrt') {
      const root = Math.sqrt(cardA.value);
      if (Number.isInteger(root)) res = root;
      else return;
    }

    sound.playMerge();
    const newCards = sandboxCards.map((c) => (c.id === idA ? { ...c, value: res, isComputed: true } : c));
    setSandboxCards(newCards);
    setSandboxSelected([]);

    if (newCards.some((c) => c.value === sandboxTarget)) {
      setSandboxSuccess(true);
      sound.playVictory();
    }
  };

  const handleRandomNickname = () => {
    sound.playCardSelect();
    const randomPick = NICKNAME_PRESETS[Math.floor(Math.random() * NICKNAME_PRESETS.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    setNickname(`${randomPick}_${num}`);
  };

  const handleFinish = () => {
    const selectedArch = archetypes.find((a) => a.id === archetype);
    const updatedProfile: UserProfile = {
      nickname: nickname.trim() || (language === 'ko' ? '넘버마스터' : 'NumberMaster'),
      archetype,
      avatarEmoji: selectedArch?.emoji || '🧠',
      aura,
      soundFlavor,
      language: (language as Language) || 'ko',
      defaultDifficulty: difficulty,
      enableConfetti,
      enableMicroHaptics,
      hasCompletedOnboarding: true,
    };

    sound.setSoundFlavor(soundFlavor);
    onSaveProfile(updatedProfile);
    sound.playVictory();

    if (enableConfetti) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }

    onClose();
  };

  const panelRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const currentArchetype = archetypes.find((a) => a.id === archetype) || archetypes[1];
  const currentAura = auras.find((a) => a.id === aura) || auras[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${forestBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 backdrop-blur-md" />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-modal-title"
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden relative z-10 ${
          isDark
            ? 'bg-zinc-950 border-zinc-800/90 text-white shadow-black/80'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Top Progress & Header Bar */}
        <div className="pt-5 px-6 pb-4 border-b border-zinc-800/40 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-md ${
                  currentAura.bgClass
                } text-white`}
              >
                {step}
              </span>
              <h2 id="onboarding-modal-title" className="font-display font-black text-lg sm:text-xl tracking-tight">
                {step === 1 && (language === 'ko' ? '플레이어 정체성 설정' : 'Player Identity Setup')}
                {step === 2 && (language === 'ko' ? '30초 인터랙티브 튜토리얼' : 'Interactive Tutorial')}
                {step === 3 && (language === 'ko' ? '게임 환경 & 사운드 설정' : 'Game Preferences & Sound')}
                {step === 4 && (language === 'ko' ? '플레이어 패스 발급' : 'Player Pass Verified')}
              </h2>
            </div>

            <button
              onClick={() => {
                sound.playCardDeselect();
                onClose();
              }}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
              }`}
              title={language === 'ko' ? '건너뛰기' : 'Skip'}
              aria-label={language === 'ko' ? '건너뛰기' : 'Skip'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                onClick={() => {
                  sound.playCardSelect();
                  setStep(s as 1 | 2 | 3 | 4);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  s === step
                    ? `w-8 ${currentAura.bgClass}`
                    : s < step
                    ? isDark
                      ? 'w-4 bg-zinc-700'
                      : 'w-4 bg-zinc-300'
                    : isDark
                    ? 'w-2 bg-zinc-800'
                    : 'w-2 bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body with Step Transitions */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: Persona & Aura */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Nickname Input */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {language === 'ko' ? '플레이어 닉네임' : 'Player Nickname'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={14}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder={language === 'ko' ? '닉네임을 입력하세요' : 'Enter your nickname'}
                      className={`flex-1 px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all outline-hidden ${
                        isDark
                          ? 'bg-zinc-900 border-zinc-750 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleRandomNickname}
                      className={`px-3 py-2.5 rounded-2xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                        isDark
                          ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                          : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                      }`}
                      title={language === 'ko' ? '랜덤 생성' : 'Randomize'}
                    >
                      <Dice5 className="w-4 h-4 text-teal-400" />
                      <span className="hidden sm:inline">{language === 'ko' ? '랜덤' : 'Random'}</span>
                    </button>
                  </div>
                </div>

                {/* Archetype Selector */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {language === 'ko' ? '플레이어 성향 아키타입' : 'Player Archetype'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {archetypes.map((arch) => {
                      const isSelected = archetype === arch.id;
                      return (
                        <motion.button
                          key={arch.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            sound.playCardSelect();
                            setArchetype(arch.id);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? isDark
                                ? 'bg-zinc-900 border-teal-500/80 ring-2 ring-teal-500/30 shadow-lg shadow-teal-500/20'
                                : 'bg-teal-50/70 border-teal-400 ring-2 ring-teal-300/40 shadow-md'
                              : isDark
                              ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                              : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{arch.emoji}</span>
                              <div>
                                <div className="font-extrabold text-sm flex items-center gap-1.5">
                                  <span>{arch.title}</span>
                                </div>
                                <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                  {arch.subtitle}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <p className={`text-[11px] leading-snug mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {arch.desc}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Aura Color Themes */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <Palette className="w-3.5 h-3.5" />
                    <span>{language === 'ko' ? '개인화 액센트 아우라 (테마 컬러)' : 'Personal Accent Aura (Color)'}</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {auras.map((a) => {
                      const isSelected = aura === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            sound.playCardSelect();
                            setAura(a.id);
                          }}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${
                            isSelected
                              ? isDark
                                ? 'bg-zinc-900 border-zinc-600 ring-2 ring-white/20 scale-105'
                                : 'bg-zinc-100 border-zinc-400 ring-2 ring-black/10 scale-105'
                              : isDark
                              ? 'bg-zinc-950 border-zinc-850 opacity-60 hover:opacity-100'
                              : 'bg-zinc-50 border-zinc-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full ${a.bgClass} shadow-md transition-transform ${
                              isSelected ? 'scale-110 ring-2 ring-white' : ''
                            }`}
                          />
                          <span className="text-[10px] font-bold tracking-tight text-center leading-none">
                            {a.name.split(' ')[1] || a.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Interactive Sandbox Tutorial */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Sandbox Goal HUD */}
                <div
                  className={`p-4 rounded-2xl border text-center relative overflow-hidden ${
                    isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-teal-50/50 border-teal-100'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                    {language === 'ko' ? '미션: 5장의 카드로 목표 숫자 만들기' : 'Mission: Reach target number with 5 cards'}
                  </span>
                  <div className="font-display font-black text-4xl font-mono-num mt-1 text-teal-400">
                    TARGET: {sandboxTarget}
                  </div>
                  <div className={`text-[11px] mt-2 space-y-1 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <p className="font-semibold text-teal-300">
                      {language === 'ko'
                        ? '💡 5장의 카드([8], [3], [5], [4], [2])로 목표 22를 완성해보세요!'
                        : '💡 Use 5 cards ([8], [3], [5], [4], [2]) to make target 22!'}
                    </p>
                    <p className="text-[10.5px] opacity-80">
                      {language === 'ko'
                        ? '• 방법 A: [8] × [3] = 24 만든 뒤 [2]를 선택해 [-] (뺄셈) 하기'
                        : '• Method A: [8] × [3] = 24, then select [2] and press [-]'}
                    </p>
                    <p className="text-[10.5px] opacity-80">
                      {language === 'ko'
                        ? '• 방법 B: [5] × [4] = 20 만든 뒤 [2]를 선택해 [+] (덧셈) 하기'
                        : '• Method B: [5] × [4] = 20, then select [2] and press [+]'}
                    </p>
                  </div>
                </div>

                {/* Sandbox Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
                    <span>
                      {language === 'ko' ? `보유 카드 (${sandboxCards.length}장)` : `Current Cards (${sandboxCards.length})`}
                    </span>
                    <button
                      onClick={resetSandbox}
                      className="flex items-center gap-1 text-[11px] text-teal-400 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{language === 'ko' ? '다시 시도' : 'Retry'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 min-h-[88px]">
                    {sandboxCards.map((c) => {
                      const isSel = sandboxSelected.includes(c.id);
                      const isComputed = Boolean(c.isComputed);
                      return (
                        <motion.button
                          key={c.id}
                          type="button"
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleSandboxToggle(c.id)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-black text-2xl sm:text-3xl font-mono-num transition-all select-none shadow-md cursor-pointer border-2 ${
                            c.value === sandboxTarget
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/80 border-emerald-300 scale-105 shadow-xl'
                              : isSel
                              ? 'bg-teal-600 text-white ring-4 ring-teal-400 border-teal-300 -translate-y-1.5 shadow-xl'
                              : isComputed
                              ? isDark
                                ? 'bg-gradient-to-b from-fuchsia-900/90 via-fuchsia-950 to-zinc-950 text-white border-fuchsia-400 ring-2 ring-fuchsia-500/40 shadow-lg shadow-fuchsia-900/40'
                                : 'bg-gradient-to-b from-fuchsia-100 via-fuchsia-50 to-white text-fuchsia-950 border-fuchsia-500 ring-2 ring-fuchsia-300/40 shadow-md'
                              : isDark
                              ? 'bg-zinc-900 text-white border-zinc-700 hover:border-zinc-500 shadow-sm'
                              : 'bg-white text-zinc-950 border-zinc-400 hover:border-teal-400 shadow-md'
                          }`}
                        >
                          {/* Computed Badge */}
                          {isComputed && !isSel && c.value !== sandboxTarget && (
                            <span
                              className={`absolute -top-2 right-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-black border flex items-center gap-0.5 leading-none shadow-xs ${
                                isDark
                                  ? 'bg-fuchsia-900 text-fuchsia-100 border-fuchsia-400'
                                  : 'bg-fuchsia-200 text-fuchsia-950 border-fuchsia-400'
                              }`}
                            >
                              ✨
                            </span>
                          )}

                          <span className="leading-none">{c.value}</span>
                          {c.value === sandboxTarget && (
                            <span className="text-[8px] font-black tracking-widest bg-black/40 px-1.5 rounded-full mt-0.5">
                              MATCH!
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Sandbox Operators */}
                <div className="space-y-3 pt-2">
                  {/* Binary */}
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 block mb-1">
                      {language === 'ko' ? '이항 연산자 (카드 2장 선택 시 활성화)' : 'Binary Operators (Select 2 cards)'}
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {(['+', '-', '*', '/'] as const).map((op) => (
                        <button
                          key={op}
                          disabled={sandboxSelected.length !== 2}
                          onClick={() => handleSandboxBinary(op)}
                          className={`h-11 rounded-xl font-mono-num font-black text-xl transition-all ${
                            sandboxSelected.length === 2
                              ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-md shadow-teal-600/30'
                              : isDark
                              ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-850'
                              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                          }`}
                        >
                          {op === '*' ? '×' : op === '/' ? '÷' : op}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Unary */}
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 block mb-1">
                      {language === 'ko' ? '단항 연산자 (카드 1장 선택 시 활성화)' : 'Unary Operators (Select 1 card)'}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        disabled={sandboxSelected.length !== 1}
                        onClick={() => handleSandboxUnary('double')}
                        className={`h-11 rounded-xl font-mono-num font-black text-base transition-all ${
                          sandboxSelected.length === 1
                            ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-md shadow-fuchsia-600/30'
                            : isDark
                            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-850'
                            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                        }`}
                      >
                        ×2 ({language === 'ko' ? '두배' : 'Double'})
                      </button>
                      <button
                        disabled={sandboxSelected.length !== 1}
                        onClick={() => handleSandboxUnary('square')}
                        className={`h-11 rounded-xl font-mono-num font-black text-base transition-all ${
                          sandboxSelected.length === 1
                            ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-md shadow-fuchsia-600/30'
                            : isDark
                            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-850'
                            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                        }`}
                      >
                        x² ({language === 'ko' ? '제곱' : 'Square'})
                      </button>
                      <button
                        disabled={sandboxSelected.length !== 1}
                        onClick={() => handleSandboxUnary('sqrt')}
                        className={`h-11 rounded-xl font-mono-num font-black text-base transition-all ${
                          sandboxSelected.length === 1
                            ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-md shadow-fuchsia-600/30'
                            : isDark
                            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-850'
                            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                        }`}
                      >
                        √x ({language === 'ko' ? '제곱근' : 'Sqrt'})
                      </button>
                    </div>
                  </div>
                </div>

                {sandboxSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-center font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {language === 'ko'
                        ? '완벽합니다! 목표 22를 완성하여 기본 조작을 모두 익혔습니다! 🎉'
                        : 'Perfect! You reached target 22 and learned the basics! 🎉'}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Gameplay & Sound Preferences */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Default Difficulty */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <Gamepad2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>{language === 'ko' ? '기본 시작 난이도' : 'Default Starting Difficulty'}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['easy', 'normal', 'hard', 'expert'] as Difficulty[]).map((d) => {
                      const labels = {
                        easy: language === 'ko' ? '이지 (4장)' : 'Easy (4)',
                        normal: language === 'ko' ? '노멀 (5장)' : 'Normal (5)',
                        hard: language === 'ko' ? '하드 (6장)' : 'Hard (6)',
                        expert: language === 'ko' ? '익스퍼트 (7장)' : 'Expert (7)',
                      };
                      const isSel = difficulty === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            sound.playCardSelect();
                            setDifficulty(d);
                          }}
                          className={`py-3 px-2 rounded-2xl border text-center font-bold text-xs transition-all ${
                            isSel
                              ? isDark
                                ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                                : 'bg-teal-600 text-white border-teal-600 shadow-md'
                              : isDark
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                          }`}
                        >
                          {labels[d]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sound Flavors */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{language === 'ko' ? '오디오 사운드 팩' : 'Audio Sound Pack'}</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {language === 'ko' ? '클릭하여 미리듣기' : 'Click to preview'}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'modern' as const,
                        title: language === 'ko' ? '모던 신스' : 'Modern Synth',
                        desc: language === 'ko' ? '세련된 감각의 하모닉 벨' : 'Harmonic crystal bells',
                      },
                      {
                        id: 'retro' as const,
                        title: language === 'ko' ? '8-Bit 레트로' : '8-Bit Retro',
                        desc: language === 'ko' ? '아케이드 레트로 감성' : 'Chiptune arcade feel',
                      },
                      {
                        id: 'minimal' as const,
                        title: language === 'ko' ? '소프트 미니멀' : 'Soft Minimal',
                        desc: language === 'ko' ? '귀가 편안한 틱 사운드' : 'Gentle wooden clicks',
                      },
                    ].map((sf) => {
                      const isSel = soundFlavor === sf.id;
                      return (
                        <button
                          key={sf.id}
                          type="button"
                          onClick={() => {
                            setSoundFlavor(sf.id);
                            sound.setSoundFlavor(sf.id);
                            sound.playMerge();
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSel
                              ? isDark
                                ? 'bg-zinc-900 border-teal-500 ring-2 ring-teal-500/30'
                                : 'bg-teal-50 border-teal-400 ring-2 ring-teal-300'
                              : isDark
                              ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                          }`}
                        >
                          <div className="font-bold text-xs mb-1 flex items-center justify-between">
                            <span>{sf.title}</span>
                            {isSel && <Check className="w-3.5 h-3.5 text-teal-400" />}
                          </div>
                          <p className="text-[10px] text-zinc-500">{sf.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FX Toggles */}
                <div className="space-y-2 pt-1">
                  <div
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">
                        {language === 'ko' ? '승리 시 축하 컨페티 파티클' : 'Victory Celebration Confetti'}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {language === 'ko' ? '정답 도달 시 화려한 색종이 축하 연출을 표시합니다.' : 'Shows colorful particles on solving puzzles.'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableConfetti}
                      onChange={(e) => setEnableConfetti(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                  </div>

                  <div
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">
                        {language === 'ko' ? '부드러운 마이크로 인터랙션 & 햅틱 모션' : 'Smooth Micro-interactions & Haptic Motion'}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {language === 'ko' ? '카드 호버, 스프링 스케일링, 고스트 프리뷰를 활성화합니다.' : 'Enables card hover springs and ghost previews.'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableMicroHaptics}
                      onChange={(e) => setEnableMicroHaptics(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Holographic VIP Pass & Summary */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="space-y-5 text-center"
              >
                {/* Holographic Player Pass */}
                <div
                  className={`relative overflow-hidden rounded-3xl p-6 border shadow-2xl transition-all ${
                    isDark
                      ? 'bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border-zinc-700/80 shadow-teal-500/20'
                      : 'bg-gradient-to-br from-white via-teal-50/50 to-fuchsia-50/40 border-teal-200 shadow-xl'
                  }`}
                >
                  {/* Aura Glow Halo */}
                  <div
                    className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 ${currentAura.bgClass}`}
                  />

                  {/* Header Badge */}
                  <div className="flex items-center justify-between border-b border-zinc-700/40 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Award className={`w-5 h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                      <span className="font-mono-num font-black text-xs tracking-wider uppercase text-zinc-400">
                        OFFICIAL TARGET PASS
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-full ${currentAura.bgClass} text-white`}>
                      {currentArchetype.tag} VERIFIED
                    </span>
                  </div>

                  {/* Avatar & Title */}
                  <div className="flex items-center gap-4 text-left mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ring-2 ${currentAura.borderClass} ${
                        isDark ? 'bg-zinc-800' : 'bg-white'
                      }`}
                    >
                      {currentArchetype.emoji}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-xl tracking-tight">
                        {nickname.trim() || (language === 'ko' ? '넘버마스터' : 'NumberMaster')}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold ${isDark ? 'text-teal-300' : 'text-teal-600'}`}>
                          {currentArchetype.title}
                        </span>
                        <span className="text-zinc-500 text-xs">•</span>
                        <span className="text-[11px] text-zinc-400 font-mono-num">
                          {currentAura.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Config Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-700/40 text-left">
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block">
                        {language === 'ko' ? '플레이어 유형' : 'Archetype'}
                      </span>
                      <span className="text-xs font-bold capitalize">
                        {currentArchetype.emoji} {currentArchetype.title}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block">
                        {language === 'ko' ? '기본 난이도' : 'Difficulty'}
                      </span>
                      <span className="text-xs font-mono-num font-bold capitalize">{difficulty}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block">
                        {language === 'ko' ? '사운드 팩' : 'Sound Pack'}
                      </span>
                      <span className="text-xs font-mono-num font-bold capitalize">{soundFlavor}</span>
                    </div>
                  </div>
                </div>

                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {language === 'ko'
                    ? '모든 설정이 완료되었습니다! 언제든 상단 프로필을 눌러 설정을 변경할 수 있습니다.'
                    : 'All setup complete! You can adjust your profile preferences anytime from the top bar.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/40 flex items-center justify-between bg-inherit">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                sound.playCardSelect();
                setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
              }}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'ko' ? '이전' : 'Back'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sound.playCardDeselect();
                onClose();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {language === 'ko' ? '건너뛰기' : 'Skip'}
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                sound.playCardSelect();
                setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition-all ${
                currentAura.bgClass
              } hover:opacity-90 active:scale-95`}
            >
              <span>{language === 'ko' ? '다음 단계' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className={`px-6 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 shadow-lg shadow-teal-600/30 transition-all ${
                currentAura.bgClass
              } hover:scale-105 active:scale-95`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'ko' ? '게임 시작하기 (PLAY)' : 'Start Game (PLAY)'}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

