import { useEffect, useRef } from 'react';

// Stack of currently-open modals (most recent last) so ESC only closes the topmost
// one when two are open at once (e.g. Hint → Solution).
const openModalStack: symbol[] = [];

/** True while any modal using this hook is open — App's global shortcuts check it. */
export const isAnyModalOpen = () => openModalStack.length > 0;

/**
 * Shared dialog behavior for every modal:
 * - ESC closes the topmost open modal (pass `onClose` = undefined to disable).
 * - Moves focus into the dialog on open and restores it to the previously focused
 *   element on close, so keyboard users aren't left on a control behind the overlay.
 *
 * Attach the returned ref to the dialog panel, together with
 * `role="dialog" aria-modal="true" aria-labelledby=... tabIndex={-1}`.
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose?: () => void
) {
  const panelRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const id = Symbol('modal');
    openModalStack.push(id);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Defer so the panel exists (and any enter animation has mounted it).
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (panel && !panel.contains(document.activeElement)) {
        panel.focus({ preventScroll: true });
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.isComposing) return;
      if (openModalStack[openModalStack.length - 1] !== id) return;
      if (!onCloseRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      onCloseRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      const idx = openModalStack.indexOf(id);
      if (idx !== -1) openModalStack.splice(idx, 1);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return panelRef;
}
