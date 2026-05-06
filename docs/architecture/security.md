# Security architecture

This document covers the **security boundary**: BFF security headers,
session model, rate limiting, login response shape, and the mock-vs-
production seams.

For the deep-dive on **client-side encryption** (how the AES session key
is wrapped, where it's stored, how the cache is encrypted, the
threat model for key exfiltration), see
[persistence.md](persistence.md). This document references it where
relevant rather than repeating.

---

## What we defend at each layer

| Layer | Threat | Mitigation |
|---|---|---|
| Network | MITM | TLS (HTTPS in prod; mkcert for dev real-device tests) |
| Network | CSRF | `SameSite=Lax` cookie + POST-only state changes |
| Network | Replay from another device | UA-fingerprint binding on the BFF |
| Network | XSS | Strict CSP (no `unsafe-inline` in prod), HttpOnly cookies, AES key never DOM-reachable |
| Session | Brute force PIN online | Layered rate limiter (per-phone, per-IP, global anomaly) |
| Session | Brute force offline | PBKDF2 600k on the wrapping-key derivation |
| Storage | Cold-storage exfil of IDB | Every record AES-GCM encrypted at rest |
| Storage | Tampered IDB blob | AES-GCM auth tag fails decrypt → tamper error surfaced |
| Auth | Forced session extension | 15-min idle + 12h absolute timeouts on the server |
| Auth | Cross-user contamination on shared device | Sign-out wipes the entire `keyval-store` IDB database |

---

## BFF security headers (every response)

Configured in `apps/stokvel-api/src/middleware/security.ts`. Set on
**every** response, including errors.

### CSP

The PWA serves a static bundle, so CSP uses **hashes** for the Vite
inline bootstrap script rather than per-request nonces. Hashes were
chosen over nonces because the PWA is statically hosted (no SSR layer
to inject a fresh nonce per response).

```
default-src 'self';
script-src 'self' 'strict-dynamic' 'sha256-<vite-bootstrap-hash>';
style-src 'self';   /* NO 'unsafe-inline' in prod */
img-src 'self' data:;
connect-src 'self';
worker-src 'self';
manifest-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
frame-src 'none';
report-to /api/csp-report;
```

If SSR is ever introduced (BFF rendering `index.html` per request),
switch to nonces — they're easier to manage when third-party scripts
(Sentry, analytics) get added.

### Other headers

- `Strict-Transport-Security: max-age=31536000; includeSubDomains` —
  HTTPS enforced; matched by mkcert in dev.
