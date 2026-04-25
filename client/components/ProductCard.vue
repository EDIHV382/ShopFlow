<template>
  <article
    @click="navigateTo(`/products/${product.id}`)"
    class="card-hover cursor-pointer group overflow-hidden"
  >
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden rounded-t-2xl bg-dark-800">
      <NuxtImg
        v-if="product.images?.[0]"
        :src="product.images[0]"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        format="webp"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-4xl">📦</div>

      <!-- Sold out overlay -->
      <div
        v-if="product.stock === 0"
        class="absolute inset-0 bg-dark-950/70 flex items-center justify-center"
      >
        <span class="badge-sold-out px-4 py-2 text-sm font-bold backdrop-blur-sm">Agotado</span>
      </div>

      <!-- Category badge -->
      <div v-if="product.category_name" class="absolute top-3 left-3">
        <span class="badge bg-dark-900/80 text-dark-300 backdrop-blur-sm text-xs">
          {{ product.category_name }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3
        class="font-semibold text-dark-100 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors"
      >
        {{ product.name }}
      </h3>
      <p class="text-xs text-dark-500 line-clamp-2 mb-3">{{ product.description }}</p>

      <div class="flex items-center justify-between">
        <span class="text-lg font-bold text-white">{{ formatPrice(product.price) }}</span>
        <span
          :class="product.stock > 0 ? 'text-green-400' : 'text-red-400'"
          class="text-xs font-medium"
        >
          {{ product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock' }}
        </span>
      </div>

      <!-- Add to cart button -->
      <button
        v-if="product.stock > 0"
        @click.stop="handleAddToCart"
        :disabled="adding"
        class="mt-3 w-full btn btn-primary btn-sm"
      >
        <span v-if="adding">✓ Agregado</span>
        <span v-else>+ Agregar al carrito</span>
      </button>
      <button
        v-else
        disabled
        class="mt-3 w-full btn btn-secondary btn-sm opacity-50 cursor-not-allowed"
      >
        Sin stock
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/types';

interface Props {
  product: Product;
}
const props = defineProps<Props>();
const cartStore = useCartStore();
const adding = ref(false);

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(price);
}

async function handleAddToCart() {
  adding.value = true;
  cartStore.addItem(props.product, 1);
  setTimeout(() => {
    adding.value = false;
  }, 1200);
}
</script>
