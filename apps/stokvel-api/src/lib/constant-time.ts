/**
 * Pad an async operation to a constant duration so timing differences
 * between code paths (cache hit vs miss, found vs not-found, allowed vs
 * rate-limited) can't be observed by an attacker. CLAUDE.md mandates
 * identical-time + identical-shape responses across every login failure
 * path including rate-limited and unparseable-body cases.
 *
 * Pattern: run `fn` and a fixed-duration setTimeout in parallel, return
 * when both resolve. Total wall time = max(fn_duration, padMs).
 */
export const CONSTANT_LOGIN_RESPONSE_MS = 250;

export async function constantTime<T>(fn: () => Promise<T>, padMs: number): Promise<T> {
  const [result] = await Promise.all([
    fn(),
    new Promise<void>((resolve) => setTimeout(resolve, padMs)),
  ]);
  return result;
}
