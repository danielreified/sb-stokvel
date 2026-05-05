export class ApiClientError extends Error {
  readonly status: number;
  readonly requestId: string | undefined;
  readonly body: unknown;

  constructor(status: number, body: unknown, requestId: string | undefined) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: unknown }).error)
        : `HTTP ${status}`;
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.requestId = requestId;
    this.body = body;
  }
}

export class UnauthorizedError extends ApiClientError {
  constructor(requestId: string | undefined) {
    super(401, { error: 'unauthorized' }, requestId);
    this.name = 'UnauthorizedError';
  }
}
