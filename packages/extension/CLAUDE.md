# Extension Package

Browser extension built with WXT

## Major Extension Components

**Devtools Panel**

- The extension's primary user interface
- Loaded as custom panel in browser DevTools
- Sends and receives data to and from the Extension Service Worker
- path: `entrypoints/devtools-panel`

**Extension Service Worker**

- Relays data between the `Devtools Panel` and the `Isolated Content Script`
- If multiple browser tabs are open, there can be multiple `Devtools Panels` and `Isolated Content Scripts `connected to the `Extension Service Worker`
- path: `entrypoints/background.ts`

**Isolated Content Script**

- Relays data between the `Extension Service Worker` and the `Main Content Script`
- path: `entrypoints/isolatedWorld.content.ts`

**Main Content Script**

- Patches the host page's WebSocket constructor, enabling the extension to manage WebSocket connections
- Sends and receives data to and from the `Isolated Content Script`
- path: `entrypoints/mainWorld.content.ts`

## React Guidelines

- This project uses the **React Compiler**, which provides rendering optimizations, eliminating the need for manual useMemo, useCallback, and React.memo
- Components should follow follow WCAG 2.1 AA digital-accessibility guidelines
- NEVER use `forwardRef` since it is no longer needed in React 19. Pass ref as a prop instead.
- This project uses the shadcn component library. Components are in the `components/shadcn` directory. DO NOT modify these components unless told otherwise.

## Shadcn Components

- The extension's UI is built using components from the `components/shadcn` directory
- Do not modify these components unless absolutely necessary
- If you need a shadcn component that hasn't been added to the repo, then ask the dev to add it for you