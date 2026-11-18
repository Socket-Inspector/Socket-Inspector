# Socket Inspector

Socket Inspector is a Chrome DevTools extension that enables the user to debug WebSocket connections on a host page.

## Monorepo Structure

pnpm workspace with the following packages:

- `packages/extension` - the extension itself
- `packages/shadcn` - shadcn component library used by the extension
- `packages/playwright-tests` - e2e tests

## Common Commands

```bash
# prepare development environment
mise run setup

# formatter
pnpm format

# linter
pnpm lint:fix

# type checker
pnpm typecheck

# unit tests
pnpm test:unit

# e2e tests
pnpm prepare:e2e # build mock extension first
pnpm e2e # run tests

# full validation suite
pnpm prepare:release
```

## Coding Guidlines

Don't write `switch` statements. Use if, else-if, else instead.

Where possible, functions should take at most 2 parameters. Use an options object instead of more positional parameters. 
