import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    typeAware: true,
  },
  plugins: ['oxc', 'unicorn', 'react', 'promise', 'react-perf', 'typescript'],
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
    'typescript/no-confusing-void-expression': 'error',
    'typescript/promise-function-async': 'error',
    'no-promise-executor-return': 'error',
    'no-nested-ternary': 'error',
    'curly': ['error', 'all'],
    'typescript/consistent-type-definitions': ['error', 'type'],
    'import/no-default-export': 'error',
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
