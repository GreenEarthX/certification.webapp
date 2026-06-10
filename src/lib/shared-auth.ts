// src/lib/shared-auth.ts 
export const TOKEN_KEY = "geomap-auth-token";
export const REFRESH_KEY = "geomap-refresh-token";

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
export const getRefreshToken = () => (typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY));

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};