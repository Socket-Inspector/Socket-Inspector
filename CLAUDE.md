# CLAUDE.md

## Project Overview

Socket Inspector is a Chrome DevTools extension that enables the user to debug WebSocket connections on a host page.

## Monorepo Structure

- `packages/extension` - the extension itself
- `packages/test-app-ui` - host page for testing the extension
- `packages/test-app-server` - websocket server consumed by `test-app-ui`
- `packages/playwright-tests` - e2e tests

## Common Commands
```bash
# formatter
pnpm format

# linter
pnpm lint:fix

# type checker
pnpm typecheck

# unit tests
pnpm test:unit

# e2e tests
pnpm e2e:prepare # build mock extension first
pnpm e2e # run tests

# run full suite of validations
pnpm prepare:release
```

## Common Commands (generated)

### Development

```bash
# Extension development mode
cd packages/extension && pnpm dev

# Run test app (UI + server)
pnpm test-app:serve
```

### Testing

```bash
# Unit tests (Vitest)
cd packages/extension && pnpm test:unit

# E2E tests (Playwright)
pnpm playwright:prepare  # Build mock extension first
pnpm playwright:test     # Run tests
pnpm playwright:test:ui  # Interactive UI mode
```

### Linting & Formatting

```bash
pnpm format              # Prettier (entire workspace)
pnpm extension:lint      # Oxlint
pnpm extension:lint:fix  # Auto-fix
```

### Building

```bash
cd packages/extension && pnpm build       # Production Chrome build
cd packages/extension && pnpm build:mock  # Mock build for testing
cd packages/extension && pnpm compile     # Type check only
```

## Architecture

### Three-Layer Message Relay System

The extension uses a message relay architecture due to Chrome extension isolation requirements:

1. **Injected Script** (`injectedScript.ts`) - Runs in page context, intercepts WebSocket traffic using MSW WebSocketInterceptor, sends packets via `window.postMessage()`

2. **Content Script** (`contentScript.content.ts`) - Bridges injected script and service worker, relays messages via `chrome.runtime.connect()` ports

3. **Background Service Worker** (`background.ts`) - Manages `Relay` instances per tab, routes messages between content script and DevTools panel

### Key Communication Patterns

- All inter-process communication uses strongly-typed `Packet` union types (defined in `utils/sharedTypes/sharedTypes.ts`)
- Zod schemas validate packets at runtime
- `windowMessaging.ts` handles cross-context messaging
- `serviceWorkerMessaging.ts` handles extension port communication

### UI Architecture

- React 19 with Radix UI primitives + Tailwind CSS
- Responsive layout with resizable panels
- State management via custom hooks (useSocketContext) using reducer pattern
- Path alias: `@/` maps to source root, `#imports` for WXT auto-imports

## Monorepo Structure

- `packages/extension/` - Main Chrome extension (WXT framework)
- `packages/playwright-tests/` - E2E tests
- `packages/test-app-ui/` - React test app for manual/E2E testing
- `packages/test-app-server/` - Bun WebSocket server for testing
- `build-scripts/` - Release pipeline scripts

## Testing Notes

- Unit tests: `**/*.spec.ts` files in `_tests/` directories
- E2E tests require mock extension build first (`pnpm playwright:prepare`)
- Test server uses Bun (port 6857), test UI uses Vite (port 4298)
- Playwright configured for Chromium only, 3 workers, HTML reports
