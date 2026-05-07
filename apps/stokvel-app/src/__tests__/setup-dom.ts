/**
 * Registers happy-dom on globalThis so React Testing Library can mount
 * components in bun test. Import this from any *.test.ts file that needs
 * `document`, `window`, or React rendering.
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator';

if (!(globalThis as { __HAPPY_DOM_REGISTERED__?: boolean }).__HAPPY_DOM_REGISTERED__) {
  GlobalRegistrator.register();
  (globalThis as { __HAPPY_DOM_REGISTERED__?: boolean }).__HAPPY_DOM_REGISTERED__ = true;
}
