export function getApiUrl(): string {
  const env = (import.meta as any).env?.VITE_API_URL;
  if (env && typeof env === 'string' && env.length > 0) return env;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If frontend served from www.entagrel.com, use the api subdomain by default
    if (host === 'www.entagrel.com' || host === 'entagrel.com') return 'https://api.entagrel.com';
    // otherwise use same origin
    return window.location.origin;
  }
  // fallback to localhost for dev
  return 'http://localhost:5000';
}
