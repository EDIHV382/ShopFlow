// Middleware: admin — requires ROLE_ADMIN
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  if (process.client) {
    authStore.init();
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login');
  }

  if (!authStore.isAdmin) {
    return navigateTo('/');
  }
});
