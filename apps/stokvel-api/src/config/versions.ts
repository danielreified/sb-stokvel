import type { UpdateLevel } from '@seyva/types';

/**
 * Kill-switch configuration. Flip minVersion / updateLevel here and redeploy to trigger the gate.
 * README: this is a *soft* switch — changes require a BFF redeploy, not an instant kill.
 * Production would back this with a feature-flag service for instant runtime changes.
 */
export const VERSION_CONFIG = {
  /** The version currently running on this server (injected at build via Bun.env). */
  serverVersion: process.env.APP_VERSION ?? '0.1.0',

  /**
   * Clients older than minVersion are blocked with updateLevel: 'forced'.
   * Set this forward when a breaking change ships.
   */
  minVersion: '0.1.0',

  /** Latest published version — used to nudge clients that are behind but not blocked. */
  latestVersion: process.env.APP_VERSION ?? '0.1.0',

  /**
   * Global override. Normally derived from client/minVersion comparison.
   * Set to 'forced' here to immediately block all clients regardless of version.
   */
  globalOverride: 'none' as UpdateLevel | 'none',

  /** Optional human-readable message delivered with recommended/forced tiers. */
  message: undefined as string | undefined,
};
