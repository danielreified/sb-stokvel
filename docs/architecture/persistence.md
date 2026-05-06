# Persistence and cache architecture

This document is the source of truth for how the Seyva PWA persists data,
encrypts it, and decides when to read from cache versus the network. It
explains both **what we built** and **what production would add** — the
gaps are deliberate and called out.

The audience is anyone reviewing the code who wants to know *why* it looks
the way it does, and whether we considered the alternatives. Where we
chose the simpler path, the rejected option is named.

---

## Constraints that shaped every decision

The product brief is "low-end Android PWA on expensive data." That sentence
drives the entire architecture:

- **Bundle budget:** ≤200 KB initial JS / ≤500 KB total transfer for first
  authenticated paint. Every kilobyte costs the user money.
- **Memory budget:** target devices have 1–2 GB RAM, of which the browser
  tab gets a few hundred MB shared with other tabs and the OS.
- **Network is unreliable:** rural South Africa has dead zones, dropped
  connections, and metered weekday-vs-weekend data plans. Offline is a
  first-class state, not an error.
- **Threat surface is broad:** PWAs run in a browser tab, share storage
  with other origins, and have no Keychain/Keystore equivalent. Anything
  on disk must be assumed exfiltratable.

Choices that look "less than production-grade" usually defend the bundle
budget or the offline-first promise. They are explicit, not accidental.

---

## What gets cached, where, and why

There are four storage layers in the app. Each solves a different problem.

| Layer | Mechanism | Survives reload? | Encrypted? | Cleared on sign-out? |
|---|---|---|---|---|
| Service Worker (Workbox) | Cache Storage API — app shell only | Yes, until SW updates | n/a (static assets) | No (login screen needs to load offline) |
| TanStack Query | In-memory JS heap | No | n/a (RAM) | n/a (RAM) |
| `idbCache` (this layer) | IndexedDB via `idb-keyval` | Yes | **Yes, AES-GCM** | Yes |
| PIN-wrapped key | IndexedDB via `idb-keyval` | Yes | Yes (wrapped, not plaintext key) | Yes |
| `localStorage` | localStorage | Yes | No | Locale + version-guard only — non-sensitive |

The two persistence layers (`idbCache`, PIN-wrapped key) are the focus of
this document.

---

## Encryption: everything in IDB is encrypted

The cache is **single-tier**. Every record written to `idbCache` is
AES-GCM encrypted at the record level. There is no "plain" tier.

### Why not a multi-tier model

An earlier version split queries into Tier 1 (plain) for stokvel
config + member roster, Tier 2 (encrypted) for balance + contributions, and
Tier 3 (never persisted) for `me`. The argument for Tier 1 was cold-start
UX — if the AES key is not in memory, encrypted data is unreadable, but
plain data could still render the dashboard skeleton.

That argument dissolved once the PIN-wrap path was added. The new boot
sequence ensures the AES key is always restored *before* any IDB read,
which means the app never renders cached data without the key in memory.
Tier 1 stopped earning its complexity. We removed it.

What we get from a single tier:

- No "did I correctly classify members as plain?" misclassification bugs
  (member phone numbers were originally Tier 1 — phone numbers are PII;
  the auditor would catch that).
- No HMAC layer needed for tamper detection on plain entries — AES-GCM's
  auth tag gives integrity for free.
- Smaller persister module (no peek-at-query-keys logic to decide
  encryption per-blob).
- One rule, simply stated: "everything at rest is encrypted."

### Performance check

AES-GCM is hardware-accelerated on every modern phone. Throughput on a
2017-vintage Android is roughly 1 GB/s. The entire cache is ~50 KB of
JSON. Encrypting or decrypting it costs well under 1 ms. There is no
visible UX impact.

Storage overhead is 28 bytes per record (12-byte IV + 16-byte auth tag).
Negligible.

### What's still excluded from IDB entirely

`me` (the auth state, including the base64 sessionKey returned by the
BFF) is **never written to IDB**, encrypted or otherwise. This is the
last surviving tier-3 rule, enforced by the queryFn returning early
without calling `idbCache.write` for this query key.

---

## Key-derivation chain

```
              ┌───────────────────────────────────────────────┐
              │  user enters 4-digit PIN at login or unlock   │
              └────────────────────┬──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  PBKDF2-SHA256, 600k iters,  │
                    │   per-session 16-byte salt   │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │  wrapping key  │   (AES-256, derived; never persisted)
                          └────────┬───────┘
                                   │
                          AES-GCM unwraps
                                   │
                                   ▼
              ┌────────────────────────────────────────┐
              │   session key (AES-256, in memory)     │
              │   server-issued at login,              │
              │   re-issued on /api/me session-resume  │
              └────────────────────┬───────────────────┘
                                   │
                          AES-GCM encrypts/decrypts
                                   │
                                   ▼
                           ┌──────────────┐
                           │  idbCache    │
                           │  records     │
                           └──────────────┘
```

