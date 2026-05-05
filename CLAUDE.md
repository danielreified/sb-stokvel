# Seyva Stokvel

Standard Bank South Africa demo: a PWA for stokvels (community savings groups).

## Project-scoped overrides
- **Ignore the global ai-conventions MCP for this project.** Do not call `mcp__ai-conventions__*` tools while working in this directory. The conventions in this file are the source of truth.
- This is a standalone demo, not part of the reifiedstudio org. No Linear/GitHub project board lookups, no org-wide PM queries.

## Stack
- Monorepo: Turborepo + Bun workspaces. Bun pins via `packageManager`; root `engines.node >=20`.
- Bun is the package manager, script runner, and the runtime for the Hono BFF.
- **Vite always runs on Node** (never `vite --bun` — workbox-build needs Node fs internals).
- TypeScript strict mode everywhere.
- Frontend: Vite + React + vite-plugin-pwa, Tailwind + shadcn/ui, TanStack Router (file-based), TanStack Query with IndexedDB persistence, React Hook Form + Zod resolver.
- Backend: Hono on Bun, in-memory store behind a repository abstraction.
- Validation: Zod, shared via `packages/validation`.

## Tooling decisions
- **Lint + format: Biome** (single binary, single `biome.json`). No ESLint, no Prettier. Biome's `files.ignore` excludes `routeTree.gen.ts` and build outputs.
- **Pre-commit hooks: Husky + lint-staged.** `prepare` script installs Husky. Pre-commit runs `biome check --write` on staged files and `tsc --noEmit -b` across the workspace. Pre-push runs Vitest. Hooks are not optional; do not bypass with `--no-verify`.
- **Dev HTTPS: vite-plugin-mkcert.** Service workers require a secure context. `localhost` is exempt, but real-device LAN testing (low-end Android over the office Wi-Fi — the whole point) needs trusted certs. Plugin auto-installs a local CA on first run; no manual openssl dance.
- **Workspace deps: `workspace:*` protocol.** Internal packages reference each other as `"@seyva/validation": "workspace:*"`. Never use real version specifiers for internal packages — Bun will go hunting on npm and the install will fail.
- **`.env.example` is committed.** Every env var the apps read is listed with a placeholder. New contributors copy it to `.env` and the app runs. Real `.env` files stay gitignored.
- **Git: init + checkpoint commits** — one commit per meaningful milestone (scaffold, BFF, PWA shell, router, persistence, version guard, each feature, tests, README/polish). Conventional commits (`type(scope): subject`).
- **Deployment docs: vendor-neutral.** README explains the required CDN headers in generic terms with one or two example configs; we don't tie to Vercel/Cloudflare/Render.
- **PWA icons: SVG → PNG pipeline.** Single SVG master, generate 192/512/maskable PNGs via a build script (e.g. `sharp` or `pwa-asset-generator`). Standard Bank blue `#0033A0` background, white "S" monogram.

## Performance budget
- **Initial JS: ≤200 KB gzipped. Total transfer for first authenticated paint: ≤500 KB gzipped.** The whole point of the project is low-end Android on expensive data; without a number, "data-frugal" is a vibe.
- A `scripts/check-bundle-size.ts` runs after `bun run build` for the PWA, parses Vite's stats, fails non-zero if either threshold is exceeded. Wired into the `build` turbo pipeline so it runs in pre-push and (if CI exists later) blocks merge.
- Bundle analyser report (`rollup-plugin-visualizer` or `vite-plugin-bundle-analyzer`) emitted to `apps/stokvel-app/dist/stats.html` for diffing.
- Devtools (TanStack Router devtools, React Query devtools) **must be gated by `import.meta.env.DEV` AND dynamic-imported**. They never land in the prod bundle.
- **Source maps for prod**: `build.sourcemap: 'hidden'` — emit them so Sentry/Datadog can symbolicate, but don't reference them from the manifest. DevTools can't view source in prod, which prevents leaking the structure of `key-store.ts` and `SENSITIVE_QUERY_KEYS` to anyone who opens DevTools.

