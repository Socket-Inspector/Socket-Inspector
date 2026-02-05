import { defineContentScript, injectScript } from '#imports';
import { ContentScriptDefinition } from 'wxt';

const main: ContentScriptDefinition['main'] = async () => {
 
};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'ISOLATED',
  // only inject into top frame, not sub-frames (<iframe> not supported currently)
  allFrames: false,
  main,
});