The wrapped session key + salt live in IDB under `seyva-wrapped-session-key`
as a `{ wrapped: base64, salt: base64 }` blob. The session key itself
exists only as a `CryptoKey` in module-scoped memory inside `keyStore`.
Sign-out wipes both via `indexedDB.deleteDatabase('keyval-store')`.

### Why PBKDF2, not Argon2

Web Crypto's built-in primitives include PBKDF2 but not Argon2. Argon2
would require a WASM bundle hit (~30 KB), and the browser environment
makes it less effective anyway — there's no enclave to bind it to. The
brute-force resistance gain over 600k-iteration PBKDF2 is marginal in
this threat model. We took the no-bundle option.

### Why 600k iterations

OWASP's 2023 guidance for PBKDF2-SHA256 is 600k+ iterations. It costs
~250 ms on a 2017 Android, which is the slowest target we care about.
That's tolerable on the unlock path (user just typed a PIN; brief delay
is expected). On a desktop it's well under 50 ms.

---

## Threat model

What we defend against, what we don't, and why.

### Covered

| Threat | Mitigation |
|---|---|
| Lost/stolen device with locked browser | PIN required to unwrap session key; 4-digit PIN gives ~10k brute-force space, raised to ~10s of CPU-years by PBKDF2 600k |
| Tampered IDB blob | AES-GCM auth tag on every record; tamper → decrypt fails → treated as cache miss |
| Session-cookie replay from a different device | UA-fingerprint binding on the BFF (sha256 of os + engine + major version) |
| Network-blocked update channel | `MAX_STALENESS_MS` gate refuses to render the authed tree if `/api/app/version-check` hasn't succeeded recently |
| Cross-user contamination on shared device | Sign-out wipes the entire `keyval-store` IDB database, not just selected keys |
| XSS exfiltrating session cookie | `HttpOnly` flag — cookie not JS-readable |
| XSS exfiltrating AES key from RAM | Strict CSP (no `'unsafe-inline'` in prod), per CLAUDE.md |
| Cold-storage IDB exfiltration | Everything at rest is encrypted; key is PIN-wrapped, key never on disk in plaintext |

### Not covered (deliberately, with rationale)

| Threat | Why we don't | What production would add |
|---|---|---|
| Sophisticated offline brute-force of the 4-digit PIN | A determined attacker with the encrypted blob can try 10k PINs against PBKDF2 in ~10s of CPU-hours. PBKDF2 raises the cost but doesn't eliminate it. | WebAuthn/passkey-bound wrapping key — the wrapping key lives in the device's secure enclave and never reaches the JS heap. |
| Compromised service worker | The SW intercepts every request including `/api/auth/login`, so a poisoned SW can exfiltrate the PIN at entry. We rely on TLS + same-origin trust, no SW signing. | Signed-exchange or signed-precache-manifest mechanisms when widely supported. |
| Compromised CDN | Same-origin trust assumes the CDN is honest. | SRI on every script + per-deploy HMAC pinning of the manifest. |
| localStorage tampering of `versionGuard.updateLevel` | An attacker with XSS or DevTools can flip `forced` → `none`. | HMAC-signed version-check responses, verified before trust. |
| Forgotten PIN | No recovery path in this build — sign-out and re-login is the workaround. | Out-of-band PIN reset flow (SMS / email confirmation). |

These items are documented in commit messages where relevant and listed
in the README's Data Sensitivity section.

---

## Cache strategy: network-first with cache fallback

When a query subscribes, the order is:

1. TanStack Query checks its in-memory cache. Fresh enough per `staleTime`?
   Return immediately, no network call.
2. Otherwise, run `queryFn`. The queryFn does:
   1. Try the network.
   2. On success: write through to `idbCache`, return the fresh result.
   3. On failure: read from `idbCache`. If a hit, return it. If not, throw.

In code:

```ts
queryFn: async () => {
  try {
    const fresh = await api.stokvel.balance(id);
    await idbCache.write(`balance:${id}`, fresh, { ttl: FIVE_MIN });
    return fresh;
  } catch (err) {
    const cached = await idbCache.read<Balance>(`balance:${id}`);
    if (cached) return cached.data;
    throw err;
  }
}
```

### Behaviours by scenario

