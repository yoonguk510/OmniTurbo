# OmniTurbo - The Professional Startup Suite

OmniTurbo is a production-ready, full-stack monorepo boilerplate designed for rapid development and seamless scalability. It provides a robust foundation for building modern web applications with a shared, type-safe infrastructure.

## Core Architecture

This boilerplate is built on a set of modern, high-performance technologies, organized in a `pnpm` workspace-powered monorepo.

- **Monorepo Management**: [Turborepo](https://turbo.build/repo) for high-performance build system and code sharing.
- **API**: [NestJS](https://nestjs.com/) framework for the backend, offering a modular and scalable architecture.
- **Web Frontend**: [Next.js](https://nextjs.org/) (with Turbopack) for a fast and feature-rich web experience.
- **Contract-First API**: [oRPC](https://orpc.io/) for defining and consuming APIs with end-to-end type safety, eliminating the need for manual client generation.
- **Database**: [Prisma](https://www.prisma.io/) as the next-generation ORM.
- **Universal UI**: [Shadcn/UI](https://ui.shadcn.com/) components built with Tailwind CSS.
- **Authentication**: A complete solution with JWT, social logins (Google), and secure cookie-based sessions.
- **Email Service**: [Resend](https://resend.com/) and [JSX Email](https://jsx.email/) for building and sending transactional emails with React components.

## Project Structure

The monorepo is organized into `apps` and `packages`, promoting code reuse and separation of concerns.

```
.
├── apps
│   ├── api                       # NestJS API Backend
│   └── web                       # Next.js Web Frontend
├── packages
│   ├── contract                  # oRPC API contracts (source of truth)
│   ├── database                  # Prisma schema, client, and Zod schemas
│   ├── email                     # (Part of `api`) JSX-based email templates
│   ├── ui                        # Shared UI components (Shadcn/UI)
│   ├── eslint-config             # Shared ESLint configurations
│   ├── jest-config               # Shared Jest configurations
│   └── typescript-config         # Shared TypeScript configurations
```

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/installation)

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <repository-name>
pnpm install
```

### 2. Database Setup

This project uses PostgreSQL. Create a `.env` file in the root of the `packages/database` directory with your database connection string:

```env
# packages/database/.env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Then, generate the Prisma client and push the schema to your database:

```bash
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database db:push
```

### 3. Environment Variables

Create `.env` files for the `api` and `web` apps. You can start by copying the provided `.env.example` files (if they exist).

**`apps/api/.env`**:

```env
# Port
PORT=3000

# Web URL
WEB_URL=http://localhost:3001

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM="Your Name <noreply@yourdomain.com>"
```

**`apps/web/.env.local`**:
```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Running in Development

To start all applications in development mode, run the following command from the root of the project:

```bash
pnpm dev
```

- The API will be available at `http://localhost:3000`.
- The web app will be available at `http://localhost:3001`.

## Contributing

This boilerplate is designed to be a starting point for your own projects. Feel free to fork it, extend it, and customize it to your needs. If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.