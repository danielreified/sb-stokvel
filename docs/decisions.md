# Architectural decisions

Log of the load-bearing choices made in this codebase. Each entry follows
the same shape:

- **Context** — what problem we were solving
- **Decision** — what we chose
- **Alternatives** — what else was on the table
- **Consequences** — what this commits us to (good and bad)

Decisions are listed roughly in the order they were made. Where a deeper
explanation lives in another doc, it's linked.

---

## ADR-001: PWA, not native

**Context.** The brief is a banking-grade stokvel app for low-end Android
on metered data in rural South Africa. We need offline support, low
delivery cost, and broad device reach.

**Decision.** PWA built on Vite + React + vite-plugin-pwa. No React Native,
no native iOS/Android.

**Alternatives.**
- React Native + SQLCipher + Keychain — what production would actually be.
- Native iOS + Android twins — biggest reach, worst dev cost.

**Consequences.**
- Bundle size becomes the dominant constraint (~200 KB initial JS budget).
- We have no Keychain/Keystore equivalent — encryption keys must be derived
  from user input (PIN) or WebAuthn.
- Service worker is the trust boundary; we accept that a CDN compromise
  poisons every request including the AES key delivery (documented in
  CLAUDE.md, mitigations called out in [security.md](architecture/security.md)).
- Delivery cost is one HTTP request, not an app-store install.

---

## ADR-002: Bun + Turborepo monorepo, single TypeScript config style

**Context.** Need fast installs, fast script runs, a workspace setup that
shares types between apps and packages.

**Decision.** Bun for install + script-runner + the BFF runtime. Turbo for
task orchestration. `workspace:*` protocol for internal package refs.
Vite always runs on Node (workbox-build needs Node fs internals — never
`vite --bun`).

**Alternatives.**
- npm/pnpm/yarn — slower installs.
- Single-package repo — less reuse between apps.

**Consequences.**
- One lockfile at the root.
- `bun --filter <pkg>` for targeted runs, `turbo run <task>` for the workspace.
- The BFF can use Bun-native APIs; the PWA can't (it's Vite/Node-bundled).

---

## ADR-003: TanStack Router file-based routing

**Context.** Need typed routing with loaders and per-route error/pending
components.

**Decision.** TanStack Router with the Vite plugin (file-based routes
under `src/routes/`). Routes use `createFileRoute`. Layout routes
(`_authed.tsx`) wrap children. Per-route `errorComponent` + `pendingComponent`.

**Alternatives.**
- React Router v6 — less typed, weaker loader story.
- Manual switch on path — DIY, error-prone.

**Consequences.**
- `routeTree.gen.ts` is generated and committed; biome ignores it.
- Pre-commit hook regenerates the route tree before typecheck.
- Routes can be loader-driven via context.queryClient, with TanStack Query
  cooperating naturally.

---

## ADR-004: Shadcn/ui via a workspace package

**Context.** Need a component library with good defaults that we can
extend without forking.

**Decision.** Shadcn/ui components copied into `packages/ui` and exported
as a workspace package. Tailwind preset shared via `@seyva/ui/tailwind.preset`.

**Alternatives.**
- Material UI / Ant Design — heavier, harder to brand.
- Radix Primitives without shadcn — more wiring per component.

**Consequences.**
- The component library lives in our repo; we own every component.
- Storybook lives in `packages/ui` and stories the components plus
  app-level scenes.
- Tailwind config is a single source of truth.

---

## ADR-005: IndexedDB for persistence, not sqlite-wasm

**Context.** PWA needs cross-session and offline persistence for the React
Query cache. Considered moving to sqlite-wasm + OPFS for "real" SQL.

**Decision.** Stay on IDB via `idb-keyval`. Build a per-record encrypted
cache on top (`lib/persist/idb-cache.ts`).

**Alternatives.**
- `sqlite-wasm` + OPFS — real SQL, indexed lookups, joins.
- Realm-style ORM — overkill for this app.

**Consequences.**
- Bundle stays ~200 KB. Adding sqlite-wasm would have meant 600+ KB —
  3x our budget. The brief is low-end Android, every KB costs.
- Access patterns are key-lookup or one filtered list — IDB composite
  indexes give the same query shape at zero JS cost.
- If data shape ever needs real joins or ad-hoc filters, sqlite-wasm
  is the documented upgrade path.

