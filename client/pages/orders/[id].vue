<template>
  <div class="container-page py-10 max-w-3xl">
    <div v-if="loading" class="space-y-4">
      <div class="skeleton h-12 w-48 rounded-xl" />
      <div class="skeleton h-40 rounded-2xl" />
      <div class="skeleton h-64 rounded-2xl" />
    </div>

    <template v-else-if="order">
      <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p class="text-xs text-dark-500 mb-1">Pedido</p>
          <h1 class="text-3xl font-bold text-white">#{{ order.id }}</h1>
          <p class="text-sm text-dark-400 mt-1">{{ formatDate(order.created_at) }}</p>
        </div>
        <span :class="statusBadge(order.status)" class="text-sm px-4 py-2">{{ statusLabel(order.status) }}</span>
      </div>

      <!-- Order items -->
      <div class="card p-5 mb-6">
        <h2 class="font-bold text-dark-100 mb-4">Artículos</h2>
        <div class="space-y-4">
          <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
              <img v-if="item.product_images?.[0]" :src="item.product_images[0]" :alt="item.product_name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-dark-100">{{ item.product_name }}</p>
              <p class="text-xs text-dark-500">{{ formatPrice(item.unit_price) }} × {{ item.quantity }}</p>
            </div>
            <p class="font-bold text-white">{{ formatPrice(item.unit_price * item.quantity) }}</p>
          </div>
        </div>
        <div class="h-px bg-dark-800 mt-4 mb-3" />
        <div class="flex justify-between font-bold text-white text-lg">
          <span>Total</span>
          <span class="gradient-text">{{ formatPrice(order.total) }}</span>
        </div>
      </div>

      <!-- Shipping info -->
      <div class="card p-5">
        <h2 class="font-bold text-dark-100 mb-4">Dirección de envío</h2>
        <div class="text-sm text-dark-300 space-y-1">
          <p class="font-semibold text-dark-100">{{ order.shipping_address.fullName }}</p>
          <p>{{ order.shipping_address.address }}</p>
          <p>{{ order.shipping_address.city }}, {{ order.shipping_address.state }} {{ order.shipping_address.postalCode }}</p>
          <p>{{ order.shipping_address.country }}</p>
          <p class="text-dark-400">📞 {{ order.shipping_address.phone }}</p>
        </div>
      </div>

      <div class="mt-6 flex gap-3">
        <NuxtLink to="/orders" class="btn btn-secondary btn-md">← Mis pedidos</NuxtLink>
        <NuxtLink to="/products" class="btn btn-primary btn-md">Seguir comprando</NuxtLink>
      </div>
    </template>

    <div v-else class="text-center py-16">
      <p class="text-dark-400">Pedido no encontrado.</p>
      <NuxtLink to="/orders" class="btn btn-secondary btn-md mt-4">← Volver</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus } from '~/types'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const api = useApi()
const order = ref<Order | null>(null)
const loading = ref(true)

function formatPrice(p: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(p) }
function formatDate(d: string) { return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
function statusBadge(s: OrderStatus): string { const m: Record<string,string> = { pending:'badge-pending', processing:'badge-processing', shipped:'badge-shipped', delivered:'badge-delivered', cancelled:'badge-cancelled' }; return m[s]||'badge' }
function statusLabel(s: OrderStatus): string { const m: Record<string,string> = { pending:'⏳ Pendiente', processing:'🔄 Procesando', shipped:'🚚 Enviado', delivered:'✅ Entregado', cancelled:'❌ Cancelado' }; return m[s]||s }

useSeoMeta({ title: `Pedido #${route.params.id} — ShopFlow` })

onMounted(async () => {
  order.value = await api.get<Order>(`/orders/${route.params.id}`)
  loading.value = false
})
</script>
