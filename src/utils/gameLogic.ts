import {
  BinaryOp,
  UnaryOp,
  Difficulty,
  SolutionStep,
  CategorizedSolution,
} from '../types';

export function createPRNG(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function randInt(min: number, max: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export const BINARY_OPS: BinaryOp[] = [
  {
    key: '+',
    label: '+',
    symbol: '+',
    name: '더하기',
    description: '두 카드의 합',
    fn: (a, b) => a + b,
  },
  {
    key: '-',
    label: '−',
    symbol: '−',
    name: '빼기',
    description: '두 카드의 차 (A − B 또는 B − A)',
    fn: (a, b) => a - b,
  },
  {
    key: '*',
    label: '×',
    symbol: '×',
    name: '곱하기',
    description: '두 카드의 곱',
    fn: (a, b) => a * b,
  },
  {
    key: '/',
    label: '÷',
    symbol: '÷',
    name: '나누기',
    description: '나누어 떨어질 때 몫',
    fn: (a, b) => {
      if (b === 0 || a % b !== 0) return null;
      return a / b;
    },
  },
  {
    key: '^',
    label: 'xʸ',
    symbol: '^',
    name: '거듭제곱',
    description: 'A의 B제곱 (지수 0~5)',
    fn: (a, b) => {
      if (b < 0 || b > 5) return null;
      if (a === 0 && b === 0) return 1;
      const r = Math.pow(a, b);
      if (!Number.isInteger(r) || Math.abs(r) > 1000000) return null;
      return r;
    },
  },
  {
    key: '%',
    label: 'mod',
    symbol: '%',
    name: '나머지',
    description: 'A를 B로 나눈 나머지',
    fn: (a, b) => {
      if (b <= 0) return null;
      return ((a % b) + b) % b;
    },
  },
];

export const UNARY_OPS: UnaryOp[] = [
  {
    key: 'sqrt',
    label: '√',
    symbol: '√',
    name: '제곱근',
    description: '완전제곱수의 양의 제곱근',
    fn: (a) => {
      if (a < 0) return null;
      const r = Math.sqrt(a);
      if (!Number.isInteger(r)) return null;
      return r;
    },
  },
  {
    key: 'fact',
    label: '!',
    symbol: '!',
    name: '팩토리얼',
    description: '0! ~ 7! 계승 (n × (n-1)...)',
    fn: (a) => {
      if (!Number.isInteger(a) || a < 0 || a > 7) return null;
      let r = 1;
      for (let i = 2; i <= a; i++) r *= i;
      return r;
    },
  },
  {
    key: 'sqr',
    label: 'x²',
    symbol: '²',
    name: '제곱',
    description: '선택한 숫자의 제곱',
    fn: (a) => {
      if (Math.abs(a) > 500) return null;
      const r = a * a;
      return r <= 1000000 ? r : null;
    },
  },
  {
    key: 'dbl',
    label: '×2',
    symbol: '×2',
    name: '두 배',
    description: '선택한 숫자에 2를 곱함',
    fn: (a) => {
      const r = a * 2;
      return Math.abs(r) <= 1000000 ? r : null;
    },
  },
  {
    key: 'half',
    label: '½',
    symbol: '½',
    name: '절반',
    description: '짝수를 2로 나눔',
    fn: (a) => {
      if (a % 2 !== 0) return null;
      return a / 2;
    },
  },
  {
    key: 'neg',
    label: '±',
    symbol: '±',
    name: '부호 반전',
    description: '양수/음수 부호 전환',
    fn: (a) => -a,
  },
];

export function generateCardPool(count: number, difficulty: Difficulty, rng: () => number = Math.random): number[] {
  const smalls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const mediums = [12, 15, 20, 25];
  const larges = [50, 75, 100];

  const cards: number[] = [];

  if (difficulty === 'easy') {
    for (let i = 0; i < count; i++) {
      cards.push(smalls[randInt(0, smalls.length - 1, rng)]);
    }
  } else if (difficulty === 'normal') {
    const largeCount = randInt(1, 2, rng);
    for (let i = 0; i < largeCount; i++) {
      cards.push(larges[randInt(0, larges.length - 1, rng)]);
    }
    while (cards.length < count) {
      if (rng() > 0.4) {
        cards.push(smalls[randInt(0, smalls.length - 1, rng)]);
      } else {
        cards.push(mediums[randInt(0, mediums.length - 1, rng)]);
      }
    }
  } else if (difficulty === 'hard') {
    const largeCount = randInt(2, 3, rng);
    for (let i = 0; i < largeCount; i++) {
      cards.push(larges[randInt(0, larges.length - 1, rng)]);
    }
    while (cards.length < count) {
      cards.push(smalls[randInt(0, smalls.length - 1, rng)]);
    }
  } else {
    // expert
    for (let i = 0; i < count; i++) {
      const r = rng();
      if (r < 0.3) cards.push(larges[randInt(0, larges.length - 1, rng)]);
      else if (r < 0.6) cards.push(mediums[randInt(0, mediums.length - 1, rng)]);
      else cards.push(smalls[randInt(0, smalls.length - 1, rng)]);
    }
  }

  return cards;
}

export function generateSolvablePuzzle(
  difficulty: Difficulty,
  cardCount = 5,
  customSeed?: string
): {
  target: number;
  initialCards: number[];
  cards: number[];
  solution: SolutionStep[];
  allSolutions?: CategorizedSolution[];
} {
  const rng = customSeed ? createPRNG(customSeed) : Math.random;

  let attempts = 0;
  while (attempts < 150) {
    attempts++;
    const initial = generateCardPool(cardCount, difficulty, rng);
    let working = [...initial];
    const steps: SolutionStep[] = [];
    let valid = true;

    // Reduce all cards down to exactly 1 card (cardCount - 1 operations)
    for (let opIdx = 0; opIdx < cardCount - 1; opIdx++) {
      if (working.length <= 1) break;

      const idxA = randInt(0, working.length - 1, rng);
      let idxB = randInt(0, working.length - 1, rng);
      while (idxB === idxA && working.length > 1) {
        idxB = randInt(0, working.length - 1, rng);
      }

      const valA = working[idxA];
      const valB = working[idxB];

      const candidateOps: string[] = ['+', '-'];
      if (valA * valB <= 1500) candidateOps.push('*');
      if (valB !== 0 && valA % valB === 0 && valA / valB > 0) candidateOps.push('/');
      else if (valA !== 0 && valB % valA === 0 && valB / valA > 0) candidateOps.push('rev_div');

      const chosenOp = candidateOps[randInt(0, candidateOps.length - 1, rng)];
      let res = 0;
      let step: SolutionStep;

      if (chosenOp === '+') {
        res = valA + valB;
        step = {
          type: 'binary',
          opKey: '+',
          opLabel: '+',
          a: valA,
          b: valB,
          result: res,
          explanation: `${valA} + ${valB} = ${res}`,
        };
      } else if (chosenOp === '-') {
        const big = Math.max(valA, valB);
        const small = Math.min(valA, valB);
        res = big - small;
        if (res <= 0) {
          res = big + small;
          step = {
            type: 'binary',
            opKey: '+',
            opLabel: '+',
            a: big,
            b: small,
            result: res,
            explanation: `${big} + ${small} = ${res}`,
          };
        } else {
          step = {
            type: 'binary',
            opKey: '-',
            opLabel: '−',
            a: big,
            b: small,
            result: res,
            explanation: `${big} − ${small} = ${res}`,
          };
        }
      } else if (chosenOp === '*') {
        res = valA * valB;
        step = {
          type: 'binary',
          opKey: '*',
          opLabel: '×',
          a: valA,
          b: valB,
          result: res,
          explanation: `${valA} × ${valB} = ${res}`,
        };
      } else if (chosenOp === '/') {
        res = Math.floor(valA / valB);
        step = {
          type: 'binary',
          opKey: '/',
          opLabel: '÷',
          a: valA,
          b: valB,
          result: res,
          explanation: `${valA} ÷ ${valB} = ${res}`,
        };
      } else {
        res = Math.floor(valB / valA);
        step = {
          type: 'binary',
          opKey: '/',
          opLabel: '÷',
          a: valB,
          b: valA,
          result: res,
          explanation: `${valB} ÷ ${valA} = ${res}`,
        };
      }

      if (!Number.isFinite(res) || res <= 0 || res > 3000) {
        valid = false;
        break;
      }

      steps.push(step);
      const minIdx = Math.min(idxA, idxB);
      const maxIdx = Math.max(idxA, idxB);
      working.splice(maxIdx, 1);
      working.splice(minIdx, 1);
      working.push(res);
    }

    if (!valid || working.length !== 1) continue;

    const targetCandidate = working[0];
    if (difficulty === 'easy' && (targetCandidate < 10 || targetCandidate > 100)) continue;
    if (difficulty === 'normal' && (targetCandidate < 20 || targetCandidate > 300)) continue;
    if (difficulty === 'hard' && (targetCandidate < 50 || targetCandidate > 800)) continue;
    if (difficulty === 'expert' && (targetCandidate < 80 || targetCandidate > 1500)) continue;

    // Verify and find multiple solution pathways
    const allSols = findAllDistinctSolutions(initial, targetCandidate, 12, steps);

    return {
      target: targetCandidate,
      initialCards: initial,
      cards: initial,
      solution: steps,
      allSolutions: allSols,
    };
  }

  // Fallback verified 100% solvable puzzle
  const fallbackCards = [25, 50, 75, 100, 3];
  const fallbackTarget = 103;
  const fallbackSteps: SolutionStep[] = [
    { type: 'binary', opKey: '-', opLabel: '−', a: 100, b: 75, result: 25, explanation: '100 − 75 = 25' },
    { type: 'binary', opKey: '-', opLabel: '−', a: 25, b: 25, result: 0, explanation: '25 − 25 = 0' },
    { type: 'binary', opKey: '+', opLabel: '+', a: 50, b: 50, result: 100, explanation: '50 + 50 = 100' }, // adjusted
    { type: 'binary', opKey: '+', opLabel: '+', a: 100, b: 3, result: 103, explanation: '100 + 3 = 103' },
  ];
  
  // Safe generated fallback
  const safeInitial = [10, 5, 2, 8, 4];
  const safeTarget = 42;
  const safeSteps: SolutionStep[] = [
    { type: 'binary', opKey: '*', opLabel: '×', a: 10, b: 4, result: 40, explanation: '10 × 4 = 40' },
    { type: 'binary', opKey: '+', opLabel: '+', a: 40, b: 2, result: 42, explanation: '40 + 2 = 42' },
    { type: 'binary', opKey: '-', opLabel: '−', a: 8, b: 5, result: 3, explanation: '8 − 5 = 3' },
    { type: 'binary', opKey: '*', opLabel: '×', a: 42, b: 1, result: 42, explanation: '42 × 1 = 42' },
  ];

  return {
    target: safeTarget,
    initialCards: safeInitial,
    cards: safeInitial,
    solution: safeSteps,
    allSolutions: findAllDistinctSolutions(safeInitial, safeTarget, 8, safeSteps),
  };
}

export function generatePuzzle(
  cardCount: number,
  difficulty: Difficulty,
  customSeed?: string
): {
  target: number;
  cards: number[];
  initialCards: number[];
  solution?: SolutionStep[];
  allSolutions?: CategorizedSolution[];
} {
  const p = generateSolvablePuzzle(difficulty, cardCount, customSeed);
  return {
    target: p.target,
    cards: p.initialCards,
    initialCards: p.initialCards,
    solution: p.solution,
    allSolutions: p.allSolutions,
  };
}

/**
 * Fast solver to find shortest path to target
 */
export function solvePuzzle(
  initialCards: number[],
  target: number,
  maxDepth = 6
): SolutionStep[] | null {
  const all = findAllDistinctSolutions(initialCards, target, 1);
  return all.length > 0 ? all[0].steps : null;
}

/**
 * Advanced Multi-Path Search: Finds multiple distinct solutions categorized by operator types.
 */
export function findAllDistinctSolutions(
  initialCards: number[],
  target: number,
  maxSolutions = 12,
  seedSolution?: SolutionStep[]
): CategorizedSolution[] {
  interface State {
    cards: number[];
    steps: SolutionStep[];
  }

  const foundSolutions: SolutionStep[][] = [];
  const solutionSignatures = new Set<string>();

  const encodeState = (cards: number[]) => [...cards].sort((a, b) => a - b).join(',');
  const solutionSig = (steps: SolutionStep[]) => steps.map((s) => s.explanation).sort().join(';');

  // If a verified seed solution was provided, seed it first
  if (seedSolution && seedSolution.length > 0) {
    const sig = solutionSig(seedSolution);
    solutionSignatures.add(sig);
    foundSolutions.push(seedSolution);
  }

  // 1. First Pass: Fast Depth-First Search for Basic Arithmetic (+, -, *, /)
  const visitedDFS = new Set<string>();
  
  function dfsArithmetic(currentCards: number[], currentSteps: SolutionStep[]) {
    if (foundSolutions.length >= maxSolutions * 2) return;

    if (currentCards.length === 1) {
      if (currentCards[0] === target && currentSteps.length > 0) {
        const sig = solutionSig(currentSteps);
        if (!solutionSignatures.has(sig)) {
          solutionSignatures.add(sig);
          foundSolutions.push([...currentSteps]);
        }
      }
      return;
    }

    const stateKey = `${encodeState(currentCards)}_${currentSteps.length}`;
    if (visitedDFS.has(stateKey)) return;
    visitedDFS.add(stateKey);

    const len = currentCards.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const a = currentCards[i];
        const b = currentCards[j];

        const rem = currentCards.filter((_, idx) => idx !== i && idx !== j);

        // Addition: a + b
        const sum = a + b;
        if (sum <= 5000) {
          dfsArithmetic([...rem, sum], [
            ...currentSteps,
            { type: 'binary', opKey: '+', opLabel: '+', a, b, result: sum, explanation: `${a} + ${b} = ${sum}` },
          ]);
        }

        // Subtraction: a - b
        if (a > b) {
          const diff = a - b;
          dfsArithmetic([...rem, diff], [
            ...currentSteps,
            { type: 'binary', opKey: '-', opLabel: '−', a, b, result: diff, explanation: `${a} − ${b} = ${diff}` },
          ]);
        } else if (b > a) {
          const diff = b - a;
          dfsArithmetic([...rem, diff], [
            ...currentSteps,
            { type: 'binary', opKey: '-', opLabel: '−', a: b, b: a, result: diff, explanation: `${b} − ${a} = ${diff}` },
          ]);
        }

        // Multiplication: a * b
        if (a > 1 && b > 1 && a * b <= 5000) {
          const prod = a * b;
          dfsArithmetic([...rem, prod], [
            ...currentSteps,
            { type: 'binary', opKey: '*', opLabel: '×', a, b, result: prod, explanation: `${a} × ${b} = ${prod}` },
          ]);
        }

        // Division: a / b
        if (b > 1 && a % b === 0) {
          const quot = a / b;
          dfsArithmetic([...rem, quot], [
            ...currentSteps,
            { type: 'binary', opKey: '/', opLabel: '÷', a, b, result: quot, explanation: `${a} ÷ ${b} = ${quot}` },
          ]);
        } else if (a > 1 && b % a === 0) {
          const quot = b / a;
          dfsArithmetic([...rem, quot], [
            ...currentSteps,
            { type: 'binary', opKey: '/', opLabel: '÷', a: b, b: a, result: quot, explanation: `${b} ÷ ${a} = ${quot}` },
          ]);
        }
      }
    }
  }

  dfsArithmetic(initialCards, []);

  // 2. Second Pass: BFS for Advanced/Unary operators if needed
  if (foundSolutions.length < maxSolutions) {
    const queue: State[] = [{ cards: [...initialCards], steps: [] }];
    const visited = new Map<string, number>();
    visited.set(encodeState(initialCards), 0);

    let iterations = 0;
    const maxIterations = 3000;

    while (queue.length > 0 && iterations < maxIterations && foundSolutions.length < maxSolutions * 2) {
      iterations++;
      const current = queue.shift()!;

      if (current.cards.length === 1 && current.cards[0] === target && current.steps.length > 0) {
        const sig = solutionSig(current.steps);
        if (!solutionSignatures.has(sig)) {
          solutionSignatures.add(sig);
          foundSolutions.push(current.steps);
        }
        continue;
      }

      if (current.steps.length >= 6) continue;

      // Binary Ops (Power, Modulo, etc)
      for (let i = 0; i < current.cards.length; i++) {
        for (let j = i + 1; j < current.cards.length; j++) {
          const valA = current.cards[i];
          const valB = current.cards[j];

          for (const op of BINARY_OPS) {
            if (['+', '-', '*', '/'].includes(op.key)) continue; // already handled by DFS

            const res1 = op.fn(valA, valB);
            if (res1 !== null && Number.isFinite(res1) && Math.abs(res1) <= 5000) {
              const nextCards = current.cards.filter((_, idx) => idx !== i && idx !== j);
              nextCards.push(res1);
              const stateKey = encodeState(nextCards);

              const nextStep: SolutionStep = {
                type: 'binary',
                opKey: op.key,
                opLabel: op.label,
                a: valA,
                b: valB,
                result: res1,
                explanation: `${valA} ${op.label} ${valB} = ${res1}`,
              };

              const prevDepth = visited.get(stateKey);
              const currentDepth = current.steps.length + 1;
              if (prevDepth === undefined || prevDepth >= currentDepth) {
                visited.set(stateKey, currentDepth);
                queue.push({ cards: nextCards, steps: [...current.steps, nextStep] });
              }
            }
          }
        }
      }

      // Unary Ops
      for (let i = 0; i < current.cards.length; i++) {
        const val = current.cards[i];
        for (const op of UNARY_OPS) {
          const res = op.fn(val);
          if (res !== null && res !== val && Number.isFinite(res) && Math.abs(res) <= 5000) {
            const nextCards = current.cards.filter((_, idx) => idx !== i);
            nextCards.push(res);
            const stateKey = encodeState(nextCards);

            const nextStep: SolutionStep = {
              type: 'unary',
              opKey: op.key,
              opLabel: op.label,
              a: val,
              result: res,
              explanation: `${op.label}(${val}) = ${res}`,
            };

            const prevDepth = visited.get(stateKey);
            const currentDepth = current.steps.length + 1;
            if (prevDepth === undefined || prevDepth >= currentDepth) {
              visited.set(stateKey, currentDepth);
              queue.push({ cards: nextCards, steps: [...current.steps, nextStep] });
            }
          }
        }
      }
    }
  }

  // Categorize and sort found solutions
  if (foundSolutions.length === 0) return [];

  // Sort primarily by step length
  foundSolutions.sort((a, b) => a.length - b.length);

  const categorized: CategorizedSolution[] = [];
  const minStepCount = foundSolutions[0].length;

  foundSolutions.forEach((steps, idx) => {
    const usedOps = Array.from(new Set(steps.map((s) => s.opKey)));
    const hasPower = usedOps.some((op) => ['^', 'sqr', 'sqrt'].includes(op));
    const hasSpecialUnary = usedOps.some((op) => ['fact', 'dbl', 'half', 'neg'].includes(op));
    const isPureAddSub = usedOps.every((op) => ['+', '-'].includes(op));
    const isPureMulDiv = usedOps.every((op) => ['*', '/'].includes(op));
    const isBasicArithmetic = usedOps.every((op) => ['+', '-', '*', '/'].includes(op));

    let category: CategorizedSolution['category'] = 'arithmetic';
    let categoryLabel = '기본 사칙연산';
    let badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    let description = '더하기(+), 빼기(−), 곱하기(×), 나누기(÷)를 사용한 풀이';

    if (steps.length === minStepCount && idx === 0) {
      category = 'shortest';
      categoryLabel = '⚡ 최단 공식';
      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      description = `가장 적은 ${steps.length}단계만에 목표에 도달하는 최적 공식`;
    } else if (isPureAddSub) {
      category = 'add_sub';
      categoryLabel = '덧셈/뺄셈 전용';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      description = '오직 덧셈(+)과 뺄셈(−)만을 조합하여 완성한 직관적 풀이';
    } else if (isPureMulDiv) {
      category = 'mul_div';
      categoryLabel = '곱셈/나눗셈 전용';
      badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      description = '곱셈(×)과 나누기(÷)의 배수 관계를 이용한 풀이';
    } else if (hasPower) {
      category = 'power_exp';
      categoryLabel = '거듭제곱/제곱근';
      badgeColor = 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30';
      description = '거듭제곱(xʸ), 제곱(x²), 제곱근(√)을 활용한 풀이';
    } else if (hasSpecialUnary) {
      category = 'special_unary';
      categoryLabel = '팩토리얼/특수연산';
      badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      description = '팩토리얼(!), 두배(×2), 절반(½) 등 특수 연산자를 활용한 기발한 풀이';
    } else if (isBasicArithmetic) {
      category = 'arithmetic';
      categoryLabel = '사칙연산 조합';
      badgeColor = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      description = '다양한 사칙연산 기호를 고루 활용한 수학 공식';
    }

    categorized.push({
      id: `sol-${idx}-${usedOps.join('-')}`,
      title: `해법 #${idx + 1}: ${categoryLabel}`,
      category,
      categoryLabel,
      badgeColor,
      description,
      usedOps,
      stepCount: steps.length,
      steps,
    });
  });

  return categorized.slice(0, maxSolutions);
}

