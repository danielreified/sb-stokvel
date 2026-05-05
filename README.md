# Seyva Stokvel

A Progressive Web App for managing stokvels (community savings groups), built as a Standard Bank South Africa demo. Designed for low-end Android devices on expensive mobile data.

## Demo credentials

| Field | Value |
|---|---|
| Phone | `+27821000001` |
| PIN | `1234` |

## Quick start

```bash
bun install
bun run apps/stokvel-app/scripts/generate-icons.ts  # first time only

# In two terminals:
bun run dev   # starts both BFF (port 3000) and Vite (port 5173) via Turborepo
```

Open `https://localhost:5173`. Vite proxies `/api/*` to the BFF — no CORS, cookies work normally. Requires HTTPS for service workers; `vite-plugin-mkcert` installs a local CA on first run.

## Repo layout

```
seyva-stokvel/
├── apps/
│   ├── stokvel-app/          # Vite PWA (runs on Node via Vite)
│   └── stokvel-api/          # Hono BFF (runs on Bun)
├── packages/
│   ├── types/                # Shared domain types + branded IDs
│   ├── validation/           # Shared Zod schemas
│   ├── utils/                # SA money/date/phone formatters
│   ├── api-client/           # Typed BFF client factory
│   └── ui/                   # cn() helper + shared primitives
├── turbo.json
└── package.json
```

## Architecture

**Frontend** — React 19 + Vite + vite-plugin-pwa. File-based routing via TanStack Router. Data fetching via TanStack Query with IndexedDB persistence. Forms via React Hook Form + Zod.

**BFF** — Hono on Bun. In-memory store behind a repository abstraction. Deterministic seed data with fixed UUIDs (cache survives restarts). No external database — pure demo.

**Shared packages** — Source-first (no build step). Apps consume TypeScript directly via `exports: { ".": "./src/index.ts" }` and TypeScript path mappings.

## Data sensitivity

Three tiers govern what is persisted and how:

| Tier | Examples | Storage |
|---|---|---|
| Plain | Stokvel name, rules, member names | IndexedDB (unencrypted) |
| Encrypted | Balance, contribution history, amounts | IndexedDB (AES-256-GCM) |
| Never persisted | Auth cookie (HttpOnly), session AES key | Memory only |

**Encryption model**

On login, the BFF returns a per-session AES-256 key in the JSON body alongside an HttpOnly session cookie. The key lives in a module-scoped variable (`lib/crypto/key-store.ts`) — never written to disk, IndexedDB, or localStorage.

The same key is re-returned by `GET /api/me` on page refresh. This is the *session-resume path*: the in-memory key is gone after a reload, but the session cookie is still valid, so the boot-time `/api/me` call rehydrates both the auth state and the AES key. Without this, every refresh would force a re-login.

AES-GCM via the Web Crypto API (`crypto.subtle`). A fresh random 12-byte IV is generated per write, prepended to the ciphertext. Each encrypted IndexedDB entry is independently encrypted — a read error for one entry does not affect others.

**Cold start without a session**: if there is no valid session cookie, the AES key cannot be restored and encrypted cache reads fail. This is treated as a cache miss — the app falls back to an authenticated network fetch when connectivity is available. Plain-tier data remains readable offline regardless. A production version would evaluate WebAuthn-wrapped keys for biometric-gated cold-start decryption.

**Key lifetime**: the AES key's lifetime equals the session cookie's lifetime (15-minute idle timeout, 12-hour absolute maximum). There is no separate key expiry.

## Offline behaviour

**Workbox handles the app shell only** — HTML, JS, CSS, fonts, icons. No JSON API responses are cached at the Workbox layer.

React Query + IndexedDB handles offline data access. React Query keeps showing previous data during refetches, so users never see a blank screen when connectivity is intermittent.

**Network-only operations**: authentication and contribution POST are always network-only. The contribution form disables submit and shows an offline banner when `navigator.onLine` is false. Money is high-stakes — the app never fakes a successful submission.

