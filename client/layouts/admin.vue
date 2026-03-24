<template>
  <div class="min-h-screen flex bg-dark-950">
    <!-- Sidebar -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-50 flex flex-col bg-dark-900 border-r border-dark-800 transition-all duration-300',
      sidebarOpen ? 'w-64' : 'w-16',
    ]">
      <!-- Logo -->
      <div class="flex items-center gap-3 h-16 px-4 border-b border-dark-800">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-sm">S</span>
        </div>
        <span v-if="sidebarOpen" class="font-bold gradient-text text-lg transition-opacity duration-200">ShopFlow</span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <AdminNavLink :to="'/admin/dashboard'" :icon="'🏠'" :label="'Dashboard'" :open="sidebarOpen" />
        <AdminNavLink :to="'/admin/products'" :icon="'📦'" :label="'Productos'" :open="sidebarOpen" />
        <AdminNavLink :to="'/admin/categories'" :icon="'🏷️'" :label="'Categorías'" :open="sidebarOpen" />
        <AdminNavLink :to="'/admin/orders'" :icon="'🛒'" :label="'Pedidos'" :open="sidebarOpen" />
      </nav>

      <!-- Footer -->
      <div class="p-3 border-t border-dark-800">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="w-full flex items-center justify-center p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-dark-100 transition-colors"
        >
          <span class="text-lg">{{ sidebarOpen ? '◀' : '▶' }}</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-16']">
      <!-- Top bar -->
      <header class="h-16 flex items-center justify-between px-6 bg-dark-900 border-b border-dark-800 sticky top-0 z-40">
        <h1 class="font-semibold text-dark-100">{{ pageTitle }}</h1>
        <div class="flex items-center gap-3">
          <span class="text-sm text-dark-400">{{ authStore.userName }}</span>
          <NuxtLink to="/" class="btn btn-secondary btn-sm">← Tienda</NuxtLink>
          <button @click="handleLogout" class="btn btn-secondary btn-sm">Salir</button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AdminLayout' })
definePageMeta({ middleware: 'admin' })

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('dashboard')) return 'Dashboard'
  if (path.includes('products')) return 'Productos'
  if (path.includes('categories')) return 'Categorías'
  if (path.includes('orders')) return 'Pedidos'
  return 'Administración'
})

onMounted(() => {
  authStore.init()
  cartStore.init()
})

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>
