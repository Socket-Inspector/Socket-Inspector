import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    typeAware: true,
  },
  plugins: ['oxc', 'unicorn', 'promise', 'typescript'],
  categories: {
    correctness: 'error',
  },
  rules: {
    'no-var': 'error',
    'no-shadow': 'error',
    'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    'typescript/no-import-type-side-effects': 'error',
    'typescript/no-confusing-void-expression': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/promise-function-async': 'error',
    'no-promise-executor-return': 'error',
    'no-nested-ternary': 'error',
    curly: ['error', 'all'],
    'typescript/consistent-type-definitions': ['error', 'type'],
    'import/no-default-export': 'error',
    'array-callback-return': 'error',
    'no-return-assign': 'error',
    'import/no-cycle': 'error',
  },
  ignorePatterns: ['output/**'],
});