- `X-Frame-Options: DENY` — legacy backstop alongside `frame-ancestors 'none'`.
- `X-Content-Type-Options: nosniff` — MIME sniffing off.
- `Referrer-Policy: strict-origin-when-cross-origin` — leak as little as possible.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` —
  deny by default (we don't use any of these).
- `Cache-Control: no-store, private` + `Pragma: no-cache` on every
  authenticated response. Prevents proxies / CDN / browser bfcache
  from caching responses that carry the AES session key.

### CSP report sink

`POST /api/csp-report` accepts violation reports and logs them via the
structured logger. Unauthenticated, **rate-limited per-IP** (50/min)
to prevent log-flooding. Reports past the bucket are dropped silently.

Today the sink only logs. Production would alert on suspicious patterns
(e.g. unexpected script source).

---

## Session model

### Cookie

128-bit random session ID (`crypto.randomUUID()`) stored in an
in-memory `Map<sessionId, Session>` on the BFF. Cookie is **opaque** —
it's meaningless without the server-side session record.

```
sid=<uuid>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200
```

- `HttpOnly` — JS can't read it. Defends against XSS exfil.
- `Secure` — HTTPS only. **In dev/test the flag is conditional**:
  emitted only when the request URL is `https://`. Production gets it;
  http://localhost doesn't (WebKit refuses Secure cookies on localhost
  even though Chromium tolerates them — see
  [testing.md "Real BFF bugs"](testing.md#real-bff-bugs-caught-while-wiring-this-up)).
- `SameSite=Lax` — CSRF defense for top-level navigation.
- `Max-Age=43200` — 12 hours.

### Session record

Server-side, per session:

```ts
interface Session {
  userId: string;
  createdAt: number;
  lastSeenAt: number;
  uaFingerprint: string;
}
```

### Idle + absolute timeouts

Auth middleware enforces:

- **Idle timeout: 15 min.** Each request bumps `lastSeenAt`. If the
  delta exceeds 15 min, session is destroyed and the request 401s.
- **Absolute timeout: 12 hours.** Past `createdAt + 12h`, session is
  destroyed regardless of activity.

### UA-fingerprint binding

At session creation, the BFF computes
`uaFingerprint = sha256(osFamily + browserEngineName + browserEngineMajorVersion)`
using `ua-parser-js` and stores it with the session. Every subsequent
request recomputes the fingerprint and compares.

**Why a stable subset instead of the full UA string?** Android Chrome
auto-updates mid-session and changes the full UA. Requiring an exact
match would self-DOS legitimate users every Chrome release. Requiring
nothing loses cookie-replay-from-different-device defence. The
sha-of-stable-bits approach is the middle ground.

Mismatch → session destroyed → 401. The PWA's API client surfaces
this and routes to `/login?reason=expired`.

### Login rotates the session

A successful login generates a new session ID and replaces the old
one. Even if an old cookie was leaked, it's invalid the moment the
real user logs in again.

---

## Login rate limiting

Three layered token-buckets evaluated on every `POST /api/auth/login`,
configured in `apps/stokvel-api/src/middleware/rate-limit.ts`:

| Bucket | Threshold | Window | Targets |
|---|---|---|---|
| Per-phone | 5 failed attempts | 15 min sliding | Account-targeted brute force |
| Per-IP | 200 failed attempts | 15 min sliding | Scripted attacks from one source |
| Global anomaly | >10× rolling-hour baseline | 1 min slowdown | Credential-stuffing waves |

All three checked on every request; the strictest applies. **Only
failed attempts increment the buckets** — a successful login doesn't
consume the user's failure budget. (This was a real bug we found via
e2e tests; see [testing.md](testing.md#real-bff-bugs-caught-while-wiring-this-up).)

### Why per-IP is permissive

South African mobile networks are CGNAT — thousands of legitimate
users share an exit IP. A tight per-IP threshold would DOS carrier
users on credential-stuffing waves. 200/15-min catches scripted attacks
from one source without blocking legitimate Vodacom/MTN traffic.

### Failure response shape

Rate-limit trips return identical-shape responses to "wrong PIN" /
"no such phone" / "session creation failed". Same HTTP 401, same JSON
body (`{error: 'invalid_credentials'}`), same constant-time padding
(~250 ms). Documented in code with
`// SECURITY: constant-time, identical-shape — do not differentiate`.

The only exception: when per-phone trips, the `Retry-After` header is
set with the seconds-until-window-resets. That's a tiny information
leak — an attacker can probe to learn whether they hit the per-phone
bucket vs another failure mode — but it's the right tradeoff for UX
(legitimate users see "try again in N minutes" guidance).

---

## Constant-time identical-shape login responses

Every failed login (wrong PIN, no such phone, rate-limited, session
creation failed) returns:

- Same HTTP **status** (401)
- Same JSON **body shape** (`{error: 'invalid_credentials'}`)
- **Constant time** (~250 ms via `setTimeout` after the cheapest path)

Implementation in `apps/stokvel-api/src/routes/auth.ts`:

```ts
const CONSTANT_RESPONSE_MS = 250;
async function constantTime<T>(fn: () => Promise<T>): Promise<T> {
  const [result] = await Promise.all([
    fn(),
    new Promise<void>((resolve) => setTimeout(resolve, CONSTANT_RESPONSE_MS)),
  ]);
  return result;
}
```

Without this, the time difference between "user lookup failed early"
and "PIN comparison failed late" is a side channel for user enumeration.
Constant-time padding closes that channel.

The `// SECURITY:` comment in the route handler enforces the rule for
future edits — don't differentiate.

---

## Logging + redaction

The structured logger
(`apps/stokvel-api/src/lib/logger.ts`,
`apps/stokvel-app/src/lib/logger.ts`) has two redaction layers:

### Field-name denylist

```
['pin', 'password', 'token', 'key', 'encryptionKey', 'sessionKey',
 'aesKey', 'dek', 'Authorization', 'Cookie']
```

Any object property matching one of these is replaced with
`'[redacted]'` before logging.

### Value-shape detection

Catches the case where a future implementer names the secret field
something we didn't predict:

- Any string matching `/^[A-Za-z0-9+/=_-]{43,}$/` (base64ish, 32+
  bytes) — looks like a key, redact regardless of field name.
- Any string matching the SA account number shape (10-11 digits
  with optional spaces) — redact.

### Hard route guards

Login + `/api/me` route handlers carry an explicit
`// SECURITY: never log this body` comment **and** a per-route logger
config that disables body logging entirely. Belt and braces — don't
rely solely on the redact-helper logic.

The lesson: one slipped `console.log(req.body)` in dev = the AES key
leaks to stdout forever. Defence in depth means the secrets never get
the chance to reach the logging path.

---

## Service worker trust model

The SW intercepts every request including `POST /api/auth/login` and
`GET /api/me`. A poisoned SW can exfiltrate the PIN at entry and the
AES key on its way out.

We **don't** sign the SW independently — there's no widely-deployed
standard for SW signing. We rely on:

- TLS for transport integrity
- Same-origin trust (the SW comes from our origin)
- CDN write access tightly restricted

This means: **a CDN compromise is fatal to our security model.** It's
named explicitly in the threat model, not glossed over.

Production hardening:

- Subresource Integrity (SRI) on every script the SW imports.
- Signed-exchange or signed-precache-manifest mechanisms when widely
  supported.
- Per-deploy HMAC pinning of the precache manifest.

The README's Data Sensitivity section calls this out so future
maintainers know the trust assumption.

---

## App-update kill switch (banking-grade)

Server-controlled tier: `none | optional | recommended | forced`.

- `optional` — standard "update available" toast.
- `recommended` — persistent dismissable banner.
- `forced` — full-screen non-dismissable gate; authenticated tree
  doesn't render until updated.

The version-guard
(`apps/stokvel-app/src/lib/version-guard/`,
`apps/stokvel-api/src/config/versions.ts`):

- Polls `GET /api/app/version-check?version=X.Y.Z` on boot + every 5 min.
- Persists `{updateLevel, lastSuccessfulCheckAt}` in `localStorage`
  under `seyva-version-guard`.
- Fails open on transport errors (treats as `none` for the current
  poll) so an ops outage doesn't lock users out.

### Max-staleness gate

If `now - lastSuccessfulCheckAt > MAX_STALENESS_MS`, the client
**refuses** to render the authenticated tree regardless of stored
`updateLevel`. Shows "Couldn't verify app version — connect to a
network and try again."

This closes the attack where a network-positioned adversary
black-holes only `/api/app/version-check` to keep a vulnerable old
client running indefinitely.

`MAX_STALENESS_MS` is configurable
(`apps/stokvel-app/src/config/version-guard.ts`):
- **Default 24h** (banking-grade conservatism, demo target).
- **72h** is more appropriate for real-world rural users with
  legitimate weekend off-grid time.

### Tamper resistance

`localStorage` is JS-writable, so any XSS or DevTools paste can flip
`forced` → `none`. Mitigation:

- **Today (demo):** the max-staleness gate is the primary defence.
- **Production hardening:** version-check responses should be
  HMAC-signed server-side with a per-deploy secret; client verifies
  the signature before trusting any cached tier.

This is documented as a deferred hardening item.

---

## Idle-lock + PIN-wrapped key

The client-side companion to the server's idle timeout. After 60s of
inactivity (configurable in `_authed.tsx`), the in-memory AES session
key is zeroed and the user must re-enter their PIN to unwrap a
PBKDF2-wrapped blob from IndexedDB.

This is the offline counterpart to the server-side session timeout —
even if the user is unreachable to the server, their cached data
becomes inaccessible after the idle window.

Full design + threat model in
[persistence.md](persistence.md#key-derivation-chain).

---

## Mock vs production seams

This is a demo. Several security boundaries are mocked. Each is
labelled in code with a comment:

| Mocked | Where | Production replacement |
|---|---|---|
| In-memory session store | `apps/stokvel-api/src/repository/session.ts` | Redis / database with proper atomic ops |
| In-memory rate-limit buckets | `apps/stokvel-api/src/middleware/rate-limit.ts` | Redis token buckets, distributed across regions |
| Demo PIN (`1234`) | `apps/stokvel-api/src/store/seed.ts` | Real PIN per user, hashed at rest |
| `// DEMO: accepts any credentials` | `apps/stokvel-api/src/routes/auth.ts` | Real password/PIN verification, MFA |
| Trust the SW | implicit | Signed precache, SRI, signed-exchange |
| HMAC-signed version-check | not implemented | Per-deploy secret signs each response |

The README's "Data Sensitivity" section lists these explicitly so the
threat model is honest.

---

## Production hardening backlog

In approximate priority order:

1. **WebAuthn / passkey** for biometric-gated wrapping key. The PIN
   becomes a fallback path; primary unlock binds to the device's
   secure enclave.
2. **HMAC-signed version-check** responses with per-deploy secret —
   prevents `localStorage` tampering of the update tier.
3. **Signed-exchange or signed precache manifest** for the service
   worker — closes the CDN-compromise attack.
4. **Subresource Integrity (SRI)** on every loaded asset.
5. **Out-of-band PIN reset** flow (SMS / email confirmation).
6. **Server-side session storage** migrated from in-memory `Map` to
   Redis with proper atomic ops.
7. **Anomaly-based global rate limit** beyond per-phone / per-IP.
8. **Sentry / Datadog wiring** at the existing logger seam.
9. **Audit log** — immutable record of all user actions (POPIA + SA
   banking regs require it).
10. **POPIA compliance** — data export, right-to-erasure, consent.

Each is a deliberate defer. The architecture has the **seam** — the
hooks where production code would plug in — but the demo doesn't
ship them.
