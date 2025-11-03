/**
 * IBM watsonx Orchestrate Authentication Service
 * Handles JWT token generation for embedded chat authentication
 */

import { WATSONX_CONFIG } from './watsonx-config';

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
    
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
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

    // Try to get IBM Cloud IAM token
    try {
      const iamToken = await getIAMToken();
      
      // For IBM Cloud instances, we can use the IAM token directly
      // Store it in cache with expiration (IAM tokens typically last 1 hour)
      cachedToken = iamToken;
      tokenExpiration = now + 3600; // 1 hour from now
      
      console.log('[Chain AI Auth] Token generated and cached');
      return iamToken;
    } catch (iamError: any) {
      // If CORS error, fall back to unsecured token for development
      if (iamError.message === 'CORS_ERROR') {
        console.warn('[Chain AI Auth] Falling back to development authentication mode');
        console.warn('[Chain AI Auth] For production, configure a backend proxy or disable security on watsonx instance');
        
        const unsecuredToken = createUnsecuredToken('chainai-user', 'Chain AI User');
        cachedToken = unsecuredToken;
        tokenExpiration = now + 3600;
        
        return unsecuredToken;
      }
      throw iamError;
    }
  } catch (error) {
    console.error('[Chain AI Auth] Error generating auth token:', error);
    // Instead of throwing, return unsecured token as last resort
    console.warn('[Chain AI Auth] Using unsecured token as fallback');
    const fallbackToken = createUnsecuredToken('chainai-user', 'Chain AI User');
    return fallbackToken;
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
  // Security is DISABLED - no authentication required
  return {
    enabled: false,
    useIAMAuth: false,
    useFallbackAuth: false,
    tokenProvider: undefined,
  };
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
      message: 'Authenticated with IBM Cloud IAM'
    };
  }
  
  return {
    status: 'error',
    message: 'Not authenticated'
  };
}
