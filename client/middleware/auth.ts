// Middleware: auth — redirects unauthenticated users to /auth/login
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Initialize auth from localStorage on client
  if (process.client) {
    authStore.init()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
