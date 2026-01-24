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

# full validation suite
pnpm prepare:release
```