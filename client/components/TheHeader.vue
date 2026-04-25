<template>
  <header class="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/80">
    <div class="container-page">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300"
          >
            <span class="text-white font-black text-sm">S</span>
          </div>
          <span class="font-extrabold text-xl gradient-text">ShopFlow</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            to="/products"
            class="px-4 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-dark-800 transition-all duration-200"
          >
            Productos
          </NuxtLink>
          <template v-if="authStore.isAdmin">
            <NuxtLink
              to="/admin/dashboard"
              class="px-4 py-2 rounded-xl text-sm font-medium text-accent-400 hover:bg-accent-500/10 transition-all duration-200"
            >
              Admin
            </NuxtLink>
          </template>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-2">
          <!-- Cart button -->
          <NuxtLink
            to="/cart"
            class="relative p-2.5 rounded-xl hover:bg-dark-800 text-dark-300 hover:text-dark-100 transition-all duration-200 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-primary-500 text-white text-[10px] font-bold rounded-full px-1 animate-scale-in"
            >
              {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
            </span>
          </NuxtLink>

          <!-- Auth buttons -->
          <template v-if="!authStore.isAuthenticated">
            <NuxtLink to="/auth/login" class="btn btn-secondary btn-sm hidden sm:flex">
              Iniciar sesión
            </NuxtLink>
            <NuxtLink to="/auth/register" class="btn btn-primary btn-sm"> Registrarse </NuxtLink>
          </template>

          <template v-else>
            <!-- User menu -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-dark-800 transition-all duration-200"
              >
                <div
                  class="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center"
                >
                  <span class="text-white font-bold text-xs">{{ initials }}</span>
                </div>
                <span class="text-sm font-medium text-dark-200 hidden sm:block max-w-20 truncate">{{
                  authStore.userName
                }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-dark-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Dropdown -->
              <Transition name="dropdown">
                <div
                  v-if="userMenuOpen"
                  class="absolute right-0 top-full mt-2 w-48 card p-1 shadow-xl z-50"
                >
                  <NuxtLink
                    to="/orders"
                    @click="userMenuOpen = false"
                    class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors"
                  >
                    📋 Mis pedidos
                  </NuxtLink>
                  <template v-if="authStore.isAdmin">
                    <NuxtLink
                      to="/admin/dashboard"
                      @click="userMenuOpen = false"
                      class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-accent-400 hover:bg-dark-800 transition-colors"
                    >
                      ⚙️ Administración
                    </NuxtLink>
                  </template>
                  <div class="h-px bg-dark-800 my-1" />
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    🚪 Cerrar sesión
                  </button>
                </div>
              </Transition>
            </div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();
const userMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

const initials = computed(() => {
  const name = authStore.userName;
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
});

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e: MouseEvent) => {
    if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
      userMenuOpen.value = false;
    }
  });
});

async function handleLogout() {
  userMenuOpen.value = false;
  await authStore.logout();
  cartStore.clearCart();
  router.push('/');
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
</style>
