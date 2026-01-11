/**
 * Google OAuth Utility - Fixed Version
 * Handles Google Sign-In authentication with renderButton()
 */

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                    }) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: {
                            theme?: 'outline' | 'filled_blue' | 'filled_black';
                            size?: 'large' | 'medium' | 'small';
                            type?: 'standard' | 'icon';
                            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
                            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
                            width?: number;
                            logo_alignment?: 'left' | 'center';
                        }
                    ) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

export interface GoogleUser {
    name: string;
    email: string;
    picture?: string;
    sub: string; // Google User ID
    credential?: string; // Raw JWT Token
}

/**
 * Decode JWT token from Google
 */
function parseJwt(token: string): GoogleUser {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

// Global flag to prevent multiple initializations
let isGoogleInitialized = false;
let currentCallback: ((user: GoogleUser) => void) | null = null;

/**
 * Load Google Sign-In script
 */
export const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector(
            'script[src="https://accounts.google.com/gsi/client"]'
        );
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
        document.head.appendChild(script);
    });
};

/**
 * Initialize Google Sign-In ONCE
 * Call this only once in your app
 */
export const initializeGoogleSignIn = (
    clientId: string,
    onSuccess: (user: GoogleUser) => void
): void => {
    if (!window.google?.accounts?.id) {
        return;
    }

    // Prevent multiple initializations
    if (isGoogleInitialized) {
        currentCallback = onSuccess;
        return;
    }

    currentCallback = onSuccess;

    window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
            try {
                const userData = parseJwt(response.credential);
                // Attach raw token
                (userData as any).credential = response.credential;
                
                if (currentCallback) {
                    currentCallback(userData as GoogleUser & { credential: string });
                }
            } catch (error) {
                // Silent error handling
            }
        },
    });

    isGoogleInitialized = true;
};

/**
 * Render Google Sign-In button
 * This is the RECOMMENDED way to use Google Sign-In
 */
export const renderGoogleButton = (
    container: HTMLElement,
    options?: {
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill';
        width?: number;
    }
): void => {
    if (!window.google?.accounts?.id) {
        return;
    }

    if (!isGoogleInitialized) {
        return;
    }

    // Clear container first
    container.innerHTML = '';

    try {
        // Render button with error handling
        window.google.accounts.id.renderButton(container, {
            theme: options?.theme || 'outline',
            size: options?.size || 'large',
            text: options?.text || 'signin_with',
            shape: options?.shape || 'rectangular',
            width: options?.width || 300,
            logo_alignment: 'left',
        });
    } catch (error) {
        // Silently handle 403 errors during button rendering
        // This can happen when origin is still propagating in Google's servers
        console.warn('Google button render failed (this is normal during initial setup):', error);
        
        // Optionally show a fallback message
        container.innerHTML = '<div style="padding: 12px; text-align: center; color: #666; font-size: 14px;">Google Sign-In sedang dimuat...</div>';
    }

};

/**
 * Reset initialization (for testing or re-initialization)
 */
export const resetGoogleSignIn = (): void => {
    isGoogleInitialized = false;
    currentCallback = null;
};
