import type { UpdateLevel } from '@seyva/types';
import { deriveUpdateLevel, isHigherLevel } from '@seyva/utils';

interface VersionGuardState {
  updateLevel: UpdateLevel;
  lastSuccessfulCheckAt: number | null;
}

const STORAGE_KEY = 'seyva-version-guard';

function loadState(): VersionGuardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { updateLevel: 'none', lastSuccessfulCheckAt: null };
    // reason: localStorage roundtrip; on shape drift we fall through to
    // the catch and return the default — see CACHE_SCHEMA_VERSION buster.
    return JSON.parse(raw) as VersionGuardState;
  } catch {
    return { updateLevel: 'none', lastSuccessfulCheckAt: null };
  }
}

function saveState(state: VersionGuardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — fail silently, the gate falls back to in-memory state
  }
}

let state = loadState();
const listeners = new Set<() => void>();

export const versionGuardStore = {
  getState: (): Readonly<VersionGuardState> => state,

  /**
   * Header-only path: derives a tier from minVersion/latestVersion sent on
   * every authenticated response and **bumps up only**. We deliberately
   * never lower the tier here — only the full /api/app/version-check poll
   * has the `globalOverride` context, and downgrading on partial info
   * could clear an in-flight kill-switch between polls.
   */
  handleVersionHeaders: (headers: { minVersion?: string; latestVersion?: string }): void => {
    const { minVersion, latestVersion } = headers;
    if (!minVersion || !latestVersion) return;

    const next = deriveUpdateLevel(__APP_VERSION__, minVersion, latestVersion, 'none');
    if (!isHigherLevel(next, state.updateLevel)) return;

    state = { ...state, updateLevel: next };
    saveState(state);
    for (const fn of listeners) fn();
  },

  setFromVersionCheck: (updateLevel: UpdateLevel): void => {
    state = { updateLevel, lastSuccessfulCheckAt: Date.now() };
    saveState(state);
    for (const fn of listeners) fn();
  },

  subscribe: (fn: () => void): (() => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
