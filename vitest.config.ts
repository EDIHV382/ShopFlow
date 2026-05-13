import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['api/**/*.test.ts', 'api/**/*.spec.ts'],
    exclude: ['node_modules', '.nuxt', '.output', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['api/**/*.ts'],
      exclude: ['api/_lib/init-db.ts', 'api/_lib/seed.ts'],
    },
  },
});
