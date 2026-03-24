<template>
  <div class="container-page py-10">
    <div v-if="loading" class="grid md:grid-cols-2 gap-12">
      <div class="skeleton aspect-square rounded-2xl" />
      <div class="space-y-4">
        <div class="skeleton h-8 w-3/4 rounded-xl" />
        <div class="skeleton h-4 w-full rounded-xl" />
        <div class="skeleton h-4 w-2/3 rounded-xl" />
        <div class="skeleton h-10 w-32 rounded-xl" />
      </div>
    </div>

    <div v-else-if="product" class="grid md:grid-cols-2 gap-12">
      <!-- Gallery -->
      <div>
        <div class="aspect-square rounded-2xl overflow-hidden bg-dark-800 mb-4 relative group">
          <img
            :src="mainImage"
            :alt="product.name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
            @click="zoomed = !zoomed"
          />
          <div v-if="product.stock === 0" class="absolute top-4 left-4">
            <span class="badge-sold-out px-4 py-2 text-sm font-bold backdrop-blur-sm">Agotado</span>
          </div>
        </div>
        <!-- Thumbnails -->
        <div v-if="product.images.length > 1" class="grid grid-cols-4 gap-3">
          <button
            v-for="(img, i) in product.images"
            :key="i"
            @click="mainImage = img"
            :class="['aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200', mainImage === img ? 'border-primary-500' : 'border-dark-800 hover:border-dark-600']"
          >
            <img :src="img" :alt="`Vista ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="space-y-6">
        <div>
          <NuxtLink v-if="product.category_name" :to="`/products?category=${product.category_slug}`"
            class="text-xs text-primary-400 font-semibold uppercase tracking-widest hover:text-primary-300">
            {{ product.category_name }}
          </NuxtLink>
          <h1 class="text-3xl font-bold text-white mt-2 leading-tight">{{ product.name }}</h1>
        </div>

        <div class="text-4xl font-extrabold gradient-text">{{ formatPrice(product.price) }}</div>

        <div>
          <span :class="stockBadgeClass">
            {{ product.stock > 0 ? `✓ En stock (${product.stock} disponibles)` : '✗ Sin stock' }}
          </span>
        </div>

        <p class="text-dark-400 leading-relaxed">{{ product.description }}</p>

        <!-- Quantity + Add to cart -->
        <div v-if="product.stock > 0" class="flex items-center gap-4">
          <div class="flex items-center gap-3 card px-4 py-2">
            <button @click="qty = Math.max(1, qty - 1)" class="text-dark-400 hover:text-white font-bold text-lg transition-colors">−</button>
            <span class="text-white font-semibold w-8 text-center">{{ qty }}</span>
            <button @click="qty = Math.min(product.stock, qty + 1)" class="text-dark-400 hover:text-white font-bold text-lg transition-colors">+</button>
          </div>
          <button @click="addToCart" :disabled="adding" class="btn btn-primary btn-lg flex-1">
            {{ adding ? '✓ Agregado!' : '🛒 Agregar al carrito' }}
          </button>
        </div>
        <button v-else disabled class="btn btn-secondary btn-lg w-full opacity-50 cursor-not-allowed">
          Producto agotado
        </button>

        <!-- Go to cart -->
        <NuxtLink v-if="cartStore.getItemQuantity(product.id) > 0" to="/cart"
          class="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
          Ver carrito ({{ cartStore.getItemQuantity(product.id) }} en carrito) →
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-center py-24">
      <div class="text-5xl mb-4">😕</div>
      <h2 class="text-xl font-bold text-dark-200 mb-4">Producto no encontrado</h2>
      <NuxtLink to="/products" class="btn btn-primary btn-md">← Volver al catálogo</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

definePageMeta({ layout: 'default' })

const route = useRoute()
const api = useApi()
const cartStore = useCartStore()

const product = ref<Product | null>(null)
const loading = ref(true)
const mainImage = ref('')
const qty = ref(1)
const adding = ref(false)
const zoomed = ref(false)

const stockBadgeClass = computed(() =>
  product.value?.stock! > 0
    ? 'badge bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1'
    : 'badge-sold-out px-3 py-1'
)

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(price)
}

onMounted(async () => {
  try {
    product.value = await api.get<Product>(`/products/${route.params.id}`)
    mainImage.value = product.value.images?.[0] || ''

    useSeoMeta({
      title: `${product.value.name} — ShopFlow`,
      description: product.value.description.slice(0, 160),
      ogTitle: product.value.name,
      ogDescription: product.value.description.slice(0, 160),
      ogImage: product.value.images?.[0],
    })
  } finally {
    loading.value = false
  }
})

async function addToCart() {
  if (!product.value) return
  adding.value = true
  cartStore.addItem(product.value, qty.value)
  setTimeout(() => { adding.value = false }, 1500)
}
</script>
