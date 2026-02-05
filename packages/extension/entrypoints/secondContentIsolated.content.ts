import { defineContentScript } from '#imports';
import { ContentScriptDefinition } from 'wxt';

const main: ContentScriptDefinition['main'] = async () => {
 
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'ISOLATED',
  allFrames: false,
  main,
});