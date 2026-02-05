import { defineContentScript, injectScript } from '#imports';
import { MainWorldContentScriptDefinition } from 'wxt';

const main: MainWorldContentScriptDefinition['main'] = async () => {
 
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main
});