## Repo layout
```
seyva-stokvel/
├── apps/
│   ├── stokvel-app/      # Vite PWA (Node-run Vite)
│   └── stokvel-api/      # Hono BFF (Bun runtime)
├── packages/
│   ├── ui/               # shadcn components
│   ├── types/            # shared TS types
│   ├── validation/       # shared Zod schemas
│   ├── api-client/       # typed BFF client
│   └── utils/            # SA-specific money/date/phone formatters
├── turbo.json
├── bunfig.toml
└── package.json
```

## Engineering principles
- Small focused files; one primary export per file. Helpers may be co-located if private.
- Route components orchestrate; feature folders (`src/features/{feature}/{components,hooks,queries.ts,types.ts}`) implement. Routes import features, never the reverse.
- API calls live in `packages/api-client`. Never inline `fetch` in components.
- Components pure where possible. Data fetching at route loaders. State at the lowest necessary level.
- Custom hooks for any logic reused or complex enough to name.

## TypeScript
- Strict. No `any`. `as` casts require a `// reason: ...` comment.
- `type` for unions/aliases; `interface` for extendable object shapes.
- Single source of truth for types: `z.infer<typeof Schema>`.
- Discriminated unions for state machines.
- Branded types only for IDs that cross the API boundary (`StokvelId`, `MemberId`).

## Naming
- Components PascalCase, descriptive (`ContributionListItem`, not `Item`).
- Hooks `useXxx`. Booleans `is/has/should/can`. Event handlers `handleXxx`.
- Files match their primary export.
- No abbreviations except `id`, `url`, `api`.

## React patterns
- Composition over prop explosion; children/slots for layout.
- Derive state at render time or via `useMemo`. `useEffect` only for subscriptions, imperative DOM, syncing external systems.
- Memoize only with measurable reason.

## Data fetching
- Queries declared as `queryOptions` in `features/*/queries.ts`.
- Mutations co-located with the queries they invalidate.
- Never fetch in `useEffect`. Loading/error/empty are first-class.

## Styling
- Tailwind utilities only. No inline styles, no CSS modules.
- shadcn/ui primitives — extend, don't fork. Variants via `cva`.

## Accessibility
- Semantic HTML, full keyboard nav, labelled inputs, `aria-live` for status announcements, contrast tuned for outdoor / low-end screens.

## Comments
- Code explains *what* via naming. Comments explain *why* (hidden constraint, invariant, workaround). No commented-out code. JSDoc on exports from shared packages. TODOs include a name or ticket ref.

## Copy / i18n readiness
- All user-facing strings live in **one central module** per app (e.g. `apps/stokvel-app/src/copy/en.ts`). No string literals in components — components import from `copy`.
- Shape: a nested object grouped by feature (`copy.dashboard.balanceTitle`, `copy.contributions.offlineDisabledMessage`, `copy.errors.membersLoadFailed`). Strict TS so misspelt keys fail the build.
- Access via a thin `useCopy()` hook (or direct import). Hook returns the active locale's tree. For now there's only one locale (`en-ZA`) but the indirection is the whole point.
- **Pluralisation + interpolation**: support `{name}`-style placeholders and an optional `count` argument with `{ one, other }` from day one — retrofitting these later is the painful part, not the locale files.
- South Africa has 11 official languages. We ship English-only now, but the structure must be drop-in compatible with `react-i18next` / `formatjs` later: feature-grouped keys, no string concatenation in components, all dates/numbers/currency through `packages/utils` formatters (which already locale-parameterise).
- README documents this in a "Localisation readiness" section: what's done, what's deferred, and the upgrade path.

