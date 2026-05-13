module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
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
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['client/**/*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
      },
      extends: ['plugin:vue/vue3-recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-v-html': 'warn',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '.nuxt/', '.output/', '*.d.ts'],
};
