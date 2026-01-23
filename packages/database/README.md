# Database Package

This package manages the project's database schema, client, and generated types. It uses [Prisma](https://www.prisma.io/) as the ORM.

## Features

- **Prisma v7.2.0**: Leverages a recent version of Prisma for robust database management.
- **PostgreSQL Ready**: Configured to use PostgreSQL with the high-performance `@prisma/adapter-pg` and `pg` driver. This setup is ideal for serverless environments and connection pooling.
- **Zod Schema Generation**: Automatically generates [Zod](https://zod.dev/) schemas from the Prisma schema using `prisma-zod-generator`. This is invaluable for input validation on the API and forms on the frontend.
- **Type-Safe Client**: Provides a fully typed Prisma client that can be used by the `api` server and other packages.

## Schema Management

- **Schema File**: The source of truth for the database schema is `prisma/schema.prisma`.
- **Generating the Client**: After any change to the `schema.prisma` file, you must regenerate the Prisma client and the Zod schemas. A convenient script is provided for this:

  ```bash
  pnpm --filter @repo/database db:generate
  ```

  This command runs `prisma generate` and then a custom `scripts/fix-imports.js` to ensure the generated Zod schemas have correct import paths.

- **Applying Schema Changes**: To apply your schema changes to the database, you can use `prisma db push`:
  ```bash
  pnpm --filter @repo/database db:push
  ```
  For production environments, it is recommended to use migrations (`prisma migrate dev` and `prisma migrate deploy`).

## Usage

The Prisma client can be imported and used in other packages (primarily the `api` server) like this:

```typescript
import { prisma } from '@repo/database';

async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
}
```

The generated Zod schemas can be used for validation:

```typescript
import { UserResponseSchema } from '@repo/database/schemas';

function validateUser(user: unknown) {
  return UserResponseSchema.parse(user);
}
```

## Guidance: Using Zod Schemas

We automatically generate Zod schemas from the Prisma schema using `prisma-zod-generator`.

### Handling Decimal Fields

Prisma returns `Decimal` objects (from `decimal.js`) for fields of type `Decimal`. However, our API contracts usually expect `string`.

To ensure compatibility, **you must add the following annotation** to any Decimal field in `schema.prisma`:

```prisma
model Example {
  /// @zod.custom.use(z.coerce.string())
  price Decimal @db.Decimal(10, 2)
}
```

This ensures `z.infer<typeof ExampleSchema>` maps `price` to `string` (via auto-coercion), allowing you to use `ExampleSchema.parse(prismaResult)` directly.
