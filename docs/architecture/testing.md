# Test architecture

This document covers the **end-to-end test rig**: Playwright matrix,
storage-state strategy, Docker pinning, and visual regression. Unit-test
coverage is intentionally light in this build — see "What's deferred"
at the bottom.

The rig is opt-in via:

```
bun run test:e2e          # native, fast iteration
bun run test:e2e:docker   # in Linux container, deterministic
bun run test:e2e:update-snapshots  # regenerate visual baselines from container
```

---

## Browser matrix

Four projects. Each is a browser engine × form factor combination:

| Project | Engine | Form factor | Approximates |
|---|---|---|---|
| `chromium` | Chromium | Desktop (1280×720) | Chrome desktop |
| `webkit` | WebKit | Desktop (1280×720) | Safari desktop |
| `mobile-chrome` | Chromium | Pixel 7 viewport | Chrome on Android |
| `mobile-safari` | WebKit | iPhone 14 viewport | Safari on iOS |

Configuration is in `playwright.config.ts`.

**Honest caveat.** Playwright's WebKit ≠ Apple Safari. Apple Safari has
macOS-only bits in its rendering pipeline (text rasterization, some
animation timing). WebKit-on-Linux gives us "WebKit-engine consistency"
but doesn't 100% cover Safari. For the rare bug that's macOS-specific,
you still need a Mac. The matrix gets us 90%, not 100% — documented in
the README.

---

## Storage-state strategy: per-project setup

The naive Playwright pattern is "one setup project signs in, writes a
shared `user.json`, every other project reuses it." For our app this
fails because the BFF binds sessions to a UA-fingerprint
(sha256 of os + engine + major-version). Desktop Chrome's session
would 401 on Mobile Safari.

**Resolution.** Each browser project has its own setup project that
signs in with that project's UA and writes a project-scoped storage
state. So Desktop Chrome reads `playwright/.auth/chromium.json`,
Mobile Safari reads `playwright/.auth/mobile-safari.json`, etc.

```
projects: [
  { name: 'setup-chromium',     testMatch: /auth\.setup\.ts/, use: { ...devices['Desktop Chrome'] } },
  { name: 'chromium',           use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/chromium.json' }, dependencies: ['setup-chromium'] },
  // ... same pattern for webkit, mobile-chrome, mobile-safari
]
```

Auth-flow tests (login happy path, wrong-PIN) explicitly override
storage state to start unauthenticated:

```
test.use({ storageState: { cookies: [], origins: [] } });
```

This decouples tests that exercise the login flow from tests that need
to be already-authenticated.

---

## Why we don't hammer the BFF in parallel

Each browser project running 4-5 tests in parallel could mean 16-20
concurrent logins to the same demo phone. The BFF has rate-limiting
(per-phone, per-IP) plus 250ms constant-time response padding for
security. Parallel hammering caused real flakiness in early runs.

The storage-state pattern fixes this: only the 4 setup projects log in
(one per browser). Subsequent tests start authenticated via cookie. The
BFF rate-limiter never sees burst traffic.

The wrong-PIN test specifically uses an **unseeded phone**
(`+27820000099`) so its failures don't accumulate in the demo user's
per-phone bucket between runs.

---

## webServer config

Playwright's `webServer` boots the BFF + PWA via `bun run dev` (turbo
runs both in parallel). In dev, `reuseExistingServer: true` means
already-running dev servers get reused. In CI, a fresh server is
booted per test run.

```
webServer: {
  command: 'bun run dev',
  url: BASE_URL,
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
  stdout: 'ignore',
  stderr: 'pipe',
},
```

This means a developer can edit code, run `bun run dev`, then
`bun run test:e2e` and the tests use the running server. No "boot
server, run tests" dance.

---

## Test specs

Four spec files under `tests/e2e/`:

| File | What |
|---|---|
| `auth.setup.ts` | Per-project sign-in. Writes storage state. |
| `auth.spec.ts` | Login flow itself: happy path → /dashboard, wrong-PIN inline error. Starts unauthenticated. |
| `navigation.spec.ts` | Each authed route renders. Drives nav by URL (works on mobile where the sidebar is in a closed Sheet). |
| `i18n.spec.ts` | Language switcher updates the breadcrumb to translated text in isiZulu and Afrikaans. |
| `visual.spec.ts` | Pixel-level screenshot comparison against committed baselines. |

Total: 24 runs across the 4-browser matrix in ~46 seconds locally.

---

## Visual regression

Three stable screens × four browsers = 12 baselines committed under
`tests/e2e/visual.spec.ts-snapshots/`:

- **Login page** — unauthenticated, predictable layout.
- **Profile page** — initials avatar, settings list.
- **Members page** — master-detail with stat cards.

Avoided: any screen with relative-time labels ("5 hours ago") that
drift between runs. Dashboard's "Recent activity" with timestamps is
specifically excluded.

### Determinism knobs

`playwright.config.ts` pins these so screenshots can't drift on a
contributor's machine in a different region:

```
use: {
  timezoneId: 'Africa/Johannesburg',
  locale: 'en-ZA',
  colorScheme: 'light',
}
expect.toHaveScreenshot: {
  maxDiffPixels: 200,
  threshold: 0.2,
  animations: 'disabled',
}
```

