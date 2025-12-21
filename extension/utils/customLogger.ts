// logger.ts (shared by every extension context)

export type LogFn = (...data: unknown[]) => void;

const GLOBAL_PREFIX = 'SOCKET_EXTENSION';

/**
 * Creates a namespaced logger whose output is
 *   • prefixed with the context label
 *   • colour-coded (so DevTools ≠ Service Worker in the console)
 *   • toggled on/off via chrome.storage or an env var
 */
export function createLogger(label: string): (...args: unknown[]) => void {
  const colour = stringToHsl(label);

  return (...args: unknown[]) => {
    // Single %c styles both brackets the same
    console.log(
      `%c[${GLOBAL_PREFIX}][${label.toUpperCase()}]`,
      `color:${colour};font-weight:bold`,
      ...args,
    );
  };
}

/* helpers -------------------------------------------------- */

function stringToHsl(str: string): string {
  // Simple hash → hue
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360},70%,50%)`;
}
