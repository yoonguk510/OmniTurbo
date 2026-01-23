# Contract Package

This package is the heart of the OmniTurbo API. It defines the API contract using [oRPC](https://orpc.io/), which enables end-to-end type safety between the backend and frontend.

## Features

- **Contract-First Approach**: The API is designed with a "contract-first" methodology. All API changes start here.
- **oRPC**: Uses oRPC to define API procedures, which are similar to functions. This avoids the complexity of REST endpoints and manual client generation.
- **Zod for Validation**: All request and response shapes are defined with [Zod](https://zod.dev/) schemas. This provides runtime validation on the server and static type-safety on the client.
- **OpenAPI Generation**: Includes a script to generate an OpenAPI v3 specification from the oRPC contract, which can be useful for external tools and documentation.

## Structure

The contract package is organized into two main layers:

### Schema Layer (`src/schema/`)

All Zod schemas and their inferred TypeScript types live here. Each schema file owns both the schema definition AND the type export:

```
src/schema/
├── common.schema.ts   # ApiResponseSchema, PaginationSchema, SuccessResponseSchema
├── user.schema.ts     # UserResponseSchema, UserResponse type
├── auth.schema.ts     # Login, Register, SSO schemas + types
└── storage.schema.ts  # Storage upload schemas + types
```

**Import types directly from schemas:**

```typescript
import type { UserResponse } from '@repo/contract/schema/user';
import type { LoginInput, AuthResponse } from '@repo/contract/schema/auth';
```

### Contract Layer (`src/public/`, `src/user/`, `src/admin/`)

Pure route definitions that import schemas from the schema layer:

- `publicRouter`: For procedures that do not require authentication (e.g., login, register).
- `userRouter`: For procedures that require a user to be authenticated (e.g., fetching profile data).
- `adminRouter`: For procedures that require administrator privileges.

## Workflow

When adding or modifying an API endpoint, the following workflow should be followed:

### 1. Define Schemas (if needed)

If your endpoint needs new request/response shapes, add them to the appropriate schema file:

```typescript
// src/schema/user.schema.ts
import { z } from 'zod';

export const UpdateUserInputSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
```

### 2. Define the Contract

Open the relevant contract file and define the procedure using the imported schemas:

```typescript
// src/user/profile.contract.ts
import { oc } from '@orpc/contract';
import { ApiResponseSchema } from '../schema/common.schema.js';
import {
  UserResponseSchema,
  UpdateUserInputSchema,
} from '../schema/user.schema.js';

export const profileContract = {
  update: oc
    .route({
      method: 'PATCH',
      path: '/user/me',
      summary: 'Update user profile',
      tags: ['User'],
    })
    .input(UpdateUserInputSchema)
    .output(ApiResponseSchema(UserResponseSchema)),
};
```

### 3. Implement on the Server

The NestJS `api` server will automatically pick up the new contract definition, and TypeScript will show an error until the new procedure is implemented in the corresponding controller.

### 4. Consume on the Client

The Next.js `web` app can immediately call the new procedure with full type safety and autocompletion.

```tsx
import { orpc } from '@/lib/orpc';
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data } = useQuery(orpc.user.profile.me.queryOptions());
  // `data` is fully typed as the UserResponseSchema
}
```

## Package Exports

The package uses wildcard exports for automatic schema discovery:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./schema/*": "./dist/schema/*.schema.js"
  }
}
```

This means any new schema file (e.g., `src/schema/subscription.schema.ts`) is automatically available at `@repo/contract/schema/subscription` without modifying `package.json`.

## Generating OpenAPI Spec

To generate an `openapi.json` file from the contract, run the following command from the root of the project:

```bash
pnpm --filter @repo/contract openapi
```
