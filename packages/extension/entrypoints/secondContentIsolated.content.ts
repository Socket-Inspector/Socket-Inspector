import { defineContentScript } from '#imports';
import { createLogger } from '@/utils/customLogger';
import { ServiceWorkerConnector } from '@/utils/serviceWorkerMessaging';
import { WindowConnector } from '@/utils/windowMessaging';

/**
 * TODO:
 * this works based on premise that window postmessage sent will be queued
 *  and both scripts will run before a message is executed
 *
 * why did i need the buffer before? (i think paranoia mainly)
 *
 * is ClearDevtoolsStatePacket guaranteed to be sent before any main world packets?
 *   actually, why not just send this packet from the other script?
 *   well because then CS ordering issues could happen
 *
 * make sure that both orderings of scripts work fine
 *
 * test the pageShow logic
 */

const setupRelaySync = () => {
  const logger = createLogger('ISOLATED_WORLD');

  const windowConnector = new WindowConnector({
    window,
    location: 'ISOLATED_WORLD',
    logger,
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
