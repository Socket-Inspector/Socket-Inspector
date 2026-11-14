import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    typeAware: true,
  },
  plugins: ['oxc', 'promise', 'typescript'],
  categories: {
    correctness: 'error',
  },
  rules: {
    'no-var': 'error',
    'no-shadow': 'error',
    'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    'typescript/no-import-type-side-effects': 'error',
    'typescript/no-confusing-void-expression': 'error',
  },
  ignorePatterns: ['output/**'],
});
