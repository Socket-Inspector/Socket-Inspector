import { defineContentScript } from '#imports';
import { createLogger } from '@/utils/customLogger';
import { WindowConnector } from '@/utils/windowMessaging';

/**
 * TODO:
 * this works based on premise that window postmessage sent will be queued
 *  and both scripts will run before a message is executed
 */

const setupRelaySync = () => {
  const logger = createLogger('ISOLATED_WORLD');
  const windowConnector = new WindowConnector({ window, location: 'ISOLATED_WORLD', logger }).connect();
  windowConnector.subscribe((packet) => {
    logger(`Got this packet: ${JSON.stringify(packet)}`)
  });
  windowConnector.sendDebugPacket('WHAZZZUP')
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
