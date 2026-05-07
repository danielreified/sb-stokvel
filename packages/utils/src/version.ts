import type { UpdateLevel } from '@seyva/types';

/**
 * Compare two semver `MAJOR.MINOR.PATCH[-pre]` strings. Returns
 * -1 (a<b) | 0 (equal) | 1 (a>b).
 *
 * Inline rather than depending on the `semver` npm package because this
 * function is reachable from the PWA's initial bundle (via the version-
 * guard store, which is statically imported by ForcedUpdateGate). The
 * `semver` package is ~13 KB minified — too much to spend on three
 * digit-comparisons. We only ship MAJOR.MINOR.PATCH releases in this
 * project, so the simplified pre-release comparison (lexical, with empty
 * counted as "higher") is sufficient.
 *
 * Tested in version.test.ts.
 */
function compareSemver(a: string, b: string): number {
  const parse = (v: string): { main: number[]; pre: string } => {
    const dashIndex = v.indexOf('-');
    const mainStr = dashIndex === -1 ? v : v.slice(0, dashIndex);
    const pre = dashIndex === -1 ? '' : v.slice(dashIndex + 1);
    return { main: mainStr.split('.').map(Number), pre };
  };

  const pa = parse(a);
  const pb = parse(b);

  for (let i = 0; i < 3; i++) {
    const da = pa.main[i] ?? 0;
    const db = pb.main[i] ?? 0;
    if (da !== db) return da < db ? -1 : 1;
  }

  // Same MAJOR.MINOR.PATCH: per semver, a release > a pre-release of the
  // same version (1.0.0 > 1.0.0-rc.1).
  if (pa.pre === '' && pb.pre === '') return 0;
  if (pa.pre === '') return 1;
  if (pb.pre === '') return -1;
  return pa.pre < pb.pre ? -1 : pa.pre > pb.pre ? 1 : 0;
}

function lt(a: string, b: string): boolean {
  return compareSemver(a, b) < 0;
}

/**
 * Derive the version-update tier from a client's current version + the
 * server's min/latest constraints, with an optional global override that
 * trumps version comparison entirely.
 *
 * Pure: same inputs always yield same output. Used by:
 *   - the BFF's GET /api/app/version-check (full poll, has globalOverride)
 *   - the PWA's API interceptor on every authenticated response (header
 *     path; can only see min+latest, so passes 'none' for globalOverride)
 *
 * Order matters: the override is checked first so a kill-switch tier
 * never gets clobbered by a coincidental version comparison.
 */
export function deriveUpdateLevel(
  clientVersion: string,
  minVersion: string,
  latestVersion: string,
  globalOverride: UpdateLevel | 'none',
): UpdateLevel {
  if (globalOverride !== 'none') return globalOverride;
  if (lt(clientVersion, minVersion)) return 'forced';
  if (lt(clientVersion, latestVersion)) return 'optional';
  return 'none';
}

/**
 * Strict ordering of `UpdateLevel`s — used to decide whether to bump up
 * (header-path interceptor never lowers the tier; only a full poll has
 * the globalOverride context to do that).
 */
const LEVEL_ORDER: Record<UpdateLevel, number> = {
  none: 0,
  optional: 1,
  recommended: 2,
  forced: 3,
};

export function isHigherLevel(next: UpdateLevel, current: UpdateLevel): boolean {
  return LEVEL_ORDER[next] > LEVEL_ORDER[current];
}