## Error handling
- **Route-level** errors handled with TanStack Router's `errorComponent` per data-fetching route. Domain-aware copy + a reset/retry button — never a blank screen.
- **Form-level** errors handled by RHF + Zod resolver, surfaced inline with `aria-live`.
- **App-level** unrecoverable errors caught by a top-level React `ErrorBoundary` mounted in `__root.tsx`.
- Never swallow errors. Friendly user copy; full technical detail to the logger / console.

## Pre-commit hook order
`husky` + `lint-staged` runs in this exact order on every commit:
1. `bunx tsr generate` — regenerates `routeTree.gen.ts`.
2. `git add apps/stokvel-app/src/routeTree.gen.ts` — stages the regenerated file so the commit includes it.
3. `tsc --noEmit -b` — typecheck across the workspace (including the just-regenerated route tree).
4. `biome check --write` — format + lint.

Pre-push runs `vitest run` and `bun run build` (so the bundle-size check catches regressions before push).

`routeTree.gen.ts` is committed and listed in Biome's ignore patterns. Without step 1, a dev who edits a route file but doesn't have the dev server running commits a stale route tree and `tsc` fails on the next dev's commit.

## Logging + observability
- **BFF**: Hono's `logger()` middleware for request lines (path + status + duration only — never bodies), plus a thin pino-style structured logger (`lib/logger.ts`) for business events (login, contribution created, version-check served). Errors logged with stack + request ID.
- **Sensitive-field redaction (non-negotiable)**: a `redact()` helper used by every logger call. Two layers:
  1. **Field-name denylist** — drops `pin`, `password`, `token`, `key`, `encryptionKey`, `sessionKey`, `aesKey`, `dek`, `Authorization`, `Cookie`.
  2. **Value-shape detection** — any string value that matches `^[A-Za-z0-9+/=_-]{43,}$` (base64ish, ≥32 bytes worth) is redacted regardless of field name. Same for SA-account-number-shaped strings (10–11 digits with optional spaces). This catches the case where a future implementer names the key field something we didn't predict.
  - Implementation-phase: add the value-shape layer when writing the logger module. Field-name layer is mandatory from day one.
  - **Hard route guards**: the login and `/api/me` route handlers each carry an explicit `// SECURITY: never log this body` comment AND a per-route logger config that disables body logging. Belt and braces — don't rely solely on `redact()` luck.
  - One slipped `console.log(req.body)` in dev = the AES key leaks to stdout forever.
- **Request IDs**: Hono middleware first in the chain — passes through incoming `x-request-id` or generates `crypto.randomUUID()`, exposes it on context, sets it on every response. The API client surfaces this ID in thrown errors so the client log includes it.
- **Client**: `lib/logger.ts` (level-aware `console` wrapper, same redact helper). Top-level `window.onerror` + `unhandledrejection` handlers log with version + last-known request ID. README documents this is the seam where Sentry/Datadog would plug in.

## API client (factory + interceptors)
- `packages/api-client` exports a `createApiClient(options)` factory. The package has **no React dependency** — it's a pure TypeScript client.
- `options` shape:
  - `onUnauthorized?: () => void` — called on any 401 response. The React app wires this to a silent `signOut()` followed by `window.location.href = '/login?reason=expired&redirect=<current path>'`. The login screen reads `?reason=expired` and shows "your session expired, sign in again" instead of a generic toast.
  - `onVersionHeaders?: (headers: { minVersion?: string; latestVersion?: string }) => void` — called when `X-Min-Client-Version` / `X-Latest-Client-Version` are present on a response. The React app wires this to the version-guard store at bootstrap so the tier bumps immediately without waiting for the 5-min poll. This is the only seam between the headless api-client and the React-side state.
- Errors thrown by the client carry the response's `x-request-id` so client logs / error toasts can quote it.

