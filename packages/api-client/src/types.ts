export type RequestFn = <T>(method: string, path: string, body?: unknown) => Promise<T>;

export interface ApiClientOptions {
  /** Base URL for all requests. Defaults to '' (relative URLs for same-origin + Vite proxy). */
  baseUrl?: string;
  /** Called on any 401 response — wire to signOut() + redirect in the React app. */
  onUnauthorized?: () => void;
  /** Called when X-Min-Client-Version / X-Latest-Client-Version headers are present. */
  onVersionHeaders?: (headers: { minVersion?: string; latestVersion?: string }) => void;
}
