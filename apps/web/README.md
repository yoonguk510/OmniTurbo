# Web Frontend (Next.js)

This directory contains the web frontend for the OmniTurbo suite, built with [Next.js](https://nextjs.org/) and accelerated by [Turbopack](https://turbo.build/pack).

## Features

- **Modern React Framework**: Built on the latest features of Next.js, including the App Router and Server Components.
- **Type-Safe API Client**: Uses [@orpc/client](https://orpc.io/docs/client/tanstack-query) and `@orpc/tanstack-query` to create a fully type-safe client for the API contract defined in `packages/contract`. This enables autocompletion and compile-time checks for all API calls.
- **UI Components**: Leverages the shared `@repo/ui` package for a consistent look and feel. The UI is built with [Shadcn/UI](https://ui.shadcn.com/) and styled with [Tailwind CSS](https://tailwindcss.com/).
- **State Management**: Uses [Zustand](https://github.com/pmndrs/zustand) for lightweight, global state management.
- **Data Fetching**: Employs [TanStack Query](https://tanstack.com/query/latest) for efficient data fetching, caching, and synchronization.
- **Authentication**: Implements client-side authentication logic, including social login with Google via [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google).

## Getting Started

### 1. Environment Variables

Create a `.env.local` file in this directory (`apps/web/.env.local`).

```env
# The public URL of your API server
NEXT_PUBLIC_API_URL=http://localhost:3000

# Your Google Client ID for OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2. Running the Development Server

To start the web app in development mode, run the following command from the root of the monorepo:

```bash
pnpm dev --filter web
```

The server will start on port `3001` by default and will hot-reload as you make changes.

## UI Development

- **Adding New Components**: To add new `shadcn/ui` components to the shared `@repo/ui` package, run the following command from the root of the project:
  ```bash
  pnpm ui <component-name>
  ```
- **Styling**: All components are styled using Tailwind CSS. You can customize the theme and add new styles in `packages/ui/src/styles.css` and the `tailwind.config.js` file in this directory.