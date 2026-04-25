// composable: useApi — wraps $fetch with base URL and auth headers
export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    return headers;
  }

  async function get<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== null && v !== '')
              .map(([k, v]) => [k, String(v)]),
          ),
        ).toString()
      : '';

    return $fetch<T>(`${config.public.apiBase}/api${path}${query}`, {
      headers: getHeaders(),
    });
  }

  async function post<T>(
    path: string,
    body?: Record<string, unknown> | FormData | null,
  ): Promise<T> {
    return $fetch<T>(`${config.public.apiBase}/api${path}`, {
      method: 'POST',
      body,
      headers: getHeaders(),
    });
  }

  async function put<T>(
    path: string,
    body?: Record<string, unknown> | FormData | null,
  ): Promise<T> {
    return $fetch<T>(`${config.public.apiBase}/api${path}`, {
      method: 'PUT',
      body,
      headers: getHeaders(),
    });
  }

  async function patch<T>(
    path: string,
    body?: Record<string, unknown> | FormData | null,
  ): Promise<T> {
    return $fetch<T>(`${config.public.apiBase}/api${path}`, {
      method: 'PATCH',
      body,
      headers: getHeaders(),
    });
  }

  async function del(path: string): Promise<void> {
    await $fetch(`${config.public.apiBase}/api${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  }

  return { get, post, put, patch, del };
}
