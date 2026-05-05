/**
 * Max staleness of the version-check result before the client blocks rendering.
 *
 * Default: 24 hours (banking-grade conservatism for the demo).
 * SA deployment recommendation: 72+ hours — many users are legitimately offline on weekends.
 *
 * Tradeoff: stricter = better protection against the network-block attack (attacker black-holes
 * /api/app/version-check to keep a vulnerable client running); looser = better UX for
 * low-connectivity rural users. Tune per deployment. See CLAUDE.md for full rationale.
 */
export const MAX_STALENESS_MS =
  Number(import.meta.env.VITE_MAX_STALENESS_MS) || 24 * 60 * 60 * 1000;
