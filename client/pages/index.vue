<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-24 md:py-36">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-dark-950 to-accent-900/30" />
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

      <div class="container-page relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm text-dark-300">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Más de 50 productos disponibles
        </div>
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
          Tu tienda favorita,<br />
          <span class="gradient-text">ahora online</span>
        </h1>
        <p class="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Descubre productos de calidad en electrónica, moda, hogar, deportes y más.
          Entrega rápida y pagos ultra seguros con Stripe.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/products" class="btn btn-primary btn-lg">
            🛍️ Explorar catálogo
          </NuxtLink>
          <template v-if="!authStore.isAuthenticated">
            <NuxtLink to="/auth/register" class="btn btn-secondary btn-lg">
              Crear cuenta gratis
            </NuxtLink>
          </template>
        </div>

        <!-- Stats -->
        <div class="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          <div class="text-center">
            <div class="text-2xl font-bold text-white">50+</div>
            <div class="text-xs text-dark-500 mt-1">Productos</div>
          </div>
          <div class="text-center border-x border-dark-800">
            <div class="text-2xl font-bold text-white">10</div>
            <div class="text-xs text-dark-500 mt-1">Categorías</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">100%</div>
            <div class="text-xs text-dark-500 mt-1">Seguro</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="py-16 bg-dark-900/50">
      <div class="container-page">
        <h2 class="text-2xl font-bold text-dark-100 mb-8">Explorar categorías</h2>
        <div v-if="categoriesLoading" class="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div v-for="i in 5" :key="i" class="skeleton h-24 rounded-2xl" />
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <NuxtLink
            v-for="cat in categories.slice(0, 10)"
            :key="cat.id"
            :to="`/products?category=${cat.slug}`"
            class="card-hover p-4 text-center group"
          >
            <div class="text-2xl mb-2">{{ getCategoryIcon(cat.slug) }}</div>
            <div class="text-sm font-semibold text-dark-200 group-hover:text-primary-400 transition-colors">{{ cat.name }}</div>
            <div class="text-xs text-dark-500 mt-1">{{ cat.product_count }} productos</div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16">
      <div class="container-page">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-dark-100">Productos destacados</h2>
          <NuxtLink to="/products" class="btn btn-secondary btn-sm">Ver todos →</NuxtLink>
        </div>

        <div v-if="productsLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <SkeletonCard v-for="i in 8" :key="i" />
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-primary-900/30 to-accent-900/30 border-y border-dark-800">
      <div class="container-page text-center">
        <h2 class="text-3xl font-bold text-white mb-4">¿Listo para comprar?</h2>
        <p class="text-dark-400 mb-8">Regístrate ahora y empieza a disfrutar los mejores productos.</p>
        <NuxtLink to="/products" class="btn btn-primary btn-lg shadow-glow">
          🚀 Ir al catálogo completo
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Category, Product, PaginatedResponse } from '~/types'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'ShopFlow — Tu tienda online favorita',
  description: 'Descubre más de 50 productos en electrónica, moda, hogar, deportes y más. Pagos seguros con Stripe.',
  ogTitle: 'ShopFlow — Tu tienda online favorita',
  ogDescription: 'Productos de calidad con entrega rápida.',
  ogImage: '/logo-og.png',
})

const authStore = useAuthStore()
const api = useApi()

const categories = ref<(Category & { product_count: number })[]>([])
const featuredProducts = ref<Product[]>([])
const categoriesLoading = ref(true)
const productsLoading = ref(true)

onMounted(async () => {
  await Promise.all([
    api.get<(Category & { product_count: number })[]>('/categories').then(data => {
      categories.value = data
      categoriesLoading.value = false
    }),
    api.get<PaginatedResponse<Product>>('/products', { limit: 8, sortBy: 'newest' }).then(data => {
      featuredProducts.value = data.data
      productsLoading.value = false
    }),
  ])
})

const categoryIcons: Record<string, string> = {
  'electronica': '💻', 'ropa-moda': '👗', 'hogar-jardin': '🏠', 'deportes': '⚽',
  'libros': '📚', 'juguetes': '🎮', 'belleza-salud': '💄', 'automovil': '🚗',
  'mascotas': '🐾', 'alimentacion': '🍫',
}
function getCategoryIcon(slug: string): string {
  return categoryIcons[slug] || '📦'
}
</script>
