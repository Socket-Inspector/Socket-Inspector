import { defineContentScript, injectScript } from '#imports';
import { ServiceWorkerConnector } from '@/utils/serviceWorkerMessaging';
import { getExtensionEnabledStorage } from '@/utils/storageHelpers';
import { InjectedScriptWindowConnector } from '@/utils/windowMessaging';
import { ContentScriptDefinition } from 'wxt';

const main: ContentScriptDefinition['main'] = async () => {
  const extensionEnabled = await getExtensionEnabledStorage();
  if (!extensionEnabled) {
    return;
  }

  const serviceWorkerConnector = new ServiceWorkerConnector({
    channelName: 'CONTENT_SCRIPT_CHANNEL',
  }).connect();

  /**
   * This allows us to clear devtools when navigating to new page
   * or refreshing current page.
   *
   * Ideally we'd use browser.devtools.network.onNavigated, but it
   * doesn't seem to fire sometimes when navigating via a bookmark
   *
   * TODO:
   * are there any possible race conditions where this somehow
   *    arrives after the SocketDetailsPacket?
   */
  serviceWorkerConnector.sendPacket({ type: 'ClearDevtoolsStatePacket' });

  const injectedScriptConnector = new InjectedScriptWindowConnector({
    window,
  }).connect();

  serviceWorkerConnector.subscribe((packet) => {
    injectedScriptConnector.sendPacket(packet);
  });

  injectedScriptConnector.subscribe((packet) => {
    serviceWorkerConnector.sendPacket(packet);
  });

  window.addEventListener('pageshow', (event) => {
    const loadedFromBFCache = event.persisted;
    if (loadedFromBFCache) {
      serviceWorkerConnector.connect();
      // clear the devtools panel in case the 'new page' had websockets
      // that were captured prior to the BF cache restore
      serviceWorkerConnector.sendPacket({ type: 'ClearDevtoolsStatePacket' });
    }
  });

  await injectScript('/injectedScript.js', {
    keepInDom: true,
  });
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'ISOLATED',
  // only inject into top frame, not sub-frames (<iframe> not supported currently)
  allFrames: false,
  main,
});
