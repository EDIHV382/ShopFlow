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
        <div class="text-2xl font-extrabold text-white">
          {{ formatPrice(metrics?.todaySales.total || 0) }}
        </div>
        <div class="text-xs text-dark-400 mt-1">
          Ventas hoy ({{ metrics?.todaySales.count }} pedidos)
        </div>
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

    <!-- Sales chart -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-dark-100">📈 Ventas últimos {{ chartDays }} días</h3>
        <div class="flex gap-2">
          <button
            v-for="d in [7, 14, 30]"
            :key="d"
            :class="['btn btn-sm px-3', chartDays === d ? 'btn-primary' : 'btn-secondary']"
            @click="setChartDays(d)"
          >
            {{ d }}d
          </button>
        </div>
      </div>

      <div v-if="chartLoading" class="skeleton h-48 rounded-xl" />
      <div v-else class="relative h-48">
        <canvas ref="chartCanvas" />
      </div>

      <!-- totals summary below chart -->
      <div v-if="!chartLoading && chartData.length" class="mt-4 flex gap-6 text-sm">
        <div>
          <span class="text-dark-400">Total período: </span>
          <span class="font-bold text-white">{{ formatPrice(periodTotal) }}</span>
        </div>
        <div>
          <span class="text-dark-400">Pedidos: </span>
          <span class="font-bold text-white">{{ periodOrders }}</span>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Low stock alert -->
      <div class="card p-5">
        <h3 class="font-bold text-dark-100 mb-4 flex items-center gap-2">⚠️ Stock bajo</h3>
        <div v-if="metrics?.lowStockProducts.length === 0" class="text-sm text-dark-500">
          Todo el stock está bien ✓
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="p in metrics?.lowStockProducts"
            :key="p.id"
            class="flex items-center justify-between py-2 border-b border-dark-800 last:border-0"
          >
            <span class="text-sm text-dark-200">{{ p.name }}</span>
            <span
              :class="
                p.stock === 0
                  ? 'badge-sold-out'
                  : 'badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              "
            >
              {{ p.stock === 0 ? 'Agotado' : `${p.stock} uds` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent orders -->
      <div class="card p-5">
        <h3 class="font-bold text-dark-100 mb-4">🕐 Pedidos recientes</h3>
        <div class="space-y-2">
          <div
            v-for="order in metrics?.recentOrders"
            :key="order.id"
            class="flex items-center justify-between py-2 border-b border-dark-800 last:border-0"
          >
            <div>
              <p class="text-sm text-dark-200">#{{ order.id }} · {{ order.user_name }}</p>
              <p class="text-xs text-dark-500">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-white">{{ formatPrice(order.total) }}</p>
              <span :class="statusBadge(order.status as any)" class="text-xs">{{
                statusLabel(order.status as any)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardMetrics, OrderStatus, SalesChartDay } from '~/types';

definePageMeta({ layout: 'admin' });
useSeoMeta({ title: 'Dashboard — ShopFlow Admin' });

const api = useApi();
const metrics = ref<DashboardMetrics | null>(null);
const loading = ref(true);

// Chart
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartData = ref<SalesChartDay[]>([]);
const chartLoading = ref(true);
const chartDays = ref(30);
let chartInstance: unknown = null;

const periodTotal = computed(() => chartData.value.reduce((s, d) => s + d.total, 0));
const periodOrders = computed(() => chartData.value.reduce((s, d) => s + d.orders, 0));

function formatPrice(p: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(p);
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}
function statusBadge(s: OrderStatus) {
  const m: Record<string, string> = {
    pending: 'badge-pending',
    processing: 'badge-processing',
    shipped: 'badge-shipped',
    delivered: 'badge-delivered',
    cancelled: 'badge-cancelled',
  };
  return m[s] || 'badge';
}
function statusLabel(s: OrderStatus) {
  const m: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return m[s] || s;
}

async function loadChart(days: number) {
  chartLoading.value = true;
  try {
    chartData.value = await api.get<SalesChartDay[]>('/admin/sales-chart', { days });
  } finally {
    chartLoading.value = false;
  }
  await nextTick();
  renderChart();
}

async function setChartDays(days: number) {
  chartDays.value = days;
  await loadChart(days);
}

function renderChart() {
  if (!chartCanvas.value) {
    return;
  }
  // Destroy previous instance if any
  if (chartInstance) {
    (chartInstance as { destroy(): void }).destroy();
    chartInstance = null;
  }

  const labels = chartData.value.map((d) => {
    const date = new Date(d.date + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  });
  const totals = chartData.value.map((d) => d.total);

  const Chart = (window as unknown as { Chart: new (...args: unknown[]) => { destroy(): void } })
    .Chart;
  if (!Chart) {
    return;
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Ventas ($)',
          data: totals,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { raw: number }) => `$${ctx.raw.toFixed(2)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#6b7280', maxRotation: 45, font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          ticks: { color: '#6b7280', callback: (v: unknown) => `$${v}` },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  });
}

onMounted(async () => {
  // Load chart.js from CDN if not already loaded
  if (!(window as unknown as { Chart?: unknown }).Chart) {
    await new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  await Promise.all([
    api.get<DashboardMetrics>('/admin/dashboard').then((data) => {
      metrics.value = data;
      loading.value = false;
    }),
    loadChart(chartDays.value),
  ]);
});
</script>