**Offline indicator**: an amber banner appears site-wide in the authenticated layout when the device reports offline.

## App update strategy

The update system has two layers:

**Layer 1 — Service worker prompt**: Workbox uses `registerType: 'prompt'` (no automatic reload). When a new SW is waiting, a dismissable toast appears: "Update available — Refresh / Later". An hourly `registration.update()` poll catches cases where the user has the app open for hours.

**Layer 2 — Server-controlled version tier**: the BFF exposes `GET /api/app/version-check?version=X.Y.Z` which returns an `updateLevel`:

| Tier | Behaviour |
|---|---|
| `none` | No action |
| `optional` | Standard SW toast |
| `recommended` | Persistent dismissable banner |
| `forced` | Full-screen gate, authenticated tree does not render |

The client polls on boot and every 5 minutes. Version headers (`X-Min-Client-Version`, `X-Latest-Client-Version`) on every API response allow immediate tier bumps between polls.

**Fail-open with a max-staleness guardrail**: transport errors (network or 5xx) are treated as `none` so an ops outage cannot lock users out. However, if the last successful version check is older than `MAX_STALENESS_MS` (default 24 hours, configurable via `VITE_MAX_STALENESS_MS`), the client shows a "Cannot verify app version — connect to a network and retry" screen. This closes the attack where a network-positioned adversary blocks only the version-check endpoint to pin users on a vulnerable old build indefinitely.

The 24-hour default is banking-conservative. For stokvel users in low-connectivity rural South Africa, 72 hours may be more appropriate — tune `VITE_MAX_STALENESS_MS` to match the deployment's threat model.

**Kill switch location**: `apps/stokvel-api/src/config/versions.ts`. This is a *soft* switch — it requires a BFF redeploy to take effect. It is not an instant kill. A production version would back this with a feature-flag service or a runtime-mutable config endpoint. Reserve `forced` for genuine cause: security fixes, compliance, breaking API changes, critical correctness bugs. Do not use it for routine releases.

## Security

**Content Security Policy**: the BFF sets a strict CSP on every response. No `'unsafe-inline'` in script-src — Tailwind compiles to a static stylesheet, and Vite's inline bootstrap script is hashed. A `report-to /api/csp-report` directive sends violation reports to the BFF for structured logging. Without this signal, XSS probing is silent. The CSP rationale: the session AES key is JS-reachable in memory, so a strict CSP is the primary defence against XSS exfiltration.

**Login constant-time, identical-shape**: every failed login response — wrong PIN, unknown phone, rate-limited, internal error — returns the same HTTP status (401), the same JSON body (`{ "error": "invalid_credentials" }`), and is padded to ~250ms before responding. This prevents timing-based phone enumeration and user-existence probing.

**Rate limiting** (demo-grade in-memory; production would use Redis or a WAF):
- Per phone: 5 failed attempts / 15 minutes
- Per IP (CGNAT-aware): 200 failed attempts / 15 minutes
- Both checked; the strictest applies. Returns 429 with `Retry-After` only when the per-phone bucket trips.

**CSRF**: `SameSite=Lax` + POST-only state mutations. A double-submit cookie token is future hardening.

**UA fingerprint binding**: at login, the session records a SHA-256 hash of a stable UA subset (`osFamily + browserEngineName + browserEngineMajorVersion`). Every subsequent request verifies the incoming fingerprint. A mismatch immediately invalidates the session. The stable subset (not the full UA string) is used because Android Chrome auto-updates mid-session and changes the full UA string.

**Session timeouts**: 15-minute idle, 12-hour absolute.

**SW integrity**: service worker integrity is delegated to TLS and same-origin trust. There is no SW-specific signing standard in wide deployment. A CDN compromise can poison the SW, which intercepts every request including login (and the AES key in the response). Mitigations: restrict CDN write access tightly; future deployments should evaluate signed-exchange mechanisms as they mature. This trust model is explicit — do not assume the SW is independently verified.

