import { defineContentScript } from '#imports';
import { WindowConnector } from '@/utils/windowMessaging';
import { MainWorldContentScriptDefinition } from 'wxt';

const main: MainWorldContentScriptDefinition['main'] = async () => {
   const connector = new WindowConnector({
     window,
     location: 'INJECTED_SCRIPT',
   }).connect();
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'MAIN',
  allFrames: false,
  main
});