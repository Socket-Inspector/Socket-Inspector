import { browser } from '#imports';

/**
 * If a port's disconnectHandler is triggered due
 * to an error, and you do not access the error via
 * runtime.lastError, then Chrome will display an
 * error message in the Extensions panel.
 *
 * For example, if the content script enters BF cache,
 * then it's ports are disconnected and the ESW's
 * onDisconnect callback is triggered with
 * runtime.lastError set.
 */
export const touchLastError = () => {
  void browser.runtime.lastError;
};

export const copyToClipboard = async (text: string): Promise<void> => {
  // Prefer modern Clipboard API (no focus manipulation needed)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      console.log('TV: modern API failed');
      // Fall through to legacy method
    }
  }

  console.log('TV: using legacy');

  // Legacy fallback: save and restore focus
  const previouslyFocusedElement = document.activeElement as HTMLElement | null;
  console.log('TV: previously focused?: ', previouslyFocusedElement);

  return new Promise((resolve) => {
    // Use setTimeout to defer execution until after context menus finish closing,
    // which resolves focus issues with Radix UI's ContextMenu component.
    setTimeout(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.opacity = '0';
      textarea.setAttribute('aria-hidden', 'true');
      textarea.setAttribute('tabindex', '-1');
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      // Restore focus to previously focused element
      if (previouslyFocusedElement?.focus) {
        previouslyFocusedElement.focus();
      }

      resolve();
    }, 0);
  });
};
