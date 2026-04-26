import { config } from '@nuxt/test-utils';
import { beforeEach } from 'vitest';

beforeEach(() => {
  config.mocks = {
    $fetch: vi.fn(),
  };
});
