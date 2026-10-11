import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, type UserManifest } from 'wxt';

// @see https://wxt.dev/api/config.html
export default defineConfig({
  imports: false,
  modules: ['@wxt-dev/module-react'],
  manifest: ({ mode }) => {
    const config: UserManifest = {
      name: 'Socket Inspector - WebSocket Debugging Tools',
      short_name: 'Socket Inspector',
      description:
        'Debug WebSockets in Chrome DevTools. Inspect traffic, send custom messages, and simulate server disconnections.',
      host_permissions: ['*://*/*'],
      permissions: ['storage'],
      minimum_chrome_version: '102',
    };

    if (mode === 'development') {
      // relax CSP for dev mode (need to allow vite dev server)
      // TODO: try automatic browser startup now that this is added
      config['content_security_policy'] = {
        extension_pages:
          "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline' http://localhost:3000;",
      };
    }

    return config;
  },
  vite: () => ({
    plugins: [tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
    build: {
      rolldownOptions: {
        output: {
          // Background and content scripts are bundled as classic (non-module) scripts, and Vite 8 no longer
          // adds "use strict" to them like Vite 7 did. Force it so they keep running in strict mode.
          strict: true,
        },
      },
    },
    worker: {
      rolldownOptions: {
        output: {
          // Web workers (Monaco's editor and JSON workers) are built separately from `build`, so they need the same fix.
          // as the background and content scripts above
          strict: true,
        },
      },
    },
  }),
  outDir: process.env.CUSTOM_OUT_DIR || '.output',
});
