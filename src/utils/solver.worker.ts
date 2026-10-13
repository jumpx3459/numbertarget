// Runs findAllDistinctSolutions off the main thread. The search is exponential in
// the card count, so on 6–8 card boards (or unsolvable ones, which exhaust the
// whole tree) it can freeze the UI for a noticeable time if run inline.
import { findAllDistinctSolutions } from './gameLogic';
import type { SolverRequest, SolverResponse } from './solverClient';

// tsconfig only loads the DOM lib, so type the worker global scope minimally here.
const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<SolverRequest>) => void) | null;
  postMessage: (message: SolverResponse) => void;
};

ctx.onmessage = (e) => {
  const { id, cards, target, maxSolutions, seedSolution } = e.data;
  const solutions = findAllDistinctSolutions(cards, target, maxSolutions, seedSolution);
  ctx.postMessage({ id, solutions });
};
