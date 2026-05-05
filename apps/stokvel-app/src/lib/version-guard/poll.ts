import { api } from '../api.js';
import { logger } from '../logger.js';
import { versionGuardStore } from './store.js';

const POLL_INTERVAL_MS = 5 * 60 * 1000;

async function checkVersion(): Promise<void> {
  try {
    const result = await api.version.check(__APP_VERSION__);
    versionGuardStore.setFromVersionCheck(result.updateLevel);
  } catch {
    // Network/5xx error — fail open for this poll (max-staleness gate handles the guardrail)
    logger.warn('version_check_failed');
  }
}

let intervalId: ReturnType<typeof setInterval> | undefined;

export function startVersionPolling(): void {
  void checkVersion();
  intervalId = setInterval(() => void checkVersion(), POLL_INTERVAL_MS);
}

export function stopVersionPolling(): void {
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}
