// Root ESLint configuration for ShopFlow monorepo
// Covers: API (JS/CommonJS), Client (Vue 3 + TypeScript)
'use strict';

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    'no-console': 'off', // used for API logging
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-throw-literal': 'error',
  },
  overrides: [
    // ── TypeScript files (client source) ─────────────────────────────────────
    {
      files: [
        'client/**/*.ts',
        'client/**/*.tsx',
        'scripts/**/*.ts',
        'api/**/*.ts',
        'server-logic/**/*.ts',
        '*.ts',
        'tests/**/*.ts',
        'e2e/**/*.ts',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-unused-vars': 'off', // defer to @typescript-eslint/no-unused-vars
      },
    },
    // ── Vue SFC files ─────────────────────────────────────────────────────────
    {
      files: ['client/**/*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint', 'vue'],
      extends: [
        'eslint:recommended',
        'plugin:vue/vue3-essential',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-v-html': 'warn',
        'vue/html-self-closing': ['warn', { html: { void: 'always', normal: 'always' } }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
        'no-unused-vars': 'off',
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
    // ── API compiled JS / test files ─────────────────────────────────────────
    {
      files: ['api/**/*.js', 'api/**/*.cjs'],
      env: { node: true, commonjs: true },
      parserOptions: { ecmaVersion: 2022 },
      rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      },
    },
    // ── Test files (Vitest) ───────────────────────────────────────────────────
    {
      files: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js'],
      env: { node: true },
      globals: {
        vi: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
  // Ignore compiled / generated output and heavy dirs
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'client/.output/',
    'client/.nuxt/',
    'coverage/',
    'playwright-report/',
    'server/vendor/',
    'yarn.lock',
    'package-lock.json',
  ],
};
