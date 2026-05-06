// Bun test preload — runs once before any test file. Defines globals that
// Vite normally injects at build time so app code under test doesn't crash.
(globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = '0.0.0-test';
(globalThis as { __BUILD_TIME__?: string }).__BUILD_TIME__ = new Date().toISOString();