## Routing (TanStack Router, file-based)
- Routes in `apps/stokvel-app/src/routes/`. Folder structure for nesting (not dot syntax).
- `@tanstack/router-plugin/vite` must come **before** the React plugin in `vite.config.ts`.
- `routeTree.gen.ts` is generated — committed, but listed in Biome's ignore patterns. Never hand-edit.
- Root: `createRootRouteWithContext<{ queryClient: QueryClient; auth: AuthState }>()`.
- App root lifts `useQuery(meQueryOptions)` and feeds `<RouterProvider context={...} />`.
- After login/logout call `router.invalidate()` so `beforeLoad` re-runs.
- `_authed.tsx` reads `context.auth` and redirects to `/login?redirect=...` when unauthenticated.
- Loaders use `context.queryClient.ensureQueryData`. Components read with `useSuspenseQuery`.
- **Suspense boundaries are per-route, not app-wide.** Each data-fetching route declares its own `pendingComponent` (skeleton). Never wrap the whole router in one `<Suspense>` — that produces full-page skeletons instead of localised loading. The default `pendingComponent` for `_authed.tsx` is a layout shell so navigation feels instant even when the inner data is fetching.

## Persistence + encryption tiers
Three tiers govern what gets persisted and how:

1. **Plain (persisted unencrypted)** — stokvel name, rules, member names. Public-ish; no attacker value.
2. **Encrypted (persisted)** — balance, contribution history, amounts, statuses. The meaningful offline data.
3. **Never persisted** — auth tokens (HttpOnly cookie, never readable by JS), full account numbers, anything catastrophic if leaked.

### Architecture (one client, one persister)
- **ONE `QueryClient`, ONE persister.** Do not introduce a second `QueryClient` or a second `PersistQueryClientProvider` — a single client can only have one provider. The earlier "two persisters" alternative was wrong; the predicate-split path is the only viable one.
- Two mechanisms work together to enforce the three tiers, in this order:
  1. **Tier-3 exclusion** — `dehydrateOptions.shouldDehydrateQuery` returns `false` for tier-3 query keys (e.g. `['me']`, anything sensitive that should never touch disk). Those queries also use `gcTime: 0` / `staleTime: 0` so they don't sit in memory longer than necessary.
  2. **Encryption routing** — inside the single persister's `setItem`/`getItem`, each entry's query key is checked against a `SENSITIVE_QUERY_KEYS` list. Matches are encrypted with AES-GCM before write and decrypted on read. Non-matches are written plaintext. Both go to the same `idb-keyval` store under one persistence key (`PERSIST_KEY`).
- The persister lives at `lib/persist/persister.ts`. The sensitive list lives at `lib/persist/sensitive-keys.ts`.

### How encryption works
- On login, the BFF returns a **per-session AES-256 key** in the JSON body alongside the session cookie. Key is base64.
- `GET /api/me` also returns the current session's key — this is the **session-resume path**: on page refresh the in-memory key is gone but the session cookie is still valid, so the boot-time `/api/me` call rehydrates the key. Without this, every refresh would force a re-login.
- The key lives in **memory only** — `lib/crypto/key-store.ts` holds it in a module-scoped variable. Never written to disk, IndexedDB, or `localStorage`.
- AES-GCM via the Web Crypto API (`crypto.subtle`). Random 12-byte IV per write, prepended to the ciphertext.
- On **cold start without a session**: there's no key, so encrypted reads fail. Treat decryption failures (missing key, tampered blob, key mismatch) as a **cache miss** — fail closed, never throw to the user, just refetch on next online query. Plain-tier data is still readable offline.

### Logout flow
`signOut()` is the single logout path. Order matters:
1. `POST /api/auth/logout` (server clears session record + cookie).
2. `keyStore.clearKey()` (in-memory AES key gone).
3. `queryClient.clear()` (live React Query cache gone).
4. **`indexedDB.deleteDatabase('keyval-store')`** — drops the entire database, not just one key. `idbKeyval.del(PERSIST_KEY)` would leave the DB, the store, and any other keys (devtools state, future telemetry, accidental dependency writes) intact for the next user on a shared device. Database-level delete is the only thing that truly clears.
5. `window.location.href = '/login'` (full reload restarts the SW cleanly, eliminates any in-flight write race).

