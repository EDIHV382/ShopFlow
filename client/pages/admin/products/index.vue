<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Productos</h2>
      <NuxtLink to="/admin/products/create" class="btn btn-primary btn-sm"
        >+ Nuevo producto</NuxtLink
      >
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="skeleton h-16 rounded-xl" />
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-dark-800 border-b border-dark-700">
            <tr>
              <th class="text-left px-4 py-3 text-dark-300 font-semibold">Producto</th>
              <th class="text-left px-4 py-3 text-dark-300 font-semibold">Categoría</th>
              <th class="text-right px-4 py-3 text-dark-300 font-semibold">Precio</th>
              <th class="text-right px-4 py-3 text-dark-300 font-semibold">Stock</th>
              <th class="text-center px-4 py-3 text-dark-300 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800">
            <tr
              v-for="product in products"
              :key="product.id"
              class="hover:bg-dark-800/50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-dark-800 flex-shrink-0">
                    <img
                      v-if="product.images?.[0]"
                      :src="product.images[0]"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <span class="font-medium text-dark-100 truncate max-w-[200px]">{{
                    product.name
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-dark-400">{{ product.category_name || '—' }}</td>
              <td class="px-4 py-3 text-right font-semibold text-white">
                {{ formatPrice(product.price) }}
              </td>
              <td class="px-4 py-3 text-right">
                <span
                  :class="
                    product.stock === 0
                      ? 'badge-sold-out'
                      : product.stock <= 5
                        ? 'badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'badge bg-green-500/20 text-green-400 border border-green-500/30'
                  "
                >
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <NuxtLink
                    :to="`/admin/products/${product.id}/edit`"
                    class="btn btn-secondary btn-sm px-3"
                    >Editar</NuxtLink
                  >
                  <button @click="confirmDelete(product)" class="btn btn-danger btn-sm px-3">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Pagination
      v-if="meta"
      :current-page="page"
      :total-pages="meta.totalPages"
      @change="loadProducts"
    />

    <ConfirmModal
      :show="!!deletingProduct"
      title="Eliminar producto"
      :message="`¿Eliminar '${deletingProduct?.name}'? Esta acción no se puede deshacer.`"
      icon="🗑️"
      confirm-text="Eliminar"
      :danger-confirm="true"
      @confirm="deleteProduct"
      @cancel="deletingProduct = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product, PaginatedResponse } from '~/types';

definePageMeta({ layout: 'admin' });
useSeoMeta({ title: 'Productos — ShopFlow Admin' });

const api = useApi();
const products = ref<Product[]>([]);
const meta = ref<PaginatedResponse<Product>['meta'] | null>(null);
const loading = ref(true);
const page = ref(1);
const deletingProduct = ref<Product | null>(null);

function formatPrice(p: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(p);
}

async function loadProducts(newPage = 1) {
  page.value = newPage;
  loading.value = true;
  const result = await api.get<PaginatedResponse<Product>>('/products', {
    page: page.value,
    limit: 20,
  });
  products.value = result.data;
  meta.value = result.meta;
  loading.value = false;
}

function confirmDelete(product: Product) {
  deletingProduct.value = product;
}

async function deleteProduct() {
  if (!deletingProduct.value) {
    return;
  }
  await api.del(`/products/${deletingProduct.value.id}`);
  deletingProduct.value = null;
  await loadProducts(page.value);
}

onMounted(() => loadProducts());
</script>
