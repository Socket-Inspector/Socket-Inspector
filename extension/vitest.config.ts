import { defineConfig, configDefaults } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    exclude: [...configDefaults.exclude, '**/playwright/**'],
    environment: 'node',
    // .spec.tsx files will use happy dom
    // TODO: environmentMatchGlobs is deprecated
    environmentMatchGlobs: [['**/*.spec.tsx', 'happy-dom']],
  },
});
