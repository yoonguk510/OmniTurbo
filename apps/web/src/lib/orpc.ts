import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createORPCClient, onError } from '@orpc/client';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { type ContractRouterClient } from '@orpc/contract';
import { ResponseValidationPlugin } from '@orpc/contract/plugins';
import { contract } from '@repo/contract';

// Environment variable for API URL (fallback to localhost for dev)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const link = new OpenAPILink(contract, {
  url: API_BASE_URL,
  // key: No headers needed for Web, we rely entirely on HttpOnly cookies
  // Custom Fetch Wrapper for Silent Refresh Strategy
  fetch: async (url, init) => {
    // 1. Proactive Refresh Check
    const expiryCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token_expires_at='));
    
    if (expiryCookie) {
      const expiryValue = expiryCookie.split('=')[1];
      if (expiryValue) {
        const expiryTime = new Date(expiryValue);
        // If expiring within 1 minute, refresh proactively
        if (expiryTime.getTime() - Date.now() < 60 * 1000) {
          try {
            await globalThis.fetch(`${API_BASE_URL}/auth/refresh`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               credentials: 'include',
            });
          } catch (e) {
            // Ignore proactive refresh errors, let the actual request fail if needed
          }
        }
      }
    }

    // 2. Initial Request
    let response = await globalThis.fetch(url, {
      ...init,
      credentials: 'include',
    });

    // 3. Reactive Refresh (Interceptor)
    if (response.status === 401) {
      try {
         const refreshResponse = await globalThis.fetch(`${API_BASE_URL}/auth/refresh`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             credentials: 'include',
         });

         if (refreshResponse.ok) {
             // Retry original request
             response = await globalThis.fetch(url, {
                 ...init,
                 credentials: 'include',
             });
         }
      } catch (e) {
         // Refresh failed, return original 401 response
      }
    }

    return response;
  },
  interceptors: [
    onError((error) => {
        // Global Error Logging
        console.error('[ORPC Error]', error);
    })
  ],
  plugins: [
    new ResponseValidationPlugin(contract), // Enables auto-coercion (e.g. Date strings -> Date objects)
  ],
});

export const client: ContractRouterClient<typeof contract> = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
