import { createORPCClient, onError } from '@orpc/client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { type ContractRouterClient } from '@orpc/contract';
import { ResponseValidationPlugin } from '@orpc/contract/plugins';
import { contract } from '@repo/contract';

// Environment variable for API URL (fallback to localhost for dev)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const link = new OpenAPILink(contract, {
  url: API_BASE_URL,
  // key: No headers needed for Web, we rely entirely on HttpOnly cookies
  fetch: (request, init) => {
    return globalThis.fetch(request, {
      ...init,
      credentials: 'include', //  <-- Critical: This sends cookies with requests
    });
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
