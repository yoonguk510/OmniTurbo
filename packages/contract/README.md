# Contract Package

This package is the heart of the OmniTurbo API. It defines the API contract using [oRPC](https://orpc.io/), which enables end-to-end type safety between the backend and frontend.

## Features

- **Contract-First Approach**: The API is designed with a "contract-first" methodology. All API changes start here.
- **oRPC**: Uses oRPC to define API procedures, which are similar to functions. This avoids the complexity of REST endpoints and manual client generation.
- **Zod for Validation**: All request and response shapes are defined with [Zod](https://zod.dev/) schemas. This provides runtime validation on the server and static type-safety on the client.
- **OpenAPI Generation**: Includes a script to generate an OpenAPI v3 specification from the oRPC contract, which can be useful for external tools and documentation.

## Structure

The contract is organized into routers, which group related procedures:

- `publicRouter`: For procedures that do not require authentication (e.g., login, register).
- `userRouter`: For procedures that require a user to be authenticated (e.g., fetching profile data).
- `adminRouter`: For procedures that require administrator privileges.

## Workflow

When adding or modifying an API endpoint, the following workflow should be followed:

1.  **Define the Procedure**: Open the relevant router file (e.g., `src/user/profile.contract.ts`) and define a new procedure using `oRPC` and `Zod`.

    ```typescript
    import { orpc, zod } from '@orpc/contract';
    import { UserResponseSchema } from '@repo/database/schemas';

    export const profileContract = {
      me: orpc.query({
        summary: 'Get the current user',
        result: UserResponseSchema,
      }),
      // ... other procedures
    };
    ```

2.  **Implement on the Server**: The NestJS `api` server will automatically pick up the new contract definition, and TypeScript will show an error until the new procedure is implemented in the corresponding controller.

3.  **Consume on the Client**: The Next.js `web` app can immediately call the new procedure with full type safety and autocompletion.

    ```tsx
    import { orpc } from '@/lib/orpc';
    import { useQuery } from '@tanstack/react-query';

    function MyComponent() {
      const { data } = useQuery(orpc.user.profile.me.queryOptions());
      // `data` is fully typed as the UserResponseSchema
    }
    ```

## Generating OpenAPI Spec

To generate an `openapi.json` file from the contract, run the following command from the root of the project:

```bash
pnpm --filter @repo/contract openapi
```
