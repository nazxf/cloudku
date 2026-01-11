/**
 * Google OAuth 2.0 - Redirect Flow (No Popup)
 * Uses Authorization Code Flow with redirect callback
 */

export interface GoogleAuthConfig {
  clientId: string;
  redirectUri: string;
  scope?: string;
}

/**
 * Generate Google OAuth URL for redirect
 */
export const getGoogleAuthUrl = (config: GoogleAuthConfig): string => {
  const { clientId, redirectUri, scope = 'openid email profile' } = config;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    access_type: 'offline',
    prompt: 'select_account', // Always show account selection
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Initiate Google Sign-In with redirect (no popup)
 */
export const signInWithGoogleRedirect = (config: GoogleAuthConfig): void => {
  const authUrl = getGoogleAuthUrl(config);
  
  // Save current state to sessionStorage (optional, for returning to same page)
  sessionStorage.setItem('auth_redirect_origin', window.location.pathname);
  
  // Redirect to Google OAuth
  window.location.href = authUrl;
};

/**
 * Parse authorization code from callback URL
 */
export const getAuthCodeFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

/**
 * Get error from callback URL
 */
export const getAuthErrorFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('error');
};

/**
 * Get redirect origin from sessionStorage
 */
export const getRedirectOrigin = (): string => {
  return sessionStorage.getItem('auth_redirect_origin') || '/';
};

/**
 * Clear redirect origin from sessionStorage
 */
export const clearRedirectOrigin = (): void => {
  sessionStorage.removeItem('auth_redirect_origin');
};
