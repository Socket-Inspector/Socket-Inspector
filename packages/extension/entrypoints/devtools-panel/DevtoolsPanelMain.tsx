import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './DevtoolsPanelApp.tsx';
import { ServiceWorkerConnector } from '@/utils/serviceWorkerMessaging.ts';
import { browser } from '#imports';
import { SocketStateProvider } from '@/hooks/useSocketState/useSocketState.tsx';

/**
 * Monaco imports
 * @see monaco: https://github.com/microsoft/monaco-editor
 * @see monaco-react: https://github.com/suren-atoyan/monaco-react
 */
import { loader } from '@monaco-editor/react';
import { monaco } from './monaco-small.ts';
import { DevtoolsThemeProvider } from '@/hooks/useDevtoolsTheme.tsx';

const tabId = import.meta.env.VITE_MOCK_TAB_ID
  ? parseInt(import.meta.env.VITE_MOCK_TAB_ID)
  : browser.devtools.inspectedWindow.tabId;

const serviceWorkerConnector = new ServiceWorkerConnector({
  channelName: `DEVTOOLS_CHANNEL:${tabId}`,
}).connect();

loader.config({ monaco });

loader.init().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
    <DevtoolsThemeProvider>
      <SocketStateProvider serviceWorkerConnector={serviceWorkerConnector}>
        <App></App>
      </SocketStateProvider>
    </DevtoolsThemeProvider>,
    // </React.StrictMode>,
  );
});
