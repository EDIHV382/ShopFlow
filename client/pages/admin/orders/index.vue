<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h2 class="text-2xl font-bold text-white">Pedidos</h2>

      <!-- Status filter -->
      <select v-model="filterStatus" class="input !w-auto text-sm" @change="load">
        <option value="">Todos los estados</option>
        <option value="pending">Pendientes</option>
        <option value="processing">Procesando</option>
        <option value="shipped">Enviados</option>
        <option value="delivered">Entregados</option>
        <option value="cancelled">Cancelados</option>
      </select>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="skeleton h-20 rounded-2xl" />
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-dark-800 border-b border-dark-700">
            <tr>
              <th class="text-left px-4 py-3 text-dark-300">#</th>
              <th class="text-left px-4 py-3 text-dark-300">Cliente</th>
              <th class="text-left px-4 py-3 text-dark-300">Fecha</th>
              <th class="text-right px-4 py-3 text-dark-300">Total</th>
              <th class="text-center px-4 py-3 text-dark-300">Estado</th>
              <th class="text-center px-4 py-3 text-dark-300">Actualizar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-dark-800/50 transition-colors">
              <td class="px-4 py-3 font-mono text-dark-300">#{{ order.id }}</td>
              <td class="px-4 py-3">
                <p class="font-medium text-dark-100">{{ order.user_name || 'Sin usuario' }}</p>
                <p class="text-xs text-dark-500">{{ order.user_email }}</p>
              </td>
              <td class="px-4 py-3 text-dark-400 text-xs">{{ formatDate(order.created_at) }}</td>
              <td class="px-4 py-3 text-right font-bold text-white">{{ formatPrice(order.total) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="statusBadge(order.status as any)">{{ statusLabel(order.status as any) }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <select
                  v-model="order.status"
                  class="input !w-auto text-xs"
                  @change="updateStatus(order)"
                  :disabled="order.status === 'delivered' || order.status === 'cancelled'"
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Pagination v-if="meta" :current-page="page" :total-pages="meta.totalPages" @change="load" />
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus, PaginatedResponse } from '~/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Pedidos — ShopFlow Admin' })

const api = useApi()
const orders = ref<(Order & { user_name: string; user_email: string })[]>([])
const meta = ref<PaginatedResponse<Order>['meta'] | null>(null)
const loading = ref(true)
const filterStatus = ref('')
const page = ref(1)

function formatPrice(p: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(p) }
function formatDate(d: string) { return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) }
function statusBadge(s: OrderStatus) { const m: Record<string,string> = { pending:'badge-pending', processing:'badge-processing', shipped:'badge-shipped', delivered:'badge-delivered', cancelled:'badge-cancelled' }; return m[s]||'badge' }
function statusLabel(s: OrderStatus) { const m: Record<string,string> = { pending:'⏳ Pendiente', processing:'🔄 Procesando', shipped:'🚚 Enviado', delivered:'✅ Entregado', cancelled:'❌ Cancelado' }; return m[s]||s }

async function load(newPage = 1) {
  page.value = newPage
  loading.value = true
  const params: Record<string, string | number> = { page: page.value, limit: 20 }
  if (filterStatus.value) params.status = filterStatus.value
  const result = await api.get<PaginatedResponse<Order>>('/admin/orders', params)
  orders.value = result.data as any
  meta.value = result.meta
  loading.value = false
}

async function updateStatus(order: Order) {
  await api.patch(`/admin/orders/${order.id}/status`, { status: order.status })
}

onMounted(() => load())
</script>