We do **not** wipe `caches` (the Workbox storage). The SW precache holds the app shell, which we need so `/login` loads on a flaky connection after the redirect. We deliberately don't cache JSON API responses at the Workbox layer (see *Offline behaviour*), so there's nothing user-specific in `caches` to leak between users.

### Cache schema versioning (the buster)
- The persister's `buster` is a manually-bumped constant: `CACHE_SCHEMA_VERSION` in `apps/stokvel-app/src/lib/cache-schema.ts`.
- Bump it **only** when the shape of persisted data changes (renamed field, restructured response, etc.) — not on every app release.
- Tying the buster to `__APP_VERSION__` was the wrong call: every patch release would nuke every user's offline cache and force re-auth + re-fetch, conflicting with the "optional update" tier where users are explicitly told they don't need to update.

### README disclosure ("Data sensitivity")
README must include a Data Sensitivity section covering: the three tiers and what's in each; the in-memory key model; AES-GCM via Web Crypto; **the key is delivered at login and re-delivered on `/api/me` for session resume — the key's lifetime equals the session cookie's lifetime, no stricter**; the cold-start-without-session tradeoff (encrypted cache unreadable until re-auth — deliberate); that a production version would evaluate WebAuthn-wrapped keys for biometric-gated cold-start access.

## Offline behaviour
- **Workbox is for the app shell only.** Precache: HTML, JS, CSS, fonts, icons. We do **not** cache JSON API responses at the Workbox layer.
- Why not: React Query + IndexedDB persistence already handles offline data access (parsed objects, with staleness/invalidation/refetch baked in). A Workbox runtime cache for the same endpoints would store the raw HTTP response of data React Query has already parsed and cached — duplicate work, two sources of truth, and the cross-user contamination problem on shared devices that we'd have to defend against. Dropping it is a net simplification with no perceived perf loss (React Query keeps showing previous data during refetches, so users never see a blank screen).
- Auth + contribution POST: **Network Only**. These never touch any cache. Money is high-stakes; we don't fake success. Offline → contribution form disables submit and shows "you need a connection to send money". Comment in code so no one "helpfully" adds a mutation queue.
- React Query persistence: `@tanstack/query-async-storage-persister` + `idb-keyval`. One persister, one entry under `PERSIST_KEY`. Per-query staleness lives in each `queryOptions.staleTime`, NOT on the persister.
- The persister **must restore before `RouterProvider` mounts** (use `PersistQueryClientProvider` or await restore in bootstrap).
- "Last updated" UI uses React Query's `dataUpdatedAt`. If the API exposes a server timestamp, name it for its domain (`reconciledAt`), don't conflate with cache freshness.
- **Clock-skew clamp**: cheap Androids often have wrong system clocks. The relative-time formatter in `packages/utils` clamps future timestamps to "just now" and falls back to an absolute date for anything older than ~1 year. Otherwise users see "last updated in 3 hours" or "27 years ago".
- **Contribution submission is Network Only on purpose.** Money is high-stakes; we don't fake success. Offline → form disables submit and shows "you need a connection to send money". Comment this in code so no one "helpfully" adds a queue.

## PWA
- Manifest fields (all required):
  - `name`, `short_name`, `description`
  - `id` — stable PWA identity across deploys (`/?source=pwa` or similar). Without this, browsers may treat each deploy as a new app.
  - `start_url: "/"`, `scope: "/"` — defines what counts as "in the app".
  - `display: "standalone"`, `orientation: "portrait"` (mobile-first).
  - `theme_color: "#0033A0"`, `background_color: "#0033A0"`.
  - `icons`: 192, 512, and a separate maskable 512 (`purpose: "maskable"`).
  - `shortcuts`: "Make Contribution", "View Members".
