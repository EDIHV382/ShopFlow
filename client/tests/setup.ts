import { config } from '@nuxt/test-utils';
import { beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock $fetch
const mockFetch = vi.fn();
Object.defineProperty(global, '$fetch', { value: mockFetch });

beforeEach(() => {
  config.mocks = {
    $fetch: mockFetch,
  };
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  mockFetch.mockClear();
});
