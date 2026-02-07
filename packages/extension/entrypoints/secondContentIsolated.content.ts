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
    logger(`Got packet from window: ${JSON.stringify(packet)}`);
    serviceWorkerConnector.sendPacket(packet);
  });

  serviceWorkerConnector.subscribe((packet) => {
    logger(`Got packet from service worker: ${JSON.stringify(packet)}`);
    windowConnector.sendPacket(packet);
  });

  logger('------------------------------');
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
