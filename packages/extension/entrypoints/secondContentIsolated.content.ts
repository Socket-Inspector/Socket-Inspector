import { defineContentScript } from '#imports';
import { WindowConnector } from '@/utils/windowMessaging';
import { ContentScriptDefinition } from 'wxt';

const main: ContentScriptDefinition['main'] = async () => {
  const connector = new WindowConnector({
    window,
    location: 'CONTENT_SCRIPT'
  }).connect();
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'ISOLATED',
  allFrames: false,
  main,
});