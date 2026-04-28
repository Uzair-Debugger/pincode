// Access token lives in memory only — never localStorage/sessionStorage.
// Refresh token is an httpOnly cookie managed entirely by the backend.
let _accessToken: string | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string) => { _accessToken = token; },
  clear: () => { _accessToken = null; },
};
