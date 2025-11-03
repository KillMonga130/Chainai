/**
 * IBM watsonx Orchestrate Authentication Service
 * Handles JWT token generation for embedded chat authentication
 */

import { WATSONX_CONFIG } from './watsonx-config';

// Env-driven controls
const ENV = (import.meta as any)?.env ?? {};
const ENV_JWT: string | undefined = ENV.VITE_WXO_JWT;
const ENV_SECURITY_DISABLED: boolean = `${ENV.VITE_WXO_SECURITY_DISABLED}` === 'true';
const ENV_USE_IAM: boolean = `${ENV.VITE_WXO_USE_IAM}` === 'true';

interface IAMTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expiration: number;
}

interface JWTPayload {
  sub: string;
  name?: string;
  email?: string;
  exp?: number;
  iat?: number;
}

// Token cache to avoid unnecessary API calls
let cachedToken: string | null = null;
let tokenExpiration: number = 0;

/**
 * Get IBM Cloud IAM access token using API key
 * Note: Direct browser calls to IBM IAM API will fail due to CORS.
 * This should be called from a backend proxy in production.
 */
async function getIAMToken(): Promise<string> {
  try {
    console.log('[Chain AI Auth] Attempting to get IAM token...');
    
    // Verify API key is loaded
    if (!WATSONX_CONFIG.apiKey || WATSONX_CONFIG.apiKey.trim() === '') {
      console.error('[Chain AI Auth] API key is missing or empty!');
      console.error('[Chain AI Auth] VITE_WATSONX_API_KEY environment variable not found');
      throw new Error('API key is required for IAM authentication. Please set VITE_WATSONX_API_KEY in .env.local');
    }
    
    console.log(`[Chain AI Auth] API key loaded (length: ${WATSONX_CONFIG.apiKey.length} chars)`);
    
    // Use Vite dev proxy in development to avoid CORS; real IAM endpoint in production
    const iamBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV)
      ? '/_iam'
      : 'https://iam.cloud.ibm.com';

    const response = await fetch(`${iamBase}/identity/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: WATSONX_CONFIG.apiKey,
      }),
    });
    
    console.log(`[Chain AI Auth] IAM request sent to: ${iamBase}/identity/token`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chain AI Auth] IAM token error:', errorText);
      throw new Error(`Failed to get IAM token: ${response.status}`);
    }

    const data: IAMTokenResponse = await response.json();
    console.log('[Chain AI Auth] IAM token obtained successfully');
    return data.access_token;
  } catch (error) {
    // CORS error or network issue - this is expected in browser environment
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.warn('[Chain AI Auth] CORS/Network error detected. Using fallback authentication.');
      console.warn('[Chain AI Auth] In production, implement a backend proxy for IAM token generation.');
      // Return a mock token for development
      throw new Error('CORS_ERROR');
    }
    console.error('[Chain AI Auth] Error getting IAM token:', error);
    throw error;
  }
}

/**
 * Generate JWT token for watsonx Orchestrate authentication
 * This creates a simple JWT that can be used for embedded chat
 */
export async function generateAuthToken(): Promise<string> {
  try {
    // Check if we have a valid cached token
    const now = Date.now() / 1000;
    if (cachedToken && tokenExpiration > now + 300) {
      // Token is valid for at least 5 more minutes
      console.log('[Chain AI Auth] Using cached token');
      return cachedToken;
    }

    // 1) If a JWT is provided via env, prefer it
    if (ENV_JWT) {
      console.log('[Chain AI Auth] Using JWT from environment');
      cachedToken = ENV_JWT;
      // Try to decode exp if present
      try {
        const [, payload] = ENV_JWT.split('.');
        const data = JSON.parse(atob(payload));
        tokenExpiration = typeof data.exp === 'number' ? data.exp : now + 3600;
      } catch {
        tokenExpiration = now + 3600;
      }
      return ENV_JWT;
    }

    // 2) Optionally allow IAM token usage if explicitly enabled (preferred over security-disabled fallback)
    if (ENV_USE_IAM) {
      try {
        const iamToken = await getIAMToken();
        cachedToken = iamToken;
        tokenExpiration = now + 3600; // 1 hour from now
        console.log('[Chain AI Auth] IAM token generated and cached');
        return iamToken;
      } catch (iamError: any) {
        if (iamError.message === 'CORS_ERROR') {
          console.warn('[Chain AI Auth] CORS error getting IAM token. Consider using env JWT or disabling security.');
        }
        throw iamError;
      }
    }

    // 3) If security is explicitly disabled, return empty string (no token needed)
    if (ENV_SECURITY_DISABLED) {
      console.warn('[Chain AI Auth] Security disabled by env flag. No token required.');
      return '';
    }

    // 4) Otherwise, we cannot provide a valid token under secure instance
    throw new Error('NO_TOKEN_AVAILABLE');
  } catch (error) {
    console.error('[Chain AI Auth] Error generating auth token:', error);
    // As a last resort only when explicitly disabled via env we already returned above.
    // Here, rethrow to allow UI to show helpful guidance.
    throw error;
  }
}

/**
 * Create a simple JWT-like token for testing/development
 * WARNING: This should only be used if security is disabled on the watsonx Orchestrate instance
 */
export function createUnsecuredToken(userId: string = 'anonymous', userName: string = 'Chain AI User'): string {
  const header = {
    alg: 'none',
    typ: 'JWT'
  };

  const payload: JWTPayload = {
    sub: userId,
    name: userName,
    email: `${userId}@chainai.local`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  };

  // Create unsecured JWT (for use when security is disabled)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  return `${encodedHeader}.${encodedPayload}.`;
}

/**
 * Validate and refresh token if needed
 */
export async function validateAndRefreshToken(currentToken?: string): Promise<string> {
  const now = Date.now() / 1000;
  
  // If no token provided or cached token is expired, get new one
  if (!currentToken || tokenExpiration <= now + 300) {
    return generateAuthToken();
  }
  
  return currentToken;
}

/**
 * Clear the token cache (useful for logout or token refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiration = 0;
  console.log('[Chain AI Auth] Token cache cleared');
}

/**
 * Check if security is enabled and configure authentication accordingly
 */
export interface AuthConfig {
  enabled: boolean;
  useIAMAuth: boolean;
  useFallbackAuth: boolean;
  tokenProvider?: () => Promise<string>;
}

export function getAuthConfig(): AuthConfig {
  // Reflect env-based configuration
  if (ENV_JWT) {
    return { enabled: true, useIAMAuth: false, useFallbackAuth: false, tokenProvider: generateAuthToken };
  }
  if (ENV_SECURITY_DISABLED) {
    return { enabled: false, useIAMAuth: false, useFallbackAuth: true, tokenProvider: generateAuthToken };
  }
  if (ENV_USE_IAM) {
    return { enabled: true, useIAMAuth: true, useFallbackAuth: false, tokenProvider: generateAuthToken };
  }
  // Default: security likely enabled at instance but no token configured
  return { enabled: true, useIAMAuth: false, useFallbackAuth: false };
}

/**
 * Get authentication status message for UI display
 */
export function getAuthStatus(): { status: 'authenticated' | 'fallback' | 'error', message: string } {
  const now = Date.now() / 1000;
  
  if (cachedToken && tokenExpiration > now) {
    // Check if it's a real IAM token or fallback
    const isFallback = cachedToken.endsWith('.'); // Unsecured tokens end with '.'
    
    if (isFallback) {
      return {
        status: 'fallback',
        message: 'Using development authentication (CORS limitation)'
      };
    }
    
    return {
      status: 'authenticated',
      message: ENV_JWT ? 'Authenticated with JWT' : 'Authenticated with IBM Cloud IAM'
    };
  }
  
  return {
    status: 'error',
    message: 'Not authenticated. Provide VITE_WXO_JWT or disable security (VITE_WXO_SECURITY_DISABLED=true) or enable IAM (VITE_WXO_USE_IAM=true).'
  };
}
