import type { UpdateLevel } from '@seyva/types';
import { Hono } from 'hono';
import semver from 'semver';
import { VERSION_CONFIG } from '../config/versions.js';

export function deriveUpdateLevel(
  clientVersion: string,
  minVersion: string,
  latestVersion: string,
  globalOverride: UpdateLevel | 'none',
): UpdateLevel {
  if (globalOverride !== 'none') return globalOverride;
  if (semver.lt(clientVersion, minVersion)) return 'forced';
  if (semver.lt(clientVersion, latestVersion)) return 'optional';
  return 'none';
}

export const versionRouter = new Hono();

versionRouter.get('/app/version-check', (c) => {
  const clientVersion = c.req.query('version') ?? '0.0.0';
  const { minVersion, latestVersion, globalOverride, message } = VERSION_CONFIG;

  const updateLevel = deriveUpdateLevel(clientVersion, minVersion, latestVersion, globalOverride);

  return c.json({
    clientVersion,
    minVersion,
    latestVersion,
    updateLevel,
    ...(message ? { message } : {}),
    serverTime: new Date().toISOString(),
  });
});
