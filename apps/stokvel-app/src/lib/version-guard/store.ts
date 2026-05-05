import type { UpdateLevel } from '@seyva/types';

interface VersionGuardState {
  updateLevel: UpdateLevel;
  lastSuccessfulCheckAt: number | null;
}

const STORAGE_KEY = 'seyva-version-guard';

function loadState(): VersionGuardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { updateLevel: 'none', lastSuccessfulCheckAt: null };
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

  handleVersionHeaders: (_headers: { minVersion?: string; latestVersion?: string }): void => {
    // Version-check response via API interceptor — level will be resolved on next poll
    // Full tier logic lives in the polling loop in version-guard/poll.ts
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