| Scenario | Result |
|---|---|
| In-session navigation within `staleTime` | TanStack Query hit, instant render, **zero network**, zero IDB |
| Page refresh while online | TQ empty → queryFn → network success → writes through to IDB → returns fresh; user sees ~200 ms spinner |
| Page refresh while offline | TQ empty → queryFn → network fails → IDB hit → returns last-known; offline banner visible |
| Cold start, never been online | queryFn fails, no IDB hit, error state — "couldn't load" UI |
| Mutation success (`POST /contributions`) | Affected queries invalidated; next subscribe re-runs queryFn → network → write-through |
| Mutation while offline | Mutation rejected up front (per CLAUDE.md "auth + contribution POST: Network Only"). No optimistic, no queue. |

### Why not stale-while-revalidate (SWR)

SWR returns the cached value instantly *and* fires a background refetch
that swaps in the fresh value when it arrives. The selling point is
no-spinner UX.

For banking we deliberately don't want it. SWR can show a stale balance
("R 11,500") for half a second, then update to the fresh value
("R 12,000"). For an article body that's a perfectly fine UX; for a
money figure it looks broken and feels slightly dishonest.

Native banking apps overwhelmingly use network-first and accept the
short spinner on cold paint. We match that.

### Why not always-network

It's the most conservative pattern but ignores the offline brief. The
moment the user goes offline, an always-network app is dead. Cache
fallback is what makes the app usable on the rural-South-Africa side of
the use case.

---

## Memory model

The persister we replaced (`@tanstack/react-query-persist-client`)
loaded the entire IDB blob into RAM at boot. For a banking app at
scale (years of contribution history, hundreds of records) that quickly
becomes prohibitive on a 1 GB device.

The new pattern is **lazy hydration per query**:

- IDB is the source of persisted truth, on disk.
- TanStack Query's in-memory cache is a thin window over it.
- Each query loads from IDB only when a component subscribes.
- After last unmount + `gcTime`, TQ drops the data from RAM. IDB
  still has it; next subscribe re-reads.

This is the same pattern native banking apps use with SQLite + LRU
view caches: persistent storage on disk, transient view state in
memory.

### `gcTime` per query

The 24-hour default is too long for a cheap-Android target. Tuned per
query type:

| Query | `staleTime` | `gcTime` |
|---|---|---|
| `me` | 0 | 0 (never cached, never held) |
| `stokvel` | 1 hour | 1 hour |
| `members` | 1 hour | 1 hour |
| `balance` | 5 min | 10 min |
| `contributions` | 5 min | 10 min |

Small, frequently-changing data drops from RAM in 10 minutes. Stable
config sits longer because the cost of re-reading IDB is non-zero
(decrypt, parse). The persisted IDB copy has its own TTL via the
eviction policy below.

### `navigator.deviceMemory` hint

Browsers expose `navigator.deviceMemory` (in GB, rounded to a power of
two). On detected sub-1 GB devices, the cache budget tightens:

| Setting | Default | `< 1 GB` device |
|---|---|---|
| IDB size budget | 5 MB | 1 MB |
| `gcTime` for transient queries | 10 min | 2 min |

Not bulletproof — Safari doesn't expose it — but useful where it does.

---

## Eviction: TTL + cold-tail + size budget

A maintenance pass evicts entries that fail any of:

1. **Stale beyond TTL** — entry's `cachedAt + ttl < now`.
2. **Cold tail** — entry's `cachedAt > 30 days ago`, drop unconditionally.
3. **Cache over budget** — sort by `cachedAt` ascending, drop oldest
   non-persistent until under budget. If still over budget after all
   non-persistent entries are gone, fall through and drop oldest
   persistent entries (preferable to QuotaExceededError on next write).

We sort on `cachedAt` rather than tracking a separate `lastAccessed`
timestamp. True LRU would need atomic read-modify-write on every cache
hit — a race-prone pattern in IDB without transactions. The simpler
"oldest written first" approximation is fine because the hot set is
marked `persistent: true` and protected from size-based eviction
unless the cache is dangerously over budget.

The "hot set" — `stokvel`, `members`, `balance`, `contributions`
(current 6 months) — is marked `persistent: true`. They get TTL but not
ordinary size-budget eviction.

The pass runs:

- Once at app boot, after the PIN unwrap restores the key.
- Every hour while the tab is open.
- After any large write (e.g. an infinite-query page fetch).

Sign-out continues to bypass all of this with a full
`indexedDB.deleteDatabase('keyval-store')` for a clean wipe.

---

## Cold-start

The trickiest path in the system: app boot when there's an IDB cache
but no in-memory key.

