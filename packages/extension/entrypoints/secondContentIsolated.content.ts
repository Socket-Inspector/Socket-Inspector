import { defineContentScript } from '#imports';
import { ServiceWorkerConnector } from '@/utils/serviceWorkerMessaging';
import { WindowConnector } from '@/utils/windowMessaging';
import { ContentScriptDefinition } from 'wxt';

const main: ContentScriptDefinition['main'] = async () => {
  const scriptConnector = new WindowConnector({
    window,
    location: 'CONTENT_SCRIPT'
  }).connect();

  const serviceWorkerConnector = new ServiceWorkerConnector({
    channelName: 'CONTENT_SCRIPT_CHANNEL',
  }).connect();

  scriptConnector.subscribe(packet => {
    serviceWorkerConnector.sendPacket(packet);
  });

  serviceWorkerConnector.subscribe(packet => {
    scriptConnector.sendPacket(packet);
  });
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'ISOLATED',
  allFrames: false,
  main,
});