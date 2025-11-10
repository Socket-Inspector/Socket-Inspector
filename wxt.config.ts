import tailwindcss from '@tailwindcss/vite';
import { defineConfig, UserManifest } from 'wxt';

// @see https://wxt.dev/api/config.html
export default defineConfig({
  imports: false,
  modules: ['@wxt-dev/module-react'],
  react: {
    vite: {
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    },
  },
  manifest: ({ mode }) => {
    const config: UserManifest = {
      name: 'Socket Inspector',
      description:
        'Simulate edge cases, reproduce bugs, and uncover security vulnerabilities in WebSocket Applications.',
      host_permissions: ['*://*/*'],
      web_accessible_resources: [
        {
          resources: ['injectedScript.js'],
          matches: ['*://*/*'],
        },
      ],
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
    plugins: [tailwindcss()],
  }),
});
