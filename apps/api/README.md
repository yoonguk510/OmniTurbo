# API Server (NestJS)

This directory contains the backend API for the OmniTurbo suite, built with the [NestJS](https://nestjs.com/) framework.

## Features

- **Modular Architecture**: Organized into modules for clear separation of concerns (e.g., `Auth`, `Users`, `Storage`).
- **Contract-First with oRPC**: Implements the API contract defined in `packages/contract` using [@orpc/nest](https://orpc.io/docs/server/nest). This provides end-to-end type safety with the frontend clients.
- **Authentication**: A robust authentication system featuring:
  - Secure JWT-based sessions with `access_token` and `refresh_token`.
  - `HttpOnly` cookies for storing tokens.
  - Social login via Google OAuth.
  - Password hashing with `bcrypt`.
- **Database Integration**: Connects to the database using the shared `@repo/database` package, which leverages Prisma.
- **Email Service**: Sends transactional emails (e.g., email verification, password reset) using [Resend](https://resend.com/) and [JSX Email](https://jsx.email/).
- **Configuration**: Uses `@nestjs/config` to manage environment variables.

## Getting Started

### 1. Environment Variables

Create a `.env` file in this directory (`apps/api/.env`).

```env
# Port
PORT=3000

# Web URL (for constructing email links)
WEB_URL=http://localhost:3001

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend API Key
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM="Your Name <noreply@yourdomain.com>"
```

### 2. Running the Server

To start the API server in development mode, run the following command from the root of the monorepo:

```bash
pnpm dev --filter api
```

The server will start on the port specified in your `.env` file (defaults to `3000`) and will watch for file changes.

## API Development Workflow

All API changes must follow the **contract-first** approach:

1.  **Define the Contract**: All new endpoints, request/response shapes, and procedures must be defined in the `@repo/contract` package.
2.  **Implement the Controller**: Implement the newly defined contract in the relevant NestJS controller (e.g., `apps/api/src/modules/users/users.controller.ts`). The `@orpc/nest` library will provide type hints and validation based on the contract.
3.  **Add Business Logic**: Implement the business logic for the new endpoint in the corresponding service (e.g., `users.service.ts`).