# Extension Package
Contains the browser extension built with WXT

## Major Extension Components
**Devtools Panel**
- The extension's primary user interface 
- Loaded as custom panel in browser DevTools
- Sends and receives data to and from the Extension Service Worker
- path: `entrypoints/devtools-panel`

**Extension Service Worker**
- Relays data between the Devtools Panel and the Content Script
- If multiple browser tabs are open, there can be multiple Devtools Panels and Content Scripts connected to the extension service worker
- path: `entrypoints/background.ts`

**Content Script**
- Relays data between the Extension Service Worker and the Injected Script
- The browser injects the Content Script into the host page; then the Content Script injects the Injected Script into the host page.
- path: `entrypoints/contentScript.content.ts`

**Injected Script**
- Patches the host page's WebSocket constructor, enabling the extension to manage WebSocket connections
- Sends and receives data to and from the Content Script
- path: `entrypoints/injectedScript.ts`

## React Guidelines
- This project uses the **React Compiler**, which provides rendering optimizations, eliminating the need for manual useMemo, useCallback, and React.memo
- Do **not** suggest unnecessary micro-optimizations for rendering performance (e.g., `useMemo`, `useCallback`, `React.memo`) unless they are semantically required for correctness.
- Components should follow follow WCAG 2.1 AA digital-accessibility guidelines
- NEVER use `forwardRef` since it is no longer needed in React 19. Pass ref as a prop instead.