Full rationale in [architecture/persistence.md](architecture/persistence.md#what-we-rejected-and-why).

---

## ADR-006: Encrypt every cache entry, no plain tier

**Context.** Earlier, the persistence layer had three tiers: plain
(stokvel config + member roster), encrypted (balance, contributions),
and never-persisted (`me`).

**Decision.** Drop the plain tier. Every record in `idbCache` is AES-GCM
encrypted at rest. `me` is still excluded entirely (never written).

**Alternatives.**
- Keep tiers — debate which fields belong where.
- Encrypt only the bytes, leave metadata plain — what we already do.

**Consequences.**
- One rule: "everything at rest is encrypted." No misclassification bugs
  (member phone numbers were originally Tier 1; phones are PII; that
  was the kind of mistake an auditor would catch).
- AES-GCM auth tag handles tamper detection — no separate HMAC layer.
- Cold-start UX (which the plain tier was originally protecting) is now
  handled by restoring the AES key via PIN-unwrap *before* any IDB read.

Full rationale in [architecture/persistence.md](architecture/persistence.md#encryption-everything-in-idb-is-encrypted).

---

## ADR-007: Network-first with cache fallback (not stale-while-revalidate)

**Context.** Need a cache strategy for read queries. SWR (return cached
instantly + background refetch) is the trendy default; network-first is
more conservative.

**Decision.** Each `queryFn` does: try network → write through to IDB →
on failure, read from IDB. TanStack Query's in-memory cache + `staleTime`
handles in-session navigation (no spinner between screens).

**Alternatives.**
- Stale-while-revalidate — cached value flashes, then updates.
- Always-network — dies when offline.
- Cache-first with TTL — staler defaults.

**Consequences.**
- Cold paint is honest: a brief spinner, then live data.
- In-session nav is instant within `staleTime`.
- Offline still shows last-known cached data, with a "synced X ago" label.
- No mid-render "R 11,500" → "R 12,000" flicker — banking UX prefers
  spinner over flicker because money values are interpreted strictly.

Full rationale in [architecture/persistence.md](architecture/persistence.md#cache-strategy-network-first-with-cache-fallback).

---

## ADR-008: Mutations are network-only, no offline queue

**Context.** Banking apps sometimes queue mutations offline and sync
when connection returns. We don't.

**Decision.** Contribution POST and auth POST never touch any cache. The
contribution form disables submit when `navigator.onLine === false` with
a clear message.

**Alternatives.**
- Offline mutation queue with eventual sync — common in non-financial apps.
- Optimistic updates — can lie to the user.

**Consequences.**
- Money operations are binary: succeeded or failed. No "queued, we'll
  let you know" fourth state.
- Less code, one less integrity surface.
- Tradeoff: user has to be online to send money. Acceptable because
  reading their data + dashboard works offline.

Spec quote (CLAUDE.md): *"Money is high-stakes; we don't fake success."*

---

## ADR-009: PIN-wrapped session key, not WebAuthn

**Context.** AES session key is in memory only. Refresh wipes it.
Encrypted IDB cache is unreadable until re-auth. Need a way to restore
the key without a server roundtrip.

**Decision.** At login, derive a wrapping key from the user's PIN via
PBKDF2 (600k iterations, per-session salt) and AES-GCM-encrypt the
session key with it. Store the wrapped blob in IDB. On idle-lock or
cold-start, the user enters their PIN, we unwrap, key restored.

**Alternatives.**
- WebAuthn / passkey-bound wrapping key — wrapping key in secure enclave.
  Stronger but browser support is patchy on cheap Android.
- Argon2 instead of PBKDF2 — better memory-hardness, but ~30 KB WASM
  bundle hit.
- Don't persist anything; force re-login on every refresh — kills the
  offline use case.

**Consequences.**
- Cache is usable across reloads + offline.
- 4-digit PIN + PBKDF2 600k slows offline brute-force but doesn't
  defeat dedicated attackers if the encrypted blob leaks. Documented as
  the demo's primary security gap.
- WebAuthn is named in the architecture doc as the production path.

---

## ADR-010: Glass-overlay PIN lock, not page swap

**Context.** When idle-lock fires, do we replace the panel content with
the lock screen, or render an overlay over the running app?

**Decision.** Glass overlay (`absolute inset-0 z-50` with
`backdrop-blur-md`). The underlying app stays mounted but blurred behind
the lock card.

**Alternatives.**
- Swap panel content for the lock screen — what we did first; user
  feedback was it felt jarring.
- Full-page replacement (whole-viewport lock) — overkill; nothing on
  the marketing surround needs to be locked.

**Consequences.**
- Visual continuity — the user can see "their app is still there, just
  protected."
- `<Outlet />` always renders; lock is a sibling. Simpler conditional.
- Focus management: `autoFocus` on the OTP input. Full focus-trap is
  deferred (documented as a small a11y gap).

---

## ADR-011: Per-project Playwright setup, not shared storageState

**Context.** Playwright tests across 4 browsers (Chrome/Safari ×
desktop/mobile) need to be authenticated. Default approach is one
setup project that signs in once and writes a shared `user.json`.

**Decision.** Each browser project has its OWN setup project that signs
in with that project's UA and writes a project-scoped storage file
(`playwright/.auth/<project>.json`).

**Alternatives.**
- Shared storage state across projects — what most tutorials show.
- Skip storageState; each test logs in fresh — slower, hits BFF rate
  limits.

**Consequences.**
- The BFF binds sessions to a UA-fingerprint
  (sha256 of os + engine + major version). Projects with different
  UAs can't share sessions — Desktop Chrome's session would 401 on
  Mobile Safari.
- Setup runs 4×, but each is fast (~2 s).
- Tests start authenticated — no rate-limit collisions.

Full rationale in [architecture/testing.md](architecture/testing.md).

---

## ADR-012: Docker test rig for cross-OS visual regression

**Context.** Visual regression depends on font rendering, which differs
across OSes. Mac vs Linux antialiasing produces different baseline PNGs.

**Decision.** A `Dockerfile.test` based on `mcr.microsoft.com/playwright`
+ Bun + the workspace. Visual baselines are committed to the repo
(`*-linux.png`) and regenerated only from inside the Docker image. Local
dev runs tests natively (faster); CI and "regenerate baselines" use Docker.

**Alternatives.**
- docker-compose stack — orchestrate BFF + PWA + tests as services.
  Overkill since Playwright `webServer` boots the BFF + PWA inside the
  test container itself.
- Skip visual regression — accept DOM-only assertions.

**Consequences.**
- One Dockerfile, no compose. Two scripts: `bun run test:e2e:docker`
  and `bun run test:e2e:update-snapshots`.
- Baselines committed under `tests/e2e/visual.spec.ts-snapshots/`,
  named `<screen>-<project>-linux.png`.
- A Mac contributor and a Windows contributor both compare against the
  Linux baselines — deterministic.

---

## ADR-013: `useCopy()` hook for i18n, not React Context

**Context.** Need reactive locale switching (EN/ZU/AF) where every
component re-renders when the user picks a different language.

**Decision.** A small in-memory locale store (`copy/locale-store.ts`)
with `useSyncExternalStore` exposure via a `useCopy()` hook. Snapshot
accessor `getCopy()` for non-React call sites (event handlers, error
formatters).

**Alternatives.**
- `react-i18next` — heavier, full-featured, suite-grade.
- React Context — needs every consumer in a provider; runs through
  React reconciliation for every change.
- Module-level `let copy = en` swap — not reactive.

**Consequences.**
- Drop-in compatible with `react-i18next` later; the per-feature key
  shape (`copy.dashboard.balanceTitle`) matches their conventions.
- Bundle stays small.
- Locale persists in `localStorage` under `seyva-locale`.
- Copy type uses a recursive widen so non-EN locales satisfy the EN
  literal-string shape — see [architecture/i18n.md](architecture/i18n.md).

---

## ADR-014: Storybook is design-only, not a clone of the production app

**Context.** Earlier attempts wired Storybook into the real production
chrome (TanStack Router, PWA service worker, AES key store). Pulled in
virtual modules and ballooned in complexity.

**Decision.** Storybook stories live in `packages/ui/src/stories/` and
import from a self-contained `_chrome/` folder. The production app
(`apps/stokvel-app/src/layout/`) duplicates the chrome with router
wiring. Two sources of truth, both intentionally separate.

**Alternatives.**
- Storybook imports the production chrome — drags in router, PWA.
- One canonical chrome shared by both — couples Storybook to runtime
  concerns.

**Consequences.**
- Slight duplication between `_chrome/AppWindow.tsx` and
  `apps/stokvel-app/src/layout/AppWindow.tsx`. Acceptable cost.
- Storybook stays a clean visual reference — no auth, no router, no PWA.
- Adding new screens means writing both the story version and the
  production version; small upfront cost, zero ongoing complexity.

---

## ADR-015: Manual `CACHE_SCHEMA_VERSION` buster, not per-release

**Context.** The persisted cache could become incompatible with new
code if a response shape changes. Need a way to invalidate the cache.

**Decision.** A single integer constant
(`apps/stokvel-app/src/lib/persist/cache-schema.ts`) that's bumped *only*
when the persisted shape changes — never on a normal release.

**Alternatives.**
- Tie the buster to `__APP_VERSION__` — every release nukes everyone's
  offline cache and forces re-auth.
- Versioned migration registry — proper future-proof, but more code.

**Consequences.**
- Releases that don't touch persisted shapes are zero-impact for users.
- Breaking changes require a deliberate developer action (bump the
  number, write the commit message).
- A migration registry is documented in
  [architecture/persistence.md](architecture/persistence.md#production-hardening-backlog)
  as a production hardening item.
