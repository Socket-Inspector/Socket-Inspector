import { defineContentScript } from '#imports';
import { BufferedWindowConnector } from '@/utils/bufferedWindowConnector';
import { ServiceWorkerConnector } from '@/utils/serviceWorkerMessaging';

const isolatedScript = (
  scriptConnector: BufferedWindowConnector,
  serviceWorkerConnector: ServiceWorkerConnector,
) => {
  scriptConnector.subscribe((packet) => {
    serviceWorkerConnector.sendPacket(packet);
  });

  serviceWorkerConnector.subscribe((packet) => {
    scriptConnector.sendPacket(packet);
  });
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'ISOLATED',
  allFrames: false,
  main: () => {
    const scriptConnector = new BufferedWindowConnector({
      window,
      location: 'CONTENT_SCRIPT',
    }).connect();

    const serviceWorkerConnector = new ServiceWorkerConnector({
      channelName: 'CONTENT_SCRIPT_CHANNEL',
    }).connect();

    isolatedScript(scriptConnector, serviceWorkerConnector);
  },
});