**Sensitive-field redaction**: all structured log calls pass through `redact()`, which applies a field-name denylist (`pin`, `token`, `key`, `sessionKey`, …) and a value-shape detector (base64 strings ≥43 chars, SA account number patterns). Login and `/api/me` route handlers carry explicit `// SECURITY: never log this body` comments and do not log request bodies.

## CDN deployment

To deploy to a CDN (Netlify, Cloudflare Pages, AWS CloudFront, or similar):

1. Build: `bun run build` (outputs to `apps/stokvel-app/dist/`)
2. Point your CDN at `dist/`
3. Configure cache headers:

```
# index.html and sw.js must never be cached — they must always be fresh
/index.html       → Cache-Control: no-cache, no-store, must-revalidate
/sw.js            → Cache-Control: no-cache, no-store, must-revalidate

# Vite hashes all other asset filenames — safe to cache forever
/assets/*         → Cache-Control: public, max-age=31536000, immutable

# Manifest and icons — short TTL so updates reach devices quickly
/manifest.webmanifest → Cache-Control: public, max-age=86400
/*.png                → Cache-Control: public, max-age=604800
```

Getting `index.html` and `sw.js` wrong is the most common PWA deployment mistake. If they are cached, users will never receive app updates.

**Nginx example:**
```nginx
location = /index.html {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**Cloudflare Pages example** (`_headers` file in `dist/`):
```
/index.html
  Cache-Control: no-cache, no-store, must-revalidate
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

The BFF is a separate Bun process. Deploy it to any platform that runs Bun (Railway, Render, Fly.io). Set `PORT` and `NODE_ENV=production` environment variables.

## Performance budget

Initial JS: ≤200 KB gzipped. Total transfer for first authenticated paint: ≤500 KB gzipped.

The build script (`scripts/check-bundle-size.ts`) fails non-zero if either threshold is exceeded. A bundle analyser report is emitted to `dist/stats.html` after every build for manual diffing.

TanStack Router devtools and React Query devtools are gated by `import.meta.env.DEV` and dynamic-imported — they never appear in the production bundle.

## Testing

```bash
bun test                                    # all tests across the monorepo
bun test packages/validation/__tests__      # Zod schema unit tests (23 tests)
bun test apps/stokvel-api/src/__tests__     # version-guard + contribution POST (16 tests)
```

**Validation schemas** (23 tests): `LoginSchema` phone regex edge cases (length, prefix, non-digits), PIN digit/length rules; `ContributionCreateSchema` UUID memberId, amount sign/type/int constraints, YYYY-MM month format boundaries.

**Version-guard tier logic** (10 tests): `deriveUpdateLevel()` covering all tier transitions (forced below minVersion, optional between min and latest, none at/above latest) and all `globalOverride` values.

**Contribution POST integration** (6 tests): happy path 201 with store persistence, 422 validation failure (negative amount, invalid month), 400 malformed JSON, 401 no session cookie. Uses the real auth middleware with a manually seeded session and a fixed UA fingerprint — not a mock.

## Localisation readiness

All user-facing strings live in `apps/stokvel-app/src/copy/en.ts`. No string literals appear in components — components import from `copy`. The shape is feature-grouped (`copy.dashboard.balanceTitle`, `copy.contributions.offlineDisabledMessage`) and fully typed — a misspelt key fails the build.

Placeholder interpolation (`{name}`-style) and pluralisation (`{ one, other }` forms) are supported from day one. All dates, numbers, and currency amounts go through `packages/utils` formatters, which accept a locale parameter.

South Africa has 11 official languages. This build ships English only. The copy module structure is drop-in compatible with `react-i18next` / `formatjs` — the upgrade path is: add a locale provider, replace the `copy` import with a `useCopy()` hook, translate `en.ts` to additional locale files.

## Icons

Icons are generated from `apps/stokvel-app/public/icon.svg`:

```bash
bun run --cwd apps/stokvel-app generate-icons
```

This requires `@resvg/resvg-js` (already in devDependencies). The script generates `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, and `icon-180.png` in `public/`. Re-run whenever `icon.svg` changes.
