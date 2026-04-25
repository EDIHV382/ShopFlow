<template>
  <div class="container-page py-10">
    <h1 class="text-3xl font-bold text-white mb-8">📋 Mis pedidos</h1>

    <!-- Success toast after checkout -->
    <div
      v-if="justOrdered"
      class="card p-4 mb-6 border-green-500/30 bg-green-500/10 flex items-center gap-3 animate-slide-down"
    >
      <span class="text-2xl">🎉</span>
      <div>
        <p class="font-semibold text-green-400">¡Pedido confirmado!</p>
        <p class="text-sm text-dark-400">Tu pago fue procesado exitosamente.</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="skeleton h-28 rounded-2xl" />
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-24">
      <div class="text-5xl mb-4">📭</div>
      <h2 class="text-xl font-semibold text-dark-200 mb-3">Aún no tienes pedidos</h2>
      <NuxtLink to="/products" class="btn btn-primary btn-md">Empezar a comprar</NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <NuxtLink
        v-for="order in orders"
        :key="order.id"
        :to="`/orders/${order.id}`"
        class="card-hover p-5 block"
      >
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p class="text-xs text-dark-500 mb-1">Pedido #{{ order.id }}</p>
            <p class="font-semibold text-dark-100">{{ formatDate(order.created_at) }}</p>
            <p class="text-sm text-dark-400 mt-1">{{ order.items?.length ?? 0 }} artículo(s)</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-white mb-2">{{ formatPrice(order.total) }}</p>
            <span :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus } from '~/types';

definePageMeta({ layout: 'default', middleware: 'auth' });
useSeoMeta({ title: 'Mis pedidos — ShopFlow' });

const route = useRoute();
const api = useApi();
const orders = ref<Order[]>([]);
const loading = ref(true);
const justOrdered = computed(() => route.query.success === 'true');

function formatPrice(p: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(p);
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function statusBadge(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'badge-pending',
    processing: 'badge-processing',
    shipped: 'badge-shipped',
    delivered: 'badge-delivered',
    cancelled: 'badge-cancelled',
  };
  return map[s] || 'badge';
}
function statusLabel(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: '⏳ Pendiente',
    processing: '🔄 Procesando',
    shipped: '🚚 Enviado',
    delivered: '✅ Entregado',
    cancelled: '❌ Cancelado',
  };
  return map[s] || s;
}

onMounted(async () => {
  orders.value = await api.get<Order[]>('/orders');
  loading.value = false;
});
</script>
