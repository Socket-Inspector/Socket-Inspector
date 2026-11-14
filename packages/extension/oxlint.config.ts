import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    typeAware: true,
  },
  plugins: ['oxc', 'react', 'promise', 'react-perf', 'typescript'],
  categories: {
    correctness: 'error',
  },
  rules: {
    'no-var': 'error',
    'no-shadow': 'error',
    'react/rules-of-hooks': 'error',
    'react/incompatible-library': 'off',
    'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    'typescript/no-import-type-side-effects': 'error',
    'typescript/no-confusing-void-expression': 'warn',
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
