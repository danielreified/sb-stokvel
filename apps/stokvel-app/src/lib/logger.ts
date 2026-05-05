import { redact } from '@seyva/utils';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

let lastRequestId: string | undefined;

export function setLastRequestId(id: string): void {
  lastRequestId = id;
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry = redact({
    time: new Date().toISOString(),
    level,
    message,
    version: __APP_VERSION__,
    ...(lastRequestId ? { requestId: lastRequestId } : {}),
    ...data,
  });

  if (level === 'error') {
    console.error(entry);
  } else if (level === 'warn') {
    console.warn(entry);
  } else {
    console.log(entry);
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
};

// Top-level error capture — seam for Sentry/Datadog
if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error('uncaught_error', {
      message: String(message),
      source,
      lineno,
      colno,
      stack: error?.stack,
    });
  };

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('unhandled_rejection', {
      reason: String(event.reason),
      stack: event.reason instanceof Error ? event.reason.stack : undefined,
    });
  });
}