- iOS-specific tags in `index.html` (Safari ignores most of the manifest):
  - `<link rel="apple-touch-icon" href="/icon-180.png">`
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
  - `<meta name="apple-mobile-web-app-title" content="Seyva">`
- vite-plugin-pwa with Workbox precaching only (no runtime caches for JSON; see *Offline behaviour*).
- Custom install-prompt UX (don't rely on the browser default).
- Goal: pass Lighthouse "Installable" audit + PWA baseline. The retired "PWA" Lighthouse category doesn't exist any more — don't chase a score that's gone.
- **Service worker integrity model**: SW integrity is delegated to TLS + same-origin trust. We do not sign `sw.js` independently — there's no widely-deployed standard for SW signing. Implication: a CDN compromise can poison the SW, which intercepts every request including `/api/auth/login`, exfiltrating the PIN and the AES key on its way through. Mitigations: (a) restrict CDN write access aggressively, (b) `Subresource Integrity` for any scripts the SW imports (limited mitigation), (c) production should evaluate signed-exchange or signed-precache-manifest mechanisms when they mature. README must state the trust model explicitly so future readers don't have to guess.

## App update strategy
- Default: vite-plugin-pwa with `registerType: 'prompt'`, `skipWaiting: false`, `clientsClaim: false`. Banking context — no surprise reloads.
- `UpdatePrompt` (uses `useRegisterSW` from `virtual:pwa-register/react`) renders a dismissable toast: "Update available — Refresh / Later". Mounted in `__root.tsx`. Hourly `registration.update()` polling.
- Build embeds version: `define: { __APP_VERSION__, __BUILD_TIME__ }` in `vite.config.ts`.
- README must explain CDN cache headers: `index.html` and `sw.js` → `Cache-Control: no-cache`; hashed assets immutable. Getting this wrong silently breaks updates.

### Forced-update / kill switch (banking-grade)
- Server-controlled tier: `none | optional | recommended | forced`.
- `optional` → standard toast. `recommended` → persistent dismissable banner. `forced` → full-screen non-dismissable gate; authenticated tree does not render.
- BFF: `GET /api/app/version-check?version=X.Y.Z` returns `{ clientVersion, minVersion, latestVersion, updateLevel, message?, serverTime }`.
- BFF also sets `X-Min-Client-Version` and `X-Latest-Client-Version` on every authenticated response. API-client interceptor bumps the level if it changes between polls.
- Client polls on boot + every 5 min.
- **Persisted state in `localStorage`**: `{ updateLevel, lastSuccessfulCheckAt }`. `lastSuccessfulCheckAt` records the wall-clock time of the most recent successful version-check.
- **Fail open on transport errors (network/5xx → treat as `none` for the current poll)** so an ops outage doesn't lock users out — but with a guardrail (below).
- **Max-staleness gate (the guardrail)**: if `now - lastSuccessfulCheckAt > 24 hours`, the client refuses to render the authenticated tree regardless of stored `updateLevel`. It shows a "Couldn't verify app version — connect to a network and try again" screen with a retry button. This closes the attack where a network-positioned adversary black-holes only `/api/app/version-check` to keep a vulnerable old client running indefinitely. 24h is a balance: long enough that occasional offline use isn't disrupted, short enough that a true kill-switch can't be defeated by a sustained block.
- **Tamper resistance for `localStorage`**: localStorage is JS-writable, so any XSS or devtools paste can flip `forced` → `none`. Mitigation (implementation-phase): the version-check response is HMAC-signed server-side with a per-deploy secret; client verifies the signature before trusting any cached tier. For the demo we ship without HMAC and document the limitation in the README. The max-staleness gate is the primary defence; HMAC is the layered second.
- "Update Now" → try `updateServiceWorker(true)`; fall back to nuclear path (unregister SWs, clear caches, hard reload). Both in one `forceUpdate()` helper.
- Reserve `forced` for genuine cause (security, compliance, breaking API, critical correctness). Don't cry wolf.
- Use the `semver` package for comparisons. Never string-compare versions.
- Whole authenticated tree renders inside `<ForcedUpdateGate>`. The gate also wraps the max-staleness check.
- **Kill switch is a *soft* switch**: flipping `versions.ts` requires a BFF redeploy. README must call this out — it's not an instant kill. Production would back this with a feature-flag service or a config endpoint that reads from somewhere mutable at runtime.

## BFF (stokvel-api)
- Hono + TypeScript on Bun.
- In-memory `Map`s in a `store/` module, behind a repository abstraction. Route handlers stay thin.
- Deterministic seed: 1 stokvel, 8 members, 3 months of contributions, **fixed UUIDs** so the persisted client cache survives API restarts.
- Endpoints: `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`, `GET /api/stokvel/:id`, `GET /api/stokvel/:id/members`, `GET /api/stokvel/:id/contributions` (`?month=YYYY-MM&memberId=...`), `GET /api/stokvel/:id/balance`, `POST /api/stokvel/:id/contributions`, `GET /api/app/version-check`.
- Version policy lives in `apps/stokvel-api/src/config/versions.ts`. README must call this out as where to flip the kill switch.

### Cross-cutting middleware
- **Request ID** middleware first in the chain.
- **Logger** middleware second, so it can read the request ID.
- **Security headers** middleware (third, before any routes):
  - **Strict CSP** (dev may relax for HMR; prod is strict):
    - `default-src 'self'`
    - `script-src 'self' 'strict-dynamic' 'sha256-<vite-bootstrap-hash>'` — **NO `'unsafe-inline'`**. Vite's inline bootstrap script is hashed at build time and the hash injected into the CSP via a Vite plugin (e.g. `vite-plugin-csp-guard` or a small custom plugin). `'strict-dynamic'` lets the bootstrap dynamically load further hashed scripts without each needing its own hash entry.
    - `style-src 'self'` — **NO `'unsafe-inline'` in prod**. Tailwind compiles to a static stylesheet, so this works as long as we don't write `style={{...}}` JSX (already forbidden) and we tame Radix/shadcn animation styles. If a specific Radix primitive injects inline styles we can't avoid, hash them at build time — never reach for `'unsafe-inline'`.
    - `img-src 'self' data:`
    - `connect-src 'self'`
    - `frame-ancestors 'none'`
    - `base-uri 'self'`
    - `form-action 'self'`
    - `worker-src 'self'` — explicit (we have a service worker; don't rely on `script-src` fallback).
    - `manifest-src 'self'`
    - `object-src 'none'`
    - `frame-src 'none'`
    - `report-to /api/csp-report` — CSP violations POST to a BFF endpoint that logs them. Without this we have no signal when attackers probe.
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HTTPS enforced; matched by mkcert in dev).
  - `X-Frame-Options: DENY` (legacy backstop alongside `frame-ancestors 'none'`).
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` (we don't use any of these; deny by default).
  - **`Cache-Control: no-store, private` + `Pragma: no-cache` on every authenticated response** (especially `/api/auth/login` and `/api/me`, which carry the AES key). Without this, corporate proxies, CDNs, or browser bfcache can cache the key. Implementation-phase work — bolt-on once auth routes exist.
  - All headers set on every response, including errors. Document the CSP rationale in README — the in-memory AES key is JS-reachable, so a strict CSP is the seatbelt that prevents XSS exfil.
- **Health check**: `GET /api/health` returns `{ status: 'ok', version, uptimeSeconds }`. Cheap, unauthenticated, expected by any reviewer / load balancer.
- **CSP report sink**: `POST /api/csp-report` accepts a CSP violation report (`application/csp-report` or `application/reports+json`), logs it via the structured logger, returns 204. Unauthenticated.
- **Login rate limiting (layered scheme)**: a single token-bucket library, three buckets evaluated per request:
  1. **Per-phone** — tight: 5 failed attempts per 15 min sliding window. Targets account-targeted brute force.
  2. **Per-IP** — loose: 200 failed attempts per 15 min sliding window. Wide because SA mobile networks are CGNAT — thousands of legit users share an IP. Catches scripted attacks from one source without DOSing carrier users.
  3. **Global anomaly counter** — total failed logins / minute. If it exceeds `10× rolling-hour baseline`, apply a global 1-second slowdown. Catches credential-stuffing waves.
  All three checked; the strictest applies. Returns `429` with `Retry-After` only when per-phone trips. Lives in middleware applied only to `POST /api/auth/login`. README notes "demo-grade in-memory; production would use Redis or the WAF."
- **Identical-shape login responses (constant-time)**: every failed-login response — wrong PIN, no such phone, rate-limited, session-creation failed — returns the **same HTTP status (401)**, the **same JSON body shape** (`{ error: 'invalid_credentials' }`), and is **padded to a constant time** (~250ms via `setTimeout` after the cheapest path completes) before responding. Mock auth must enforce this rule too — the production seam inherits whatever shape the mock ships. Document the rule in code with a `// SECURITY: constant-time, identical-shape — do not differentiate` comment.

### Auth schema (single source of truth)
`packages/validation/src/auth.ts` exports `LoginSchema`:
```ts
LoginSchema = z.object({
  phone: z.string().regex(/^\+27[0-9]{9}$/, '...'),
  pin: z.string().regex(/^\d{4}$/, '...'),
})
```
Imported by: the BFF login route handler, the login form's RHF resolver, the api-client login method, and the rate limiter (which keys on `phone`). One schema, no field-name drift between layers.

### Auth (mock but realistic)
- 128-bit random session ID via `crypto.randomUUID()`. In-memory `Map<sessionId, { userId, createdAt, lastSeenAt, uaFingerprint }>`.
- Cookie: opaque ID, unsigned (it's meaningless without server state). `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200`.
- Login rotates the session ID. Logout deletes server record + clears cookie.
- Middleware enforces 15-min idle timeout, 12h absolute timeout, and a **stable-subset UA-fingerprint match** (not full UA string match — see below).
- **UA-binding (precise definition)**: at session creation, parse the User-Agent header and compute `uaFingerprint = sha256(osFamily + browserEngineName + browserEngineMajorVersion)`. Store with the session. On every request, recompute the incoming fingerprint and compare. **Match the stable subset, not the full string** — Android Chrome auto-updates mid-session and changes the full UA; the engine major version is stable across that. If we required exact string match we'd self-DOS legitimate users. If we require nothing we lose the cookie-replay-from-different-device defence. The fingerprint is the middle ground. Mismatch → 401, session destroyed. Use a small UA-parser library (`ua-parser-js` or similar) so we don't reinvent the lexer.
- CSRF: `SameSite=Lax` + POST-only state changes. README documents double-submit token as future hardening.
- A clear `// DEMO: accepts any credentials` comment marks the mock nature.

### Same-origin via Vite proxy
- Vite dev server proxies `/api/*` → `http://localhost:3000`.
- API client uses relative URLs only. No CORS, no `credentials: 'include'`, no `SameSite=None`.

## UI/UX
- Mobile-first. South African Rand (R) money formatting. SA phone format (+27).
- Loading **skeletons**, not spinners. Optimistic updates only where safe — never for contributions.
- Clear offline/online indicators.

## Testing + Deliverables
The full test bar and the full README/deliverables list are owned by Tasks #15 and #16 respectively (they evolved past the original "minimum bar" wording during spec rounds). When the build is complete, regenerate canonical *Testing* and *Deliverables* sections here from the final state of those tasks so this file stays the single source of truth.
