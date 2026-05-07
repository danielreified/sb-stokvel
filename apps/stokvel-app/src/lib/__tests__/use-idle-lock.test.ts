import '../../__tests__/setup-dom.js';
import { afterEach, describe, expect, it } from 'bun:test';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useIdleLock } from '../use-idle-lock.js';

describe('useIdleLock', () => {
  afterEach(() => {
    cleanup();
  });

  it('starts unlocked', () => {
    const { result } = renderHook(() => useIdleLock({ thresholdMs: 1000 }));
    expect(result.current.isLocked).toBe(false);
  });

  it('locks after the threshold elapses without activity', async () => {
    const { result } = renderHook(() => useIdleLock({ thresholdMs: 30 }));
    expect(result.current.isLocked).toBe(false);

    await act(() => new Promise((r) => setTimeout(r, 60)));
    expect(result.current.isLocked).toBe(true);
  });

  it('resets the timer on user activity', async () => {
    const { result } = renderHook(() => useIdleLock({ thresholdMs: 50 }));

    // Halfway to lock, dispatch activity → timer resets
    await act(() => new Promise((r) => setTimeout(r, 25)));
    act(() => {
      window.dispatchEvent(new Event('mousedown'));
    });

    // 25 ms more — should still NOT be locked because activity reset us
    await act(() => new Promise((r) => setTimeout(r, 25)));
    expect(result.current.isLocked).toBe(false);

    // Wait the full threshold without activity — should lock
    await act(() => new Promise((r) => setTimeout(r, 60)));
    expect(result.current.isLocked).toBe(true);
  });

  it('unlock() clears the lock and restarts the timer', async () => {
    const { result } = renderHook(() => useIdleLock({ thresholdMs: 30 }));

    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(result.current.isLocked).toBe(true);

    act(() => {
      result.current.unlock();
    });
    expect(result.current.isLocked).toBe(false);

    // Re-locks after another idle period
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(result.current.isLocked).toBe(true);
  });

  it('does not lock when disabled', async () => {
    const { result } = renderHook(() => useIdleLock({ thresholdMs: 30, enabled: false }));
    await act(() => new Promise((r) => setTimeout(r, 60)));
    expect(result.current.isLocked).toBe(false);
  });

  it('clears the lock when disable flips to true mid-session', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useIdleLock({ thresholdMs: 30, enabled }),
      { initialProps: { enabled: true } },
    );

    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(result.current.isLocked).toBe(true);

    rerender({ enabled: false });
    expect(result.current.isLocked).toBe(false);
  });
});
