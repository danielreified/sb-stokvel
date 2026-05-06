# Docs

Reading order if you're new to the codebase:

1. [Decisions log](decisions.md) — the 15 load-bearing architectural
   choices, each with context, alternatives, and consequences. Start
   here if you want to know *why* the code looks the way it does.
2. [Persistence + cache architecture](architecture/persistence.md) —
   the deep-dive on how the React Query cache, IndexedDB, and AES
   encryption fit together. Tier model, threat model, key-derivation
   chain, cold-start path, eviction policy.
3. [Security architecture](architecture/security.md) — BFF security
   headers, session model, rate limiting, login response shape, mock
   vs production seams. Cross-references the persistence doc for
   client-side encryption.
4. [Test architecture](architecture/testing.md) — Playwright matrix,
   per-project storage state, Docker rig for visual regression
   determinism. Plus what's deferred (unit tests, contract tests,
   Lighthouse CI).
5. [i18n architecture](architecture/i18n.md) — locale system, the
   `useCopy()` hook, the `Copy` type widening pattern, what's
   deferred (Intl formatters per-locale, RTL).

The decisions log is intentionally cross-cutting. Architecture docs
go deep on a single concern. If you find a load-bearing choice
that isn't in the decisions log, it should be — please add it.