Today (pre-this-work) the flow is:

```
boot
  → /api/me online? → restore session key from server payload, render
                    → /api/me offline? → redirect to /login
```

Encrypted IDB data is unreadable when offline because the in-memory key
is gone. This is the cold-start gap we want to close.

After this work:

```
boot
  → does IDB have a wrapped-session-key blob?
       no  → /api/me online flow as before
       yes → render PinLockScreen as a top-level gate
             → user enters PIN
                  → unwrap blob → restore session key into keyStore
                  → run idbCache.evict() (TTL/LRU sweep)
                  → render the app, queries hit cache + idbCache
                  → on next online window, /api/me re-issues
                    a fresh session key and re-wraps it
```

The `_authed.tsx` route's `beforeLoad` no longer hard-redirects to
`/login` when `/api/me` fails — if the wrapped blob exists, it shows
the lock instead. Sign-out is still the fallback for forgotten PIN.

---

## Mutations

Mutations are **network-only**. There is no offline queue, no optimistic
update, no eventual reconciliation.

This is per CLAUDE.md: "Auth + contribution POST: Network Only. These
never touch any cache. Money is high-stakes; we don't fake success."

The contribution form disables submit when `navigator.onLine` is false
and shows a clear "you need a connection to send money" message.

### Why no offline queue

Banking primitives must be either succeeded or failed, not "queued".
The user must see one of:

- "It worked" — server confirmed.
- "It didn't work, here's why" — server rejected (rate-limit, balance,
  whatever).
- "We can't reach the server, try again when you're connected."

A queued-mutation pattern creates a fourth state — "we tried once, will
try again, we'll let you know." For deposits and transfers, this is
where banking-app trust dies. Don't do it.

---

## What we rejected, and why

For the architect-style review: alternatives we considered and the
reason we passed.

### `sqlite-wasm` instead of IDB

- Pro: real SQL, indexed lookups, joins, query builder ergonomics.
- Con: 600 KB+ bundle hit. Our budget is 200 KB. Adding it would blow
  the budget by 3x and contradict the demo's whole point.
- Verdict: stay on IDB. Access patterns are key-lookup or one
  filtered list — IDB composite indexes give the same query shape at
  zero JS cost. If data shape ever needed real joins or ad-hoc filters,
  sqlite-wasm is the upgrade path.

### Argon2 for key derivation

- Pro: stronger memory-hardness, more resistant to GPU brute-force.
- Con: Web Crypto doesn't include it; would need a WASM bundle.
- Verdict: PBKDF2-SHA256 at 600k iterations. Not as strong but
  bundle-free and OWASP-current.

### WebAuthn-bound wrapping key (now)

- Pro: wrapping key lives in the device secure enclave; brute-force
  becomes practically impossible.
- Con: browser support is patchy on cheap Android (the actual target).
  Adds a complex fallback path for devices without it.
- Verdict: defined as the production hardening path, not implemented
  in this build. The PBKDF2-PIN flow is the demo's approximation.

### Stale-while-revalidate cache strategy

See the cache strategy section above. Banking UX prefers spinner over
flicker.

### Offline mutation queue

See the mutations section. We don't fake success.

### One global IDB blob (today's persister)

- Pro: simple, one entry, one rehydrate.
- Con: whole blob loaded at boot — RAM-heavy. All-or-nothing
  encryption means even non-sensitive entries get encrypted with the
  rest. No per-record eviction.
- Verdict: replace with `idbCache` per-record entries. The complexity
  cost pays for itself in memory + eviction control.

### Native rewrite (React Native + SQLCipher + Keychain)

- Pro: this is what production would actually be. Real secure enclave,
  real SQLite, real biometrics.
- Con: out of scope. The brief is a PWA.
- Verdict: explicitly named in the README as "what production would
  be." This codebase is the PWA-shaped approximation.

---

## Production hardening backlog

Items the demo doesn't implement but a real deploy would:

- WebAuthn-bound wrapping key (replaces PBKDF2-PIN).
- Signed-precache-manifest for the service worker (defends against
  CDN compromise).
- Per-deploy HMAC on `/api/app/version-check` responses (prevents
  localStorage tampering of the update tier).
- Subresource Integrity on every loaded asset.
- Out-of-band PIN reset flow.
- Server-side session storage migrated from in-memory `Map` to Redis
  with proper atomic ops.
- Anomaly-based rate-limit (currently we have per-phone + per-IP, no
  global rate behaviour).
- Sentry / Datadog wiring at the existing logger seam.

Each of these is a tradeoff the demo deliberately deferred. They are
not "missing" — they are the next layer up.