`maxDiffPixels: 200` absorbs antialiasing wobble. `threshold: 0.2`
absorbs subpixel rendering differences. Without these we'd get false
positives on pixel-level noise.

### Per-screen `data-testid`

Visual tests use a `data-testid="breadcrumb-page"` on the AppWindow's
breadcrumb to wait for "the page is rendered" before screenshotting.
Avoided `getByRole` on text that also exists in hidden sidebar elements
(produced false matches on collapsed sidebars).

---

## Docker rig: deterministic baselines

`Dockerfile.test` is based on `mcr.microsoft.com/playwright:v1.59.1-jammy`
with Bun added on top:

```
FROM mcr.microsoft.com/playwright:v1.59.1-jammy
RUN apt-get update && apt-get install -y --no-install-recommends unzip \
  && rm -rf /var/lib/apt/lists/* \
  && curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
WORKDIR /workspace
COPY package.json bun.lock bunfig.toml ./
COPY apps apps
COPY packages packages
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "run", "test:e2e"]
```

### Why a Dockerfile, not docker-compose

We considered docker-compose for orchestrating BFF + PWA + Playwright
as separate services, but the Playwright `webServer` config inside the
container already boots the BFF + PWA itself. One container, one
process tree, simpler.

### Why the Linux container at all

Playwright bundles its browser engines, so the **engine layer** is
deterministic across host OS. What's *not* deterministic across
Mac/Windows/Linux is OS-level font rendering — antialiasing, glyph
hinting, emoji rendering. For DOM-only tests this is invisible; for
visual regression it's the whole story.

Generating baselines from a Linux container means every contributor
compares against the same reference, regardless of their host OS.

### Visual baseline lifecycle

1. **Generate** — `bun run test:e2e:update-snapshots`. Builds Docker
   image (cached after first), runs Playwright with
   `--update-snapshots`. Baselines land on the host via volume mount.
2. **Commit** — baselines go into git under
   `tests/e2e/visual.spec.ts-snapshots/`. Treated like fixtures: small,
   versioned, reviewed.
3. **Verify** — `bun run test:e2e:docker`. Same image, no
   `--update-snapshots` flag. Pixels compared against committed
   baselines. Fails if anything drifts beyond the threshold.

### When baselines need updating

Any deliberate visual change (palette, layout, copy that affects
pixel-level rendering) requires regenerating baselines from Docker.
Reviewers see the new PNGs in the diff and either accept the change
or push back.

---

## Real BFF bugs caught while wiring this up

End-to-end tests turned up two production bugs that pure unit tests
would have missed:

### 1. Login rate-limiter incrementing on success

`apps/stokvel-api/src/middleware/rate-limit.ts` was incrementing the
per-phone bucket on every login attempt — successes included.
CLAUDE.md spec: *"5 FAILED attempts per 15-min sliding window"* — only
failures should count.

Cause: `isAllowed(key)` did `bucket.count += 1; return bucket.count <= maxAttempts`
unconditionally. Fix: split into `canAttempt(key)` (read-only) and
`recordFailure(key)`. Middleware checks before, increments only when
the handler returned 401.

### 2. Secure cookie on `http://localhost`

The session cookie was emitted with `Secure;` always. Chromium accepts
`Secure` cookies on `http://localhost` as a special case; **WebKit
refuses**. Result: WebKit + Mobile Safari tests couldn't store the
cookie at all, every authenticated request 401'd.

Fix: a `secureFlag(url)` helper in `apps/stokvel-api/src/routes/auth.ts`
emits `Secure;` only when the request URL is `https://`. Production
(HTTPS) gets the flag; dev/test on localhost don't.

Both fixes are in commit `a6bdd24`. They were trivially fixed once
the e2e tests surfaced them, but they would have stayed latent in
production until a real-world bug report arrived.

---

## What's deferred

**Unit tests.** The BFF has a few in `apps/stokvel-api/src/__tests__/`
(seed integrity, contribution POST, version-guard tier logic), but
neither the PWA nor the shared packages have unit-test coverage in
this build. The architecture is structured to support it — pure
functions in `lib/`, tier-clean separation between persistence /
crypto / queries — but the tests aren't written.

**Contract tests.** The BFF and PWA share types via `@seyva/types` and
schemas via `@seyva/validation`. No automated check that the BFF's
actual responses match what the PWA expects. In production this would
be a Pact-style consumer-driven contract test or an OpenAPI-spec
diffing pass on each PR.

**Lighthouse CI.** No automated performance budget enforcement beyond
the bundle-size script (`apps/stokvel-app/scripts/check-bundle-size.ts`).

**Accessibility testing.** Playwright has `@axe-core/playwright`
integration that would run on every screen. Not wired up. The
`@storybook/addon-a11y` is configured for component-level checks in
Storybook but doesn't gate CI.

**Cross-network conditions.** No automated tests for slow-3G, offline
recovery, request retries. The architecture supports these (network-
first cache fallback), but the test coverage is manual.

These are all in the production hardening backlog if this codebase
ever ships.
