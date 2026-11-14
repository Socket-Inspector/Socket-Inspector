import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    typeAware: true,
  },
  plugins: ['promise', 'typescript'],
  categories: {
    correctness: 'error',
  },
  rules: {
    'no-var': 'error',
    'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    'typescript/no-import-type-side-effects': 'error',
  },
  ignorePatterns: ['output/**'],
});
