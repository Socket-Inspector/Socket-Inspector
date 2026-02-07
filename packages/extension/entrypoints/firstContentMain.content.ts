import { defineContentScript } from '#imports';
import { createLogger } from '@/utils/customLogger';
import { WindowConnector } from '@/utils/windowMessaging';

const patchSocketSync = () => {
  const logger = createLogger('MAIN_WORLD');
  const windowConnector = new WindowConnector({ window, location: 'MAIN_WORLD', logger }).connect();
  windowConnector.subscribe((packet) => {
    logger(`Got this packet: ${JSON.stringify(packet)}`);
  });
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'MAIN',
  allFrames: false,
  main: () => {
    patchSocketSync();
  },
});
