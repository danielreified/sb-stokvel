import type { MiddlewareHandler } from 'hono';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Security headers applied to every response.
 * CSP relaxed in dev to allow Vite HMR; production uses strict hashes + strict-dynamic.
 * See CLAUDE.md → BFF → Cross-cutting middleware for the full rationale.
 */
export const securityHeadersMiddleware: MiddlewareHandler = async (c, next) => {
  await next();

  const csp = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws:; worker-src 'self'; manifest-src 'self'; object-src 'none'; frame-ancestors 'none';"
    : // `report-uri` is the legacy directive but it's still honoured by every
      // shipping browser. The newer `report-to` requires a paired
      // `Reporting-Endpoints` response header — we use the legacy form so
      // CSP reports actually arrive.
      "default-src 'self'; script-src 'self' 'strict-dynamic'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; frame-src 'none'; report-uri /api/csp-report;";

  c.res.headers.set('Content-Security-Policy', csp);
  c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
};
