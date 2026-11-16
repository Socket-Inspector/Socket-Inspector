# Shadcn Package

shadcn components used by the Socket Inspector extension, published in the workspace as `@socket-inspector/shadcn`.

## Structure

- `src/components` - shadcn components, imported as `@socket-inspector/shadcn/<ComponentName>`
- `src/lib/cn.ts` - `cn` class name helper, imported as `@socket-inspector/shadcn`
- `src/hooks` - hooks used internally by the components
- `src/styles.css` - Tailwind theme tokens and base styles, imported as `@socket-inspector/shadcn/styles.css`

The package ships TypeScript source with no build step. The extension's Vite build compiles it.

## Guidelines

- Do not modify these components unless absolutely necessary
- If you need a shadcn component that hasn't been added to the repo, then ask the dev to add it for you
- Use relative imports inside this package. The extension's `@/` alias does not apply here.
