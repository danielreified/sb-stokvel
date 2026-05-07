import '../../__tests__/setup-dom.js';
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { act, cleanup, renderHook } from '@testing-library/react';
import { localeStore, useCopy } from '../index.js';

describe('useCopy', () => {
  beforeEach(() => {
    localeStore.setLocale('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('returns the EN copy tree by default', () => {
    const { result } = renderHook(() => useCopy());
    expect(result.current.nav.dashboard).toBe('Dashboard');
  });

  it('re-renders with new copy when locale switches', () => {
    const { result } = renderHook(() => useCopy());
    expect(result.current.nav.dashboard).toBe('Dashboard');

    act(() => {
      localeStore.setLocale('zu');
    });

    expect(result.current.nav.dashboard).toBe('Ikhasi elikhulu');
  });

  it('re-renders to Afrikaans', () => {
    const { result } = renderHook(() => useCopy());

    act(() => {
      localeStore.setLocale('af');
    });

    expect(result.current.nav.dashboard).toBe('Paneelbord');
  });

  it('does not re-render when setting the same locale', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useCopy();
    });

    const baseline = renderCount;
    act(() => {
      localeStore.setLocale('en'); // already en
    });

    expect(renderCount).toBe(baseline);
    expect(result.current.nav.dashboard).toBe('Dashboard');
  });
});
