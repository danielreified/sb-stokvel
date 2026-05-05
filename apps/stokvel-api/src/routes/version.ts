import type { UpdateLevel } from '@seyva/types';
import { Hono } from 'hono';
import semver from 'semver';
import { VERSION_CONFIG } from '../config/versions.js';

export const versionRouter = new Hono();

versionRouter.get('/app/version-check', (c) => {
  const clientVersion = c.req.query('version') ?? '0.0.0';
  const { minVersion, latestVersion, globalOverride, message } = VERSION_CONFIG;

  let updateLevel: UpdateLevel = 'none';

  if (globalOverride !== 'none') {
    updateLevel = globalOverride;
  } else if (semver.lt(clientVersion, minVersion)) {
    updateLevel = 'forced';
  } else if (semver.lt(clientVersion, latestVersion)) {
    updateLevel = 'optional';
  }

  return c.json({
    clientVersion,
    minVersion,
    latestVersion,
    updateLevel,
    ...(message ? { message } : {}),
    serverTime: new Date().toISOString(),
  });
});
