# Deferred review items

Findings from the codebase review on **2026-05-07** that we explicitly
decided to defer. Picked-up items get crossed out with a link to the
fixing commit.

## Real bugs / correctness — DO BEFORE PROD-LIKE DEMO

### Production PWA has no CSP
**Where:** `infrastructure/modules/static-site/main.tf:136-158`

The CloudFront response-headers policy sets HSTS, X-Content-Type-Options,
frame-options, and referrer-policy, but **no CSP**. The BFF's CSP
middleware applies to API responses, which the browser never renders as
documents — the PWA shell ships with zero CSP.

**Fix:** add a `content_security_policy` block to the response-headers
policy mirroring the prod CSP from `apps/stokvel-api/src/middleware/security-headers.ts`.
Hash the Vite bootstrap script at build time (CLAUDE.md prescribes this).

### CSP `report-to` is broken (no `Reporting-Endpoints` header)
**Where:** `apps/stokvel-api/src/middleware/security-headers.ts:15`

Prod CSP includes `report-to /api/csp-report;` but no `Reporting-Endpoints`
response header is set. Browsers silently ignore `report-to` in this
state.

**Fix:** set `Reporting-Endpoints: csp-endpoint="/api/csp-report"` and use
`report-to csp-endpoint`, or fall back to the still-supported
`report-uri /api/csp-report`.

### Login rate-limit defeats constant-time guarantee
**Where:** `apps/stokvel-api/src/middleware/rate-limit.ts:67-89`,
`apps/stokvel-api/src/routes/auth.ts:44-100`

Rate-limited responses return in <1ms; wrong-PIN responses pad to ~250ms.
The timing diff lets an attacker tell "you're being throttled" from "your
guess was wrong" — defeats CLAUDE.md's identical-shape requirement.

**Fix:** wrap the rate-limit middleware response in the same
`constantTime` pad used by the auth route, OR move the rate-limit check
inside the route's `constantTime()` wrapper.

### CloudFront isn't sending `Cache-Control: no-cache` for index.html / sw.js
**Where:** `infrastructure/modules/static-site/main.tf:93-113`

The no-cache *cache policy* tells CloudFront not to cache, but no
`Cache-Control` *response header* reaches the browser. Corporate proxies
+ browser disk cache can poison the PWA-update path.

**Fix:** add a `custom_headers_config` to the response-headers policy (or
a second policy attached only to `/index.html`, `/sw.js`,
`/manifest.webmanifest`) emitting `Cache-Control: no-cache, must-revalidate`.

### Empty / missing User-Agent silently bypasses UA-binding
**Where:** `apps/stokvel-api/src/middleware/auth.ts:45`,
`apps/stokvel-api/src/routes/auth.ts:75`

`computeUaFingerprint(c.req.header('user-agent') ?? '')` — an attacker
replaying a stolen cookie with no UA gets the same fingerprint as a no-UA
login. Defeats the binding.

**Fix:** refuse login (and refuse middleware passage) when UA is missing.
Log `ua_missing` and return 401.

### `/api/me` 404 vs 401 leaks valid-session-but-no-user
**Where:** `apps/stokvel-api/src/routes/me.ts:16`

Lets an observer distinguish "session-valid-but-user-purged" from
"session-invalid". Minor on its own; matters because /api/me is the
session-resume probe.

**Fix:** return 401 with the standard invalid-shape body when member
not found, and destroy the session.

### `secrets.ts` swallows `InvalidParameters`
**Where:** `apps/stokvel-api/src/lib/secrets.ts:42-46`

A typo in `*_PARAM` env var names → SSM returns the bad name in
`InvalidParameters`, the loader doesn't write to `process.env`, and
`lambda.ts` throws "DATABASE_URL not set after SSM load" with no clue why.

**Fix:** log `res.InvalidParameters` at warn level before returning.

### `pg` is bundled into the Lambda artifact
**Where:** `packages/db/src/index.ts:1-4`

Both `pg` and `@neondatabase/serverless` are imported at module top, so
`bun build --target node` drags `pg` (with native bindings) into the zip
even though the Neon path is the only one taken in Lambda.

**Fix:** split `createDb` into two entry points (`db/neon.ts`, `db/pg.ts`)
and have `lambda.ts` import only the Neon one. Or mark `pg` external in
the bun build invocation and confirm Lambda's runtime ships it.

### `check-terraform.sh` references terragrunt
**Where:** `scripts/check-terraform.sh:57, 110-124`

The repo deliberately ditched Terragrunt; this script still has a
`terragrunt hclvalidate` block that prints "skipping" when the binary is
missing. CI claiming "all checks passed" while skipping env validation
is misleading.

**Fix:** drop the terragrunt block; run `terraform validate` directly in
each `infrastructure/envs/*` (now plain TF).

## Test gaps

### Zero auth tests
The most security-sensitive surface in the codebase has no unit or
integration coverage:

- Login success
- Login PIN failure
- Rate-limit trip per phone
- Rate-limit trip per IP
- UA-fingerprint mismatch invalidating a session
- Idle / absolute-timeout invalidation
- Logout clears server record + cookie

### Repository constraint behaviour
- Duplicate phone insert (uniqueness constraint)
- Missing-FK contribution insert (referential integrity)
- `findBalance` aggregation with no contributions

### `secrets.ts` cold-start path
Worth a fixture-based test using the AWS SDK mock to lock in the env-var
rewrite contract.

## Refactors (low priority)

### Repository factories return inferred types
Routes type their constructor args as `ReturnType<typeof
createStokvelRepository>`, which couples every route to the
implementation. Declaring a `StokvelRepository` interface in the
repository module would let tests pass a hand-rolled impl. Worth doing
**only when** a real test seam needs it.

### `csp-report.ts` rate-limiter is inline; `rate-limit.ts` factored
Either inline both or factor both. Currently asymmetric.

## UX polish

### Specialise update UX for installed PWA vs browser tab
Same code, same update mechanism — but the user expectations differ.
Browser tab can refresh easily, so a subtle toast suffices. Installed
PWA users can't easily refresh and may have the app backgrounded for
days, so a more prominent persistent banner is warranted.

Detect with:
```ts
const isInstalledPWA = window.matchMedia('(display-mode: standalone)').matches
                    || (navigator as { standalone?: boolean }).standalone === true;
```

The forced gate stays identical in both contexts (security override).
Difference is for the optional/recommended tiers + the SW
"new content available" prompt.

### Centre the forced-update gate properly
Today the gate renders in the bottom-right of the viewport instead of
centred (see `ForcedUpdateGate.tsx` — the flexbox parent is missing
something). Cosmetic but jarring on first impression.

### Test the upgrade flow on real installed PWAs
30-min QA pass on a real iOS Safari (Add to Home Screen) and Android
Chrome (Install App) to confirm `forceUpdate()` actually re-fetches the
new bundle and the gate clears. Should work — but real-device-only
quirks happen.
