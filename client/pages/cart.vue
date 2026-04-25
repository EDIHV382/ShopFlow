<template>
  <div class="container-page py-10">
    <h1 class="text-3xl font-bold text-white mb-8">🛒 Mi carrito</h1>

    <!-- Empty cart -->
    <div v-if="cartStore.isEmpty" class="text-center py-24">
      <div class="text-6xl mb-6">🛍️</div>
      <h2 class="text-xl font-semibold text-dark-200 mb-3">Tu carrito está vacío</h2>
      <p class="text-dark-500 mb-8">¡Explora nuestro catálogo y encuentra algo que te guste!</p>
      <NuxtLink to="/products" class="btn btn-primary btn-lg">Ir al catálogo</NuxtLink>
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-8">
      <!-- Items -->
      <div class="lg:col-span-2 space-y-3">
        <CartItem v-for="item in cartStore.items" :key="item.product_id" :item="item" />

        <button
          @click="showClearModal = true"
          class="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 mt-2"
        >
          🗑️ Vaciar carrito
        </button>
      </div>

      <!-- Order Summary -->
      <aside>
        <div class="card p-6 sticky top-20 space-y-5">
          <h2 class="font-bold text-dark-100 text-lg">Resumen del pedido</h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-dark-300">
              <span>Subtotal ({{ cartStore.itemCount }} artículos)</span>
              <span>{{ formatPrice(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-dark-300">
              <span>Envío</span>
              <span class="text-green-400 font-medium">Gratis</span>
            </div>
            <div class="h-px bg-dark-800" />
            <div class="flex justify-between text-base font-bold text-white">
              <span>Total</span>
              <span class="gradient-text text-xl">{{ formatPrice(cartStore.subtotal) }}</span>
            </div>
          </div>

          <NuxtLink to="/checkout" class="btn btn-primary btn-md w-full">
            Proceder al pago →
          </NuxtLink>

          <NuxtLink to="/products" class="btn btn-secondary btn-sm w-full text-center">
            ← Seguir comprando
          </NuxtLink>

          <div class="flex items-center gap-2 justify-center text-xs text-dark-500">
            <span>🔒</span>
            <span>Pago seguro con Stripe SSL</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- Clear cart modal -->
    <ConfirmModal
      :show="showClearModal"
      title="Vaciar carrito"
      message="¿Seguro que quieres eliminar todos los productos del carrito?"
      icon="🗑️"
      confirm-text="Vaciar"
      :danger-confirm="true"
      @confirm="clearCart"
      @cancel="showClearModal = false"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });
useSeoMeta({ title: 'Mi carrito — ShopFlow' });

const cartStore = useCartStore();
const showClearModal = ref(false);

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(price);
}

function clearCart() {
  cartStore.clearCart();
  showClearModal.value = false;
}
</script>
