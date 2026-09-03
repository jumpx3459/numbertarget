export type DragPayload =
  | { type: 'binary'; key: string; label: string; symbol: string }
  | { type: 'unary'; key: string; label: string; symbol: string }
  | { type: 'card'; cardId: string; value: number };

let currentDragPayload: DragPayload | null = null;
const listeners = new Set<(payload: DragPayload | null) => void>();

export const setDragPayload = (payload: DragPayload | null) => {
  currentDragPayload = payload;
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (err) {
      console.error('Drag listener error:', err);
    }
  });
};

export const getDragPayload = (): DragPayload | null => {
  return currentDragPayload;
};

export const subscribeDragPayload = (fn: (payload: DragPayload | null) => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
