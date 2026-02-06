import { defineContentScript } from '#imports';
import { BufferedWindowConnector } from '@/utils/bufferedWindowConnector';

const mainWorldScript = (scriptConnector: BufferedWindowConnector) => {};

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'MAIN',
  allFrames: false,
  main: () => {
    const scriptConnector = new BufferedWindowConnector({
      window,
      location: 'INJECTED_SCRIPT',
    }).connect();
    
    mainWorldScript(scriptConnector);
  },
});
