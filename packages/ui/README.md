# UI Package

This package contains the shared UI components for the OmniTurbo suite. It is designed to be a universal component library that can be used by the `web` app and, in the future, the `native` mobile app.

## Features

- **Component Library**: Built with [Shadcn/UI](https://ui.shadcn.com/), providing a set of beautifully designed and accessible components.
- **Styling**: Uses [Tailwind CSS](https://tailwindcss.com/) for utility-first styling. The configuration is set up to be easily extendable.
- **Ready for Universal Apps**: While currently used by the Next.js web app, the setup is ready to be integrated with [NativeWind](https://www.nativewind.dev/v4/overview) to allow these same components to be used in the React Native (`Expo`) app.
- **Dark Mode**: Supports dark mode out of the box with `next-themes`.

## Usage

Components from this package can be imported directly into the `web` application:

```tsx
import { Button } from '@repo/ui/components/ui/button';

function MyComponent() {
  return <Button>Click me</Button>;
}
```

The global stylesheet is also provided and should be imported in the root layout of the web app:

```css
/* apps/web/app/globals.css */
@import '@repo/ui/styles.css';
```

## Adding New Components

New components from the `shadcn/ui` library can be added to this package using a convenient script in the root `package.json`:

```bash
pnpm ui <component-name>
```

This command will run `pnpm dlx shadcn-ui@latest add <component-name>`, adding the component's files to this package under `src/components/ui`. You can then customize the component as needed.
