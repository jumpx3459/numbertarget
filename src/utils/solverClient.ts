import { useEffect, useState } from 'react';
import { CategorizedSolution, SolutionStep } from '../types';
import { findAllDistinctSolutions } from './gameLogic';

export interface SolverRequest {
  id: number;
  cards: number[];
  target: number;
  maxSolutions: number;
  seedSolution?: SolutionStep[];
}

export interface SolverResponse {
  id: number;
  solutions: CategorizedSolution[];
}

export interface SolverJob {
  promise: Promise<CategorizedSolution[]>;
  /** Abandons the job. A still-running search is stopped by terminating its worker. */
  cancel: () => void;
}

let nextId = 1;

/**
 * Runs findAllDistinctSolutions in a dedicated Web Worker. Each job gets its own
 * worker so cancelling a superseded search (cards changed, input re-typed, modal
 * closed) can terminate it outright instead of queueing behind it.
 * Falls back to an async main-thread run where Workers aren't available.
 */
export function solveInWorker(
  cards: number[],
  target: number,
  maxSolutions: number,
  seedSolution?: SolutionStep[]
): SolverJob {
  const id = nextId++;
  let cancelled = false;

  if (typeof Worker === 'undefined') {
    let timer = 0;
    const promise = new Promise<CategorizedSolution[]>((resolve) => {
      timer = window.setTimeout(() => {
        if (!cancelled) resolve(findAllDistinctSolutions(cards, target, maxSolutions, seedSolution));
      }, 0);
    });
    return {
      promise,
      cancel: () => {
        cancelled = true;
        window.clearTimeout(timer);
      },
    };
  }

  const worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
  const promise = new Promise<CategorizedSolution[]>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<SolverResponse>) => {
      if (e.data.id !== id) return;
      worker.terminate();
      if (!cancelled) resolve(e.data.solutions);
    };
    worker.onerror = (err) => {
      worker.terminate();
      if (!cancelled) reject(err);
    };
  });
  const request: SolverRequest = { id, cards, target, maxSolutions, seedSolution };
  worker.postMessage(request);

  return {
    promise,
    cancel: () => {
      cancelled = true;
      worker.terminate();
    },
  };
}

export interface SolverState {
  solutions: CategorizedSolution[];
  /** True while a search for the current inputs is in flight. */
  loading: boolean;
}

/**
 * React wrapper around solveInWorker. Only searches while `enabled` (e.g. the
 * modal is open) and re-searches when the cards/target change; a search for stale
 * inputs is cancelled. `cards === null` means "nothing to search" (invalid input).
 */
export function useSolverSolutions(
  cards: number[] | null,
  target: number,
  maxSolutions: number,
  enabled: boolean,
  seedSolution?: SolutionStep[]
): SolverState {
  // Primitive key so a new-but-equal cards array doesn't restart the search.
  const key = enabled && cards ? `${target}|${maxSolutions}|${cards.join(',')}` : null;
  const [state, setState] = useState<{ key: string | null; solutions: CategorizedSolution[] }>({
    key: null,
    solutions: [],
  });

  useEffect(() => {
    if (key === null || !cards) return;
    const job = solveInWorker(cards, target, maxSolutions, seedSolution);
    job.promise
      .then((solutions) => setState({ key, solutions }))
      .catch((err) => {
        console.error('Solver worker failed', err);
        setState({ key, solutions: [] });
      });
    return job.cancel;
    // `cards`/`seedSolution` are captured via `key` (seedSolution belongs to the same puzzle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (key === null) return { solutions: [], loading: false };
  if (state.key !== key) return { solutions: [], loading: true };
  return { solutions: state.solutions, loading: false };
}
