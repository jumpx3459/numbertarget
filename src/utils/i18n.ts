import { Language, Difficulty, GameMode } from '../types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  
  // Game Modes
  modes: {
    classic: { name: string; desc: string };
    blitz: { name: string; desc: string };
    daily: { name: string; desc: string };
    custom: { name: string; desc: string };
  };

  // Difficulties
  difficulties: {
    easy: { name: string; desc: string; targetRange: string };
    normal: { name: string; desc: string; targetRange: string };
    hard: { name: string; desc: string; targetRange: string };
    expert: { name: string; desc: string; targetRange: string };
  };

  // Archetypes
  archetypes: {
    strategist: { title: string; desc: string };
    speedrunner: { title: string; desc: string };
    minimalist: { title: string; desc: string };
    alchemist: { title: string; desc: string };
  };

  // Sound Flavors
  soundFlavors: {
    modern: { name: string; desc: string };
    retro: { name: string; desc: string };
    minimal: { name: string; desc: string };
  };

  // Navbar & Header
  nav: {
    newGame: string;
    hint: string;
    solution: string;
    rules: string;
    stats: string;
    profile: string;
    custom: string;
    soundOn: string;
    soundOff: string;
    themeDark: string;
    themeLight: string;
    language: string;
    langToggle: string;
  };

  // Target Display & Board Stats
  board: {
    target: string;
    targetSubtitle: string;
    cardsLeft: string;
    moves: string;
    time: string;
    timeLeft: string;
    score: string;
    combo: string;
    dailyChallenge: string;
    dailyCompleted: string;
    customPuzzle: string;
    customSeed: string;
    perfectCombo: string;
  };

  // Card Deck & Interaction
  deck: {
    instructionsInitial: string;
    instructionsOneSelected: string;
    instructionsTwoSelected: string;
    dragDropHint: string;
    deselect: string;
    dragToCombine: string;
  };

  // Operators
  operators: {
    categoryBasic: string;
    categoryAdvanced: string;
    categorySpecial: string;
    add: { name: string; desc: string };
    sub: { name: string; desc: string };
    mul: { name: string; desc: string };
    div: { name: string; desc: string };
    pow: { name: string; desc: string };
    mod: { name: string; desc: string };
    avg: { name: string; desc: string };
    concat: { name: string; desc: string };
    sq: { name: string; desc: string };
    sqrt: { name: string; desc: string };
    fact: { name: string; desc: string };
    neg: { name: string; desc: string };
    needTwoCards: string;
    needOneCard: string;
  };

  // History & Timeline
  history: {
    title: string;
    undo: string;
    reset: string;
    copy: string;
    copied: string;
    empty: string;
    stepNumber: string;
  };

  // Victory Modal
  victory: {
    title: string;
    subtitle: string;
    timeTaken: string;
    totalMoves: string;
    optimalMoves: string;
    finalScore: string;
    maxCombo: string;
    playNext: string;
    shareResult: string;
    viewSolutions: string;
    shareCopied: string;
    newRecord: string;
    streakCount: string;
  };

  // Solution Modal
  solutionModal: {
    title: string;
    subtitle: string;
    tabInitial: string;
    tabCurrent: string;
    filterAll: string;
    filterShortest: string;
    filterBasic: string;
    filterAddSub: string;
    filterMulDiv: string;
    filterPowers: string;
    filterSpecial: string;
    stepCount: string;
    applySolution: string;
    appliedSuccess: string;
    close: string;
    noSolutionCurrentTitle: string;
    noSolutionCurrentDesc: string;
    noSolutionFilterTitle: string;
    noSolutionFilterDesc: string;
    undoAction: string;
    resetAction: string;
    newGameAction: string;
    shortcuts: string;
  };

  // Hint Modal
  hintModal: {
    title: string;
    subtitle: string;
    level1Title: string;
    level1Desc: string;
    level2Title: string;
    level2Desc: string;
    level3Title: string;
    level3Desc: string;
    revealNext: string;
    allRevealed: string;
    intermediateGoal: string;
  };

  // Rules Modal
  rulesModal: {
    title: string;
    subtitle: string;
    overviewTitle: string;
    overviewText: string;
    coreRulesTitle: string;
    coreRules: string[];
    operatorsTitle: string;
    shortcutsTitle: string;
    shortcutsList: { key: string; label: string }[];
    close: string;
  };

  // Stats Modal
  statsModal: {
    title: string;
    subtitle: string;
    totalGames: string;
    winRate: string;
    currentStreak: string;
    maxStreak: string;
    bestBlitz: string;
    fastestSolve: string;
    dailySolves: string;
    archetypeTitle: string;
    difficultyBestMoves: string;
    close: string;
  };

  // Custom Game Modal
  customModal: {
    title: string;
    subtitle: string;
    targetLabel: string;
    targetPlaceholder: string;
    cardsLabel: string;
    cardsPlaceholder: string;
    cardsHelp: string;
    presetsLabel: string;
    createButton: string;
    shareLinkButton: string;
    linkCopied: string;
    validationError: string;
    close: string;
  };

  // Onboarding Modal
  onboarding: {
    title: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    step4Title: string;
    nicknameLabel: string;
    nicknamePlaceholder: string;
    archetypeLabel: string;
    auraLabel: string;
    difficultyLabel: string;
    soundFlavorLabel: string;
    languageLabel: string;
    confettiLabel: string;
    hapticsLabel: string;
    next: string;
    prev: string;
    startPlaying: string;
    tutorialPrompt: string;
    tutorialSuccess: string;
    passTitle: string;
    passSubtitle: string;
  };
}

