<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-white">Dashboard</h2>

    <!-- Metric Cards -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="i in 4" :key="i" class="skeleton h-28 rounded-2xl" />
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="card p-5">
        <div class="text-2xl mb-2">💰</div>
        <div class="text-2xl font-extrabold text-white">{{ formatPrice(metrics?.todaySales.total || 0) }}</div>
        <div class="text-xs text-dark-400 mt-1">Ventas hoy ({{ metrics?.todaySales.count }} pedidos)</div>
      </div>
      <div class="card p-5">
        <div class="text-2xl mb-2">⏳</div>
        <div class="text-2xl font-extrabold text-yellow-400">{{ metrics?.pendingOrders }}</div>
        <div class="text-xs text-dark-400 mt-1">Pedidos pendientes</div>
      </div>
      <div class="card p-5">
        <div class="text-2xl mb-2">📦</div>
        <div class="text-2xl font-extrabold text-white">{{ metrics?.totalProducts }}</div>
        <div class="text-xs text-dark-400 mt-1">Total productos</div>
      </div>
      <div class="card p-5">
        <div class="text-2xl mb-2">👥</div>
        <div class="text-2xl font-extrabold text-white">{{ metrics?.totalUsers }}</div>
        <div class="text-xs text-dark-400 mt-1">Usuarios registrados</div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Low stock alert -->
      <div class="card p-5">
        <h3 class="font-bold text-dark-100 mb-4 flex items-center gap-2">⚠️ Stock bajo</h3>
        <div v-if="metrics?.lowStockProducts.length === 0" class="text-sm text-dark-500">Todo el stock está bien ✓</div>
        <div v-else class="space-y-2">
          <div v-for="p in metrics?.lowStockProducts" :key="p.id" class="flex items-center justify-between py-2 border-b border-dark-800 last:border-0">
            <span class="text-sm text-dark-200">{{ p.name }}</span>
            <span :class="p.stock === 0 ? 'badge-sold-out' : 'badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'">
              {{ p.stock === 0 ? 'Agotado' : `${p.stock} uds` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent orders -->
      <div class="card p-5">
        <h3 class="font-bold text-dark-100 mb-4">🕐 Pedidos recientes</h3>
        <div class="space-y-2">
          <div v-for="order in metrics?.recentOrders" :key="order.id" class="flex items-center justify-between py-2 border-b border-dark-800 last:border-0">
            <div>
              <p class="text-sm text-dark-200">#{{ order.id }} · {{ order.user_name }}</p>
              <p class="text-xs text-dark-500">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-white">{{ formatPrice(order.total) }}</p>
              <span :class="statusBadge(order.status as any)" class="text-xs">{{ statusLabel(order.status as any) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardMetrics, OrderStatus } from '~/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Dashboard — ShopFlow Admin' })

const api = useApi()
const metrics = ref<DashboardMetrics | null>(null)
const loading = ref(true)

function formatPrice(p: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(p) }
function formatDate(d: string) { return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) }
function statusBadge(s: OrderStatus) { const m: Record<string,string> = { pending:'badge-pending', processing:'badge-processing', shipped:'badge-shipped', delivered:'badge-delivered', cancelled:'badge-cancelled' }; return m[s]||'badge' }
function statusLabel(s: OrderStatus) { const m: Record<string,string> = { pending:'Pendiente', processing:'Procesando', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' }; return m[s]||s }

onMounted(async () => {
  metrics.value = await api.get<DashboardMetrics>('/admin/dashboard')
  loading.value = false
})
</script>
