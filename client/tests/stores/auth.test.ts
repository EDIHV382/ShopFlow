import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../stores/auth';

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({ public: { apiBase: 'http://localhost:3000' } }),
}));

const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    mockFetch.mockReset();
  });

  it('initializes with default state', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isAdmin).toBe(false);
  });

  it('loads from localStorage on init', () => {
    const mockUser = { id: 1, name: 'Test', email: 'test@test.com', roles: ['ROLE_USER'] };
    localStorage.setItem('shopflow_token', 'fake-token');
    localStorage.setItem('shopflow_user', JSON.stringify(mockUser));

    const store = useAuthStore();
    store.init();

    expect(store.token).toBe('fake-token');
    expect(store.user).toEqual(mockUser);
    expect(store.isAuthenticated).toBe(true);
    expect(store.isAdmin).toBe(false);
  });

  it('handles invalid localStorage gracefully', () => {
    localStorage.setItem('shopflow_token', 'fake-token');
    localStorage.setItem('shopflow_user', 'invalid-json');

    const store = useAuthStore();
    store.init();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
  });

  it('login updates state and localStorage on success', async () => {
    const mockAuthResponse = {
      token: 'new-token',
      user: { id: 2, name: 'Admin', email: 'admin@test.com', roles: ['ROLE_ADMIN'] },
    };
    mockFetch.mockResolvedValueOnce(mockAuthResponse);

    const store = useAuthStore();
    await store.login('admin@test.com', 'password');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      expect.any(Object),
    );
    expect(store.token).toBe('new-token');
    expect(store.isAdmin).toBe(true);
    expect(localStorage.getItem('shopflow_token')).toBe('new-token');
  });

  it('logout clears state and localStorage', async () => {
    const store = useAuthStore();
    store.token = 'existing-token';
    store.user = {
      id: 1,
      name: 'Test',
      email: 'test@test.com',
      roles: ['ROLE_USER'],
      created_at: '',
    };

    mockFetch.mockResolvedValueOnce({ success: true });

    await store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('shopflow_token')).toBeNull();
  });
});
