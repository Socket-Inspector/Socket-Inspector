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
