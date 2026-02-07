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

  serviceWorkerConnector.sendPacket({ type: 'ClearDevtoolsStatePacket' });

  logger('---------------------------------');
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
