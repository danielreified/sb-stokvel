import { deriveUpdateLevel } from '@seyva/utils';
import { Hono } from 'hono';
import { VERSION_CONFIG } from '../config/versions.js';

export { deriveUpdateLevel };

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
