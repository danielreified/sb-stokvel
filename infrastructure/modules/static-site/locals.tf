locals {
  bucket_name = "${var.name_prefix}-pwa"
  origin_id   = "pwa-s3"

  # Production CSP for the PWA. style-src keeps 'unsafe-inline' for now —
  # Radix-UI primitives inject inline animation styles and we haven't done
  # the full audit to hash or eliminate them. script-src is strict ('self'
  # only) because Vite emits external script tags exclusively.
  csp_value = join("; ", concat([
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src ${join(" ", concat(["'self'"], var.csp_connect_src))}",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ], var.csp_report_uri == "" ? [] : ["report-uri ${var.csp_report_uri}"]
  ))
}
