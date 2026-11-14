import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    typeAware: true,
  },
  plugins: ['react', 'promise', 'react-perf', 'typescript'],
  categories: {
    correctness: 'error',
  },
  rules: {
    'no-var': 'error',
    'react/rules-of-hooks': 'error',
    'react/incompatible-library': 'off',
    'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    'typescript/no-import-type-side-effects': 'error',
  },
  ignorePatterns: ['playwright/test-app/**', 'components/shadcn', 'hooks/useIsMobile.ts'],
  overrides: [
    {
      files: ['playwright/fixtures.ts'],
      rules: {
        'react/rules-of-hooks': 'off',
      },
    },
  ],
});
