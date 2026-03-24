<template>
  <div class="min-h-screen flex flex-col">
    <TheHeader />
    <main class="flex-1">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
// Initialize stores on layout mount
const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(() => {
  authStore.init()
  cartStore.init()
})
</script>