export const DICTIONARY: Record<Language, Translations> = {
  ko: {
    appName: '타겟너머',
    appSubtitle: '수학적 직관과 연산의 미학',

    modes: {
      classic: { name: '클래식', desc: '무제한 시간 동안 최적의 수식 조합으로 목표 달성' },
      blitz: { name: '블리츠', desc: '60초 타임어택! 연속 콤보로 최고 점수 달성' },
      daily: { name: '오늘의 퍼즐', desc: '전 세계 플레이어와 같은 시드로 매일 1회 도전' },
      custom: { name: '커스텀', desc: '원하는 목표 숫자와 카드를 직접 설계하여 공유' },
    },

    difficulties: {
      easy: { name: '이지', desc: '카드 4장 · 10~100 범위의 직관적인 목표', targetRange: '10~100' },
      normal: { name: '노멀', desc: '카드 5장 · 20~300 범위의 표준 연산 퍼즐', targetRange: '20~300' },
      hard: { name: '하드', desc: '카드 6장 · 50~800 범위의 다단계 수식 설계', targetRange: '50~800' },
      expert: { name: '익스퍼트', desc: '카드 7장 · 80~1500 이상의 극한 두뇌 챌린지', targetRange: '80~1500' },
    },

    archetypes: {
      strategist: { title: '수학적 전략가', desc: '최소 단계와 논리적 연산 구조를 지향하는 플레이어' },
      speedrunner: { title: '스피드러너', desc: '빠른 암산과 직관적인 반응 속도로 퍼즐을 정복' },
      minimalist: { title: '미니멀리스트', desc: '단순 사칙연산의 순수한 아름다움을 추구하는 감각' },
      alchemist: { title: '수식 연금술사', desc: '거듭제곱과 특수 연산자를 자유자재로 다루는 마스터' },
    },

    soundFlavors: {
      modern: { name: '모던 신스', desc: '세련되고 청명한 FM 신시사이저 음향' },
      retro: { name: '8-비트 레트로', desc: '고전 오락실 칩튠 아케이드 사운드' },
      minimal: { name: '미니멀 틱', desc: '조용하고 절제된 어쿠스틱 오디오 클릭' },
    },

    nav: {
      newGame: '새 게임',
      hint: '힌트',
      solution: '정답 탐색',
      rules: '규칙',
      stats: '통계',
      profile: '프로필',
      custom: '커스텀',
      soundOn: '소리 켜짐',
      soundOff: '음소거',
      themeDark: '다크 모드',
      themeLight: '라이트 모드',
      language: '언어 설정',
      langToggle: 'EN',
    },

    board: {
      target: '목표 숫자',
      targetSubtitle: 'TARGET NUMBER',
      cardsLeft: '남은 카드',
      moves: '연산 횟수',
      time: '경과 시간',
      timeLeft: '남은 시간',
      score: '현재 점수',
      combo: '연속 콤보',
      dailyChallenge: '오늘의 일일 도전',
      dailyCompleted: '오늘 완료됨!',
      customPuzzle: '커스텀 설계 퍼즐',
      customSeed: '시드 코드',
      perfectCombo: 'COMBO x',
    },

    deck: {
      instructionsInitial: '연산할 카드 2장을 선택하거나 드래그하여 결합하세요.',
      instructionsOneSelected: '두 번째 카드를 선택하거나 단항(단일) 연산자를 적용하세요.',
      instructionsTwoSelected: '하단 연산자 중 하나를 선택하여 결합하세요.',
      dragDropHint: '카드를 다른 카드 위로 드롭하면 즉시 연산됩니다',
      deselect: '선택 해제',
      dragToCombine: '드래그하여 합치기',
    },

    operators: {
      categoryBasic: '기본 사칙연산',
      categoryAdvanced: '고급 / 거듭제곱',
      categorySpecial: '단항 / 특수연산',
      add: { name: '덧셈', desc: '두 수의 합 (A + B)' },
      sub: { name: '뺄셈', desc: '두 수의 절대값 차 (|A − B|)' },
      mul: { name: '곱셈', desc: '두 수의 곱 (A × B)' },
      div: { name: '나눗셈', desc: '나누어 떨어지는 몫 (A ÷ B)' },
      pow: { name: '거듭제곱', desc: 'A의 B제곱 (A^B)' },
      mod: { name: '나머지', desc: 'A를 B로 나눈 나머지 (A % B)' },
      avg: { name: '산술 평균', desc: '두 수의 평균값 ((A + B) / 2)' },
      concat: { name: '숫자 결합', desc: '자릿수 이어붙이기 (예: 12와 34 → 1234)' },
      sq: { name: '제곱', desc: '수를 자기 자신과 곱함 (A²)' },
      sqrt: { name: '제곱근', desc: '완전제곱수의 제곱근 (√A)' },
      fact: { name: '팩토리얼', desc: '계승 연산 (A! = A × (A-1)...)' },
      neg: { name: '부호 반전', desc: '양수/음수 부호 변환 (-A)' },
      needTwoCards: '연산할 카드 2장을 먼저 선택하세요',
      needOneCard: '카드를 1장 선택하세요',
    },

    history: {
      title: '연산 히스토리',
      undo: '직전 취소',
      reset: '처음으로 리셋',
      copy: '기록 복사',
      copied: '복사 완료!',
      empty: '아직 진행된 연산이 없습니다. 카드를 선택해 연산을 시작하세요.',
      stepNumber: '단계',
    },

    victory: {
      title: '목표 숫자 정복 성공!',
      subtitle: '완벽한 연산 조합으로 목표 숫자를 정확히 완성했습니다.',
      timeTaken: '소요 시간',
      totalMoves: '연산 횟수',
      optimalMoves: '최적 해법 단계',
      finalScore: '획득 점수',
      maxCombo: '최대 연속 콤보',
      playNext: '다음 퍼즐 도전',
      shareResult: '결과 공유하기',
      viewSolutions: '다각도 해답 보기',
      shareCopied: '결과가 클립보드에 복사되었습니다!',
      newRecord: '새로운 최고 기록 달성!',
      streakCount: '연속 성공 일수',
    },

    solutionModal: {
      title: '연산자별 다각도 정답 탐색',
      subtitle: '사칙연산, 덧셈/뺄셈, 거듭제곱 등 다양한 공식 해법을 확인하세요',
      tabInitial: '처음 카드 기준 해법',
      tabCurrent: '현재 남은 카드 기준',
      filterAll: '전체 공식',
      filterShortest: '⚡ 최단 해법',
      filterBasic: '➕ 사칙연산만',
      filterAddSub: '± 덧셈/뺄셈',
      filterMulDiv: '✖ 곱셈/나눗셈',
      filterPowers: '⚡ 거듭제곱/고급',
      filterSpecial: '✨ 단항/특수',
      stepCount: '단계',
      applySolution: '이 해답으로 자동 완성',
      appliedSuccess: '해답이 보드에 적용되었습니다!',
      close: '닫기',
      noSolutionCurrentTitle: '현재 남은 카드로는 목표 숫자에 도달할 수 없습니다',
      noSolutionCurrentDesc: '진행 중인 연산으로 인해 막다른 길(Dead-end)에 도달했습니다. 아래 해결 방법 중 하나를 선택하세요.',
      noSolutionFilterTitle: '선택한 연산자 필터에 해당하는 정답이 없습니다',
      noSolutionFilterDesc: '상단의 [전체 공식] 탭을 누르거나 보드를 처음 상태로 리셋해보세요.',
      undoAction: '↩️ 직전 연산 되돌리기',
      resetAction: '🔄 처음 카드로 리셋',
      newGameAction: '🎲 새로운 문제 받기',
      shortcuts: '단축키: A 로 정답창 열기',
    },

    hintModal: {
      title: '단계별 스마트 힌트',
      subtitle: '막혔을 때 단계별로 조금씩 아이디어를 얻어보세요',
      level1Title: '1단계: 첫 번째 연산 힌트',
      level1Desc: '어떤 두 카드를 먼저 결합해야 하는지 방향을 제시합니다.',
      level2Title: '2단계: 핵심 중간 목표 숫자',
      level2Desc: '중간 단계에서 만들어야 하는 디딤돌 숫자를 알려줍니다.',
      level3Title: '3단계: 전체 연산 시퀀스',
      level3Desc: '목표 숫자까지 도달하는 완전한 풀이 공식을 확인합니다.',
      revealNext: '다음 단계 힌트 열기',
      allRevealed: '모든 힌트가 공개되었습니다',
      intermediateGoal: '중간 도달 목표 숫자',
    },

    rulesModal: {
      title: '게임 규칙 & 조작 가이드',
      subtitle: '숫자와 기호가 만나는 지적 유희',
      overviewTitle: '게임 목표',
      overviewText: '주어진 숫자 카드들을 사칙연산 및 수학 연산자로 결합하여 정확히 목표 숫자(TARGET)를 만드는 두뇌 퍼즐입니다.',
      coreRulesTitle: '핵심 규칙',
      coreRules: [
        '카드 2장을 선택하고 이항 연산자(+, −, ×, ÷ 등)를 누르면 두 카드가 결과값 1장으로 합쳐집니다.',
        '카드를 마우스/터치로 드래그하여 다른 카드 위에 드롭하면 즉시 팝업 또는 기본 연산으로 합칠 수 있습니다.',
        '단항 연산자(A², √A, A! 등)는 카드 1장만 선택한 상태에서 즉시 변환됩니다.',
        '최종적으로 목표 숫자 1장만 남거나, 목표 숫자가 완성되는 순간 승리합니다.',
        '실수했을 때는 언제든지 [되돌리기(Undo)]나 [리셋(Reset)]을 누를 수 있습니다.',
      ],
      operatorsTitle: '지원 연산자 안내',
      shortcutsTitle: '키보드 단축키',
      shortcutsList: [
        { key: '1 ~ 9', label: '카드 빠른 선택 / 해제' },
        { key: '+ - * / ^', label: '해당 연산자 즉시 실행' },
        { key: 'Ctrl + Z / U', label: '직전 연산 되돌리기' },
        { key: 'R', label: '보드 초기화 (리셋)' },
        { key: 'H / A', label: '힌트 / 정답창 열기' },
        { key: 'N', label: '새로운 게임 시작' },
      ],
      close: '확인 및 닫기',
    },

    statsModal: {
      title: '플레이어 전적 & 통계',
      subtitle: '나의 퍼즐 해결 기록과 업적',
      totalGames: '총 플레이 수',
      winRate: '승률',
      currentStreak: '현재 연속 성공',
      maxStreak: '최고 연속 성공',
      bestBlitz: '블리츠 최고 점수',
      fastestSolve: '최단 해결 시간',
      dailySolves: '일일 퍼즐 완료 수',
      archetypeTitle: '나의 플레이어 유형',
      difficultyBestMoves: '난이도별 최소 연산 기록',
      close: '닫기',
    },

    customModal: {
      title: '커스텀 퍼즐 제작기',
      subtitle: '나만의 수학 퍼즐을 만들어 친구에게 공유하세요',
      targetLabel: '목표 숫자 (TARGET)',
      targetPlaceholder: '예: 100',
      cardsLabel: '시작 숫자 카드 (3~7개 입력)',
      cardsPlaceholder: '쉼표 또는 띄어쓰기로 구분 (예: 3, 5, 10, 25)',
      cardsHelp: '숫자를 3개 이상 입력해주세요. (1~9999 사이 정수)',
      presetsLabel: '추천 프리셋 문제',
      createButton: '이 퍼즐 플레이하기',
      shareLinkButton: '퍼즐 공유 링크 복사',
      linkCopied: '공유 링크가 클립보드에 복사되었습니다!',
      validationError: '올바른 숫자와 3개 이상의 카드를 입력해주세요.',
      close: '취소',
    },

    onboarding: {
      title: '타겟너머에 오신 것을 환영합니다',
      step1Title: '플레이어 프로필 설정',
      step2Title: '30초 인터랙티브 튜토리얼',
      step3Title: '게임 환경 & 사운드 설정',
      step4Title: '플레이어 패스 발급 완료',
      nicknameLabel: '닉네임',
      nicknamePlaceholder: '플레이어 이름 입력',
      archetypeLabel: '플레이어 성향 유형',
      auraLabel: '테마 오라 컬러',
      difficultyLabel: '기본 시작 난이도',
      soundFlavorLabel: '사운드 테마',
      languageLabel: '언어 (Language)',
      confettiLabel: '승리 시 축하 폭죽 효과',
      hapticsLabel: '마이크로 햅틱 피드백',
      next: '다음 단계',
      prev: '이전',
      startPlaying: '퍼즐 게임 시작하기',
      tutorialPrompt: '아래 카드 2장을 선택하고 [+] 연산자를 눌러 목표 숫자를 만들어보세요!',
      tutorialSuccess: '완벽합니다! 이제 실제 퍼즐을 즐길 준비가 되었습니다.',
      passTitle: '공식 타겟너머 마스터 패스',
      passSubtitle: 'AUTHENTIC PLAYER PASS',
    },
  },

  en: {
    appName: 'TARGET BEYOND',
    appSubtitle: 'The Art of Mathematical Intuition & Precision',

    modes: {
      classic: { name: 'Classic', desc: 'Reach the target at your own pace with optimal step count' },
      blitz: { name: 'Blitz', desc: '60-second time attack! Build combos to hit the highest score' },
      daily: { name: 'Daily', desc: 'Compete on the global seed with 1 attempt every 24 hours' },
      custom: { name: 'Custom', desc: 'Craft your own target and cards, then challenge friends' },
    },

    difficulties: {
      easy: { name: 'Easy', desc: '4 Cards · Intuitive target between 10 ~ 100', targetRange: '10~100' },
      normal: { name: 'Normal', desc: '5 Cards · Standard arithmetic range 20 ~ 300', targetRange: '20~300' },
      hard: { name: 'Hard', desc: '6 Cards · Multi-step deep synthesis 50 ~ 800', targetRange: '50~800' },
      expert: { name: 'Expert', desc: '7 Cards · Ultimate brain challenge 80 ~ 1500+', targetRange: '80~1500' },
    },

    archetypes: {
      strategist: { title: 'Mathematical Strategist', desc: 'Focuses on minimum steps and structured algebraic logic' },
      speedrunner: { title: 'Speedrunner', desc: 'Crushes targets with lightning-fast mental math and intuition' },
      minimalist: { title: 'Minimalist', desc: 'Pursues pure, elegant four-function arithmetic solutions' },
      alchemist: { title: 'Formula Alchemist', desc: 'Masters powers, modular operations, and special operators' },
    },

    soundFlavors: {
      modern: { name: 'Modern Synth', desc: 'Crisp, crystal-clear dynamic FM synthesizer tones' },
      retro: { name: '8-Bit Retro', desc: 'Nostalgic arcade chiptune bleeps and bloops' },
      minimal: { name: 'Minimal Tick', desc: 'Subtle, gentle acoustic clicks for quiet focus' },
    },

    nav: {
      newGame: 'New Game',
      hint: 'Hint',
      solution: 'Solutions',
      rules: 'Rules',
      stats: 'Stats',
      profile: 'Profile',
      custom: 'Custom',
      soundOn: 'Sound On',
      soundOff: 'Muted',
      themeDark: 'Dark Mode',
      themeLight: 'Light Mode',
      language: 'Language',
      langToggle: '한글',
    },

    board: {
      target: 'TARGET',
      targetSubtitle: 'TARGET NUMBER',
      cardsLeft: 'Cards Left',
      moves: 'Moves',
      time: 'Time',
      timeLeft: 'Time Left',
      score: 'Score',
      combo: 'Combo',
      dailyChallenge: 'Daily Puzzle Challenge',
      dailyCompleted: 'Solved Today!',
      customPuzzle: 'Custom Puzzle',
      customSeed: 'Seed Code',
      perfectCombo: 'COMBO x',
    },

    deck: {
      instructionsInitial: 'Select 2 cards or drag one onto another to compute.',
      instructionsOneSelected: 'Choose a second card or select a unary operator.',
      instructionsTwoSelected: 'Select an operator below to combine the two cards.',
      dragDropHint: 'Drag and drop a card onto another to calculate instantly',
      deselect: 'Deselect',
      dragToCombine: 'Drag to combine',
    },

    operators: {
      categoryBasic: 'Basic Arithmetic',
      categoryAdvanced: 'Advanced & Powers',
      categorySpecial: 'Unary & Special',
      add: { name: 'Addition', desc: 'Sum of two numbers (A + B)' },
      sub: { name: 'Subtraction', desc: 'Absolute difference (|A − B|)' },
      mul: { name: 'Multiplication', desc: 'Product of two numbers (A × B)' },
      div: { name: 'Division', desc: 'Integer quotient (A ÷ B)' },
      pow: { name: 'Power', desc: 'A raised to power B (A^B)' },
      mod: { name: 'Modulo', desc: 'Remainder of A divided by B (A % B)' },
      avg: { name: 'Average', desc: 'Arithmetic mean ((A + B) / 2)' },
      concat: { name: 'Concatenate', desc: 'Join digits (e.g., 12 and 34 → 1234)' },
      sq: { name: 'Square', desc: 'Multiply number by itself (A²)' },
      sqrt: { name: 'Square Root', desc: 'Principal square root (√A)' },
      fact: { name: 'Factorial', desc: 'Factorial product (A!)' },
      neg: { name: 'Negate', desc: 'Invert positive/negative sign (-A)' },
      needTwoCards: 'Select 2 cards first to use this operator',
      needOneCard: 'Select 1 card to apply this operator',
    },

    history: {
      title: 'Move History',
      undo: 'Undo',
      reset: 'Reset Board',
      copy: 'Copy Steps',
      copied: 'Copied!',
      empty: 'No moves yet. Pick cards and start computing!',
      stepNumber: 'Step',
    },

    victory: {
      title: 'Target Conquered!',
      subtitle: 'You synthesized the exact target number with brilliant math.',
      timeTaken: 'Time Taken',
      totalMoves: 'Total Moves',
      optimalMoves: 'Optimal Steps',
      finalScore: 'Final Score',
      maxCombo: 'Max Combo',
      playNext: 'Next Puzzle',
      shareResult: 'Share Result',
      viewSolutions: 'Explore Solutions',
      shareCopied: 'Results copied to clipboard!',
      newRecord: 'New Personal Record!',
      streakCount: 'Day Streak',
    },

    solutionModal: {
      title: 'Multi-Path Solution Explorer',
      subtitle: 'Discover multiple verified formulas filtered by operator categories',
      tabInitial: 'From Initial Cards',
      tabCurrent: 'From Remaining Cards',
      filterAll: 'All Formulas',
      filterShortest: '⚡ Shortest',
      filterBasic: '➕ Basic (+, −, ×, ÷)',
      filterAddSub: '± Add / Sub',
      filterMulDiv: '✖ Mul / Div',
      filterPowers: '⚡ Powers & Adv',
      filterSpecial: '✨ Unary / Special',
      stepCount: 'Steps',
      applySolution: 'Auto-Apply This Solution',
      appliedSuccess: 'Solution applied to board!',
      close: 'Close',
      noSolutionCurrentTitle: 'Cannot reach target with remaining cards',
      noSolutionCurrentDesc: 'You have reached a dead-end state. Choose one of the quick resolution options below to get back on track.',
      noSolutionFilterTitle: 'No solutions match the active operator filter',
      noSolutionFilterDesc: 'Switch to the [All Formulas] tab or reset the board to the initial cards.',
      undoAction: '↩️ Undo Last Step',
      resetAction: '🔄 Reset to Initial Cards',
      newGameAction: '🎲 New Puzzle',
      shortcuts: 'Shortcut: Press A to open solutions',
    },

    hintModal: {
      title: 'Step-by-Step Smart Hints',
      subtitle: 'Get progressive hints without giving away the full solution',
      level1Title: 'Level 1: First Move Direction',
      level1Desc: 'Reveals the best two initial cards to pair together.',
      level2Title: 'Level 2: Stepping Stone Number',
      level2Desc: 'Reveals a key intermediate number you should synthesize.',
      level3Title: 'Level 3: Full Solution Steps',
      level3Desc: 'Reveals the complete sequential solution to the target.',
      revealNext: 'Reveal Next Hint',
      allRevealed: 'All hints unlocked',
      intermediateGoal: 'Intermediate Stepping Stone',
    },

    rulesModal: {
      title: 'Game Rules & Control Guide',
      subtitle: 'Where Numbers and Pure Logic Meet',
      overviewTitle: 'Objective',
      overviewText: 'Combine the provided number cards using arithmetic and math operators to synthesize the exact TARGET number.',
      coreRulesTitle: 'Core Rules',
      coreRules: [
        'Select 2 cards and click a binary operator (+, −, ×, ÷, etc.) to merge them into a single result card.',
        'Drag and drop any card onto another card to merge them immediately.',
        'Unary operators (A², √A, A!) apply directly when only 1 card is selected.',
        'You win the moment a card matches the TARGET or when the final remaining card equals the TARGET.',
        'If you make a mistake, use [Undo] or [Reset] anytime without penalty.',
      ],
      operatorsTitle: 'Supported Math Operators',
      shortcutsTitle: 'Keyboard Shortcuts',
      shortcutsList: [
        { key: '1 ~ 9', label: 'Fast select / deselect cards' },
        { key: '+ - * / ^', label: 'Execute corresponding operator' },
        { key: 'Ctrl + Z / U', label: 'Undo last step' },
        { key: 'R', label: 'Reset board to initial cards' },
        { key: 'H / A', label: 'Open Hint / Solutions modal' },
        { key: 'N', label: 'Start a new puzzle' },
      ],
      close: 'Got It & Close',
    },

    statsModal: {
      title: 'Player Records & Statistics',
      subtitle: 'Track your mathematical journey and milestones',
      totalGames: 'Total Games Played',
      winRate: 'Win Rate',
      currentStreak: 'Current Streak',
      maxStreak: 'Best Streak',
      bestBlitz: 'Blitz High Score',
      fastestSolve: 'Fastest Solve',
      dailySolves: 'Daily Solves',
      archetypeTitle: 'Player Archetype',
      difficultyBestMoves: 'Minimum Moves per Difficulty',
      close: 'Close',
    },

    customModal: {
      title: 'Custom Puzzle Maker',
      subtitle: 'Design your own math puzzle and share it with friends',
      targetLabel: 'TARGET Number',
      targetPlaceholder: 'e.g. 100',
      cardsLabel: 'Starting Number Cards (3 ~ 7 cards)',
      cardsPlaceholder: 'Separated by comma or space (e.g. 3, 5, 10, 25)',
      cardsHelp: 'Enter at least 3 positive integers (1 ~ 9999).',
      presetsLabel: 'Curated Challenge Presets',
      createButton: 'Play This Puzzle',
      shareLinkButton: 'Copy Shareable Link',
      linkCopied: 'Shareable puzzle link copied to clipboard!',
      validationError: 'Please enter a valid target and at least 3 cards.',
      close: 'Cancel',
    },

    onboarding: {
      title: 'Welcome to Target Beyond',
      step1Title: 'Player Profile Setup',
      step2Title: '30-Second Interactive Tutorial',
      step3Title: 'Game & Sound Settings',
      step4Title: 'Player Pass Issued',
      nicknameLabel: 'Nickname',
      nicknamePlaceholder: 'Enter your player nickname',
      archetypeLabel: 'Playstyle Archetype',
      auraLabel: 'Theme Aura Color',
      difficultyLabel: 'Default Starting Difficulty',
      soundFlavorLabel: 'Sound Flavor Theme',
      languageLabel: 'Language (언어)',
      confettiLabel: 'Celebratory Victory Confetti',
      hapticsLabel: 'Micro-Haptic Feedback',
      next: 'Next Step',
      prev: 'Previous',
      startPlaying: 'Start Playing Now',
      tutorialPrompt: 'Select 2 cards below and click the [+] operator to synthesize the target!',
      tutorialSuccess: 'Brilliant! You are ready to conquer the math universe.',
      passTitle: 'Official Target Beyond Pass',
      passSubtitle: 'AUTHENTIC PLAYER PASS',
    },
  },
};

export function getTranslation(lang?: Language | string): Translations {
  if (lang === 'en') return DICTIONARY.en;
  return DICTIONARY.ko;
}
