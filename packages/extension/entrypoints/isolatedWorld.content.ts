import { defineContentScript } from '#imports';
import { ServiceWorkerConnector } from '@/utils/serviceWorkerMessaging';
import { WindowConnector } from '@/utils/windowMessaging';

const setupRelaySync = () => {
  const windowConnector = new WindowConnector({
    window,
    location: 'ISOLATED_WORLD',
  }).connect();

  const serviceWorkerConnector = new ServiceWorkerConnector({
    channelName: 'CONTENT_SCRIPT_CHANNEL',
  }).connect();

  windowConnector.subscribe((packet) => {
    serviceWorkerConnector.sendPacket(packet);
  });

  serviceWorkerConnector.subscribe((packet) => {
    windowConnector.sendPacket(packet);
  });

  serviceWorkerConnector.sendPacket({ type: 'ClearDevtoolsStatePacket' });

  window.addEventListener('pageshow', (event) => {
    const loadedFromBFCache = event.persisted;
    if (loadedFromBFCache) {
      serviceWorkerConnector.connect();
      // clear the devtools panel in case the 'new page' had websockets
      // that were captured prior to the BF cache restore
      serviceWorkerConnector.sendPacket({ type: 'ClearDevtoolsStatePacket' });
    }
  });
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'ISOLATED',
  allFrames: false,
  main: () => {
    setupRelaySync();
  },
});
