import { useCallback, useEffect, useRef, useState } from 'react';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

interface UseIdleLockOptions {
  /** Idle threshold in milliseconds before the lock engages. */
  thresholdMs: number;
  /** Disable the lock entirely (e.g. for unauth pages). */
  enabled?: boolean;
}

/**
 * Tracks user activity and flips `isLocked` to true after `thresholdMs` of
 * inactivity. Activity = any of {mousedown, keydown, touchstart, scroll} on
 * the document. The timer keeps counting when the tab is hidden — leaving
 * the tab idle for the threshold should still trigger the lock.
 *
 * `unlock()` clears the lock and restarts the timer.
 */
export function useIdleLock({ thresholdMs, enabled = true }: UseIdleLockOptions) {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restartTimer = useCallback(() => {
    clearTimer();
    if (!enabled) return;
    timerRef.current = setTimeout(() => setIsLocked(true), thresholdMs);
  }, [clearTimer, enabled, thresholdMs]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    restartTimer();
  }, [restartTimer]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      setIsLocked(false);
      return;
    }
    if (isLocked) {
      // No activity tracking while locked — nothing to reset.
      return;
    }
    restartTimer();
    const handler = () => restartTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handler, { passive: true });
    }
    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handler);
      }
      clearTimer();
    };
  }, [enabled, isLocked, restartTimer, clearTimer]);

  return { isLocked, unlock };
}