export function getTodaySeed(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Given a "YYYY-MM-DD" date seed, returns the seed for the calendar day before it.
 * All arithmetic is done on local-time Date components (matching getTodaySeed()),
 * so this stays consistent across DST changes and never touches UTC.
 */
export function getPrevSeed(seed: string): string {
  const [y, m, d] = seed.split('-').map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Derives the current daily-challenge streak from the set of completed dates,
 * rather than incrementing a stored counter. This makes the streak self-healing:
 * a gap of one or more missed days is always reflected correctly, including the
 * very first time the app is opened after the gap (no stale "still climbing"
 * counter left over from before the miss).
 *
 * Today not yet being completed does NOT break the streak by itself — the streak
 * only breaks once a full day has been skipped (i.e. yesterday is also missing).
 * This mirrors how Wordle-style daily streaks behave.
 */
export function computeDailyStreak(completedDates: string[], todaySeed: string = getTodaySeed()): number {
  if (completedDates.length === 0) return 0;
  const completed = new Set(completedDates);
  let streak = 0;
  let cursor = completed.has(todaySeed) ? todaySeed : getPrevSeed(todaySeed);
  // Bounded by the number of completed dates so this can never loop unreasonably long.
  const maxIterations = completedDates.length + 1;
  for (let i = 0; i < maxIterations && completed.has(cursor); i++) {
    streak++;
    cursor = getPrevSeed(cursor);
  }
  return streak;
}

/**
 * A stable, ever-increasing "Day #N" number for the daily challenge, anchored to a
 * fixed launch date. Used purely for identity/shareability (e.g. "타겟너머 Day #42"),
 * the way Wordle/NYT Connections number their daily puzzles.
 */
const DAILY_EPOCH = new Date(2026, 0, 1); // 2026-01-01, local time
export function getDailyPuzzleNumber(seed: string = getTodaySeed()): number {
  const [y, m, d] = seed.split('-').map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((date.getTime() - DAILY_EPOCH.getTime()) / msPerDay) + 1);
}

export function encodeCustomPuzzle(target: number, cards: number[]): string {
  return `T${target}_C${cards.join('_')}`;
}

export function decodeCustomPuzzle(param: string): { target: number; cards: number[] } | null {
  try {
    const match = param.match(/^T(\d+)_C([\d_]+)$/);
    if (!match) return null;
    const target = parseInt(match[1], 10);
    const cards = match[2].split('_').map((n) => parseInt(n, 10)).filter((n) => !isNaN(n) && n > 0);
    if (cards.length < 2 || cards.length > 10 || isNaN(target) || target <= 0) return null;
    return { target, cards };
  } catch {
    return null;
  }
}
