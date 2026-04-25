<template>
  <div class="container-page py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Filters -->
      <aside class="w-full lg:w-64 flex-shrink-0">
        <div class="card p-5 sticky top-20 space-y-6">
          <h2 class="font-bold text-dark-100">Filtros</h2>

          <!-- Search -->
          <div>
            <label class="label">Búsqueda</label>
            <input
              v-model="localSearch"
              type="search"
              placeholder="Buscar producto..."
              class="input"
              @keyup.enter="applyFilters"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="label">Categoría</label>
            <select v-model="localCategory" class="input">
              <option value="">Todas las categorías</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Price range -->
          <div>
            <label class="label">Rango de precio</label>
            <div class="flex gap-2 items-center">
              <input
                v-model.number="localMinPrice"
                type="number"
                placeholder="Mín"
                class="input text-sm"
                min="0"
              />
              <span class="text-dark-500 text-sm">—</span>
              <input
                v-model.number="localMaxPrice"
                type="number"
                placeholder="Máx"
                class="input text-sm"
                min="0"
              />
            </div>
          </div>

          <!-- Availability -->
          <div class="flex items-center gap-3">
            <input
              id="available"
              v-model="localAvailable"
              type="checkbox"
              class="w-4 h-4 rounded accent-primary-500"
            />
            <label for="available" class="text-sm text-dark-300 cursor-pointer"
              >Solo disponibles</label
            >
          </div>

          <div class="flex gap-2">
            <button @click="applyFilters" class="btn btn-primary btn-sm flex-1">Filtrar</button>
            <button @click="clearFilters" class="btn btn-secondary btn-sm">✕</button>
          </div>
        </div>
      </aside>

      <!-- Products Grid -->
      <div class="flex-1">
        <!-- Sort bar -->
        <div class="flex items-center justify-between mb-6 gap-4">
          <p class="text-sm text-dark-400">
            <span v-if="!loading">{{ meta?.total ?? 0 }} productos</span>
            <span v-else class="skeleton h-4 w-24 rounded inline-block" />
          </p>
          <select v-model="localSort" class="input !w-auto text-sm" @change="applyFilters">
            <option value="newest">Más nuevos</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_asc">Nombre A–Z</option>
          </select>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          <SkeletonCard v-for="i in 12" :key="i" />
        </div>

        <!-- Empty -->
        <div v-else-if="products.length === 0" class="text-center py-24">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="text-lg font-semibold text-dark-200 mb-2">Sin resultados</h3>
          <p class="text-dark-500 mb-6">Intenta cambiar los filtros de búsqueda.</p>
          <button @click="clearFilters" class="btn btn-secondary btn-md">Limpiar filtros</button>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <!-- Pagination -->
        <div class="mt-10">
          <Pagination
            v-if="meta"
            :current-page="currentPage"
            :total-pages="meta.totalPages"
            @change="onPageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, PaginatedResponse, Category } from '~/types';

definePageMeta({ layout: 'default' });
useSeoMeta({
  title: 'Catálogo de productos — ShopFlow',
  description: 'Explora más de 50 productos con filtros por categoría, precio y disponibilidad.',
});

const route = useRoute();
const router = useRouter();
const api = useApi();

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const meta = ref<PaginatedResponse<Product>['meta'] | null>(null);
const loading = ref(true);
const currentPage = ref(1);

// Local filter state
const localSearch = ref(String(route.query.search || ''));
const localCategory = ref(String(route.query.category || ''));
const localMinPrice = ref<number | ''>(route.query.minPrice ? Number(route.query.minPrice) : '');
const localMaxPrice = ref<number | ''>(route.query.maxPrice ? Number(route.query.maxPrice) : '');
const localAvailable = ref(route.query.available === 'true');
const localSort = ref(String(route.query.sortBy || 'newest'));

async function fetchProducts() {
  loading.value = true;
  try {
    const params: Record<string, string | number | boolean> = {
      page: currentPage.value,
      limit: 12,
      sortBy: localSort.value,
    };
    if (localSearch.value) {
      params.search = localSearch.value;
    }
    if (localCategory.value) {
      params.category = localCategory.value;
    }
    if (localMinPrice.value !== '') {
      params.minPrice = localMinPrice.value;
    }
    if (localMaxPrice.value !== '') {
      params.maxPrice = localMaxPrice.value;
    }
    if (localAvailable.value) {
      params.available = true;
    }

    const result = await api.get<PaginatedResponse<Product>>('/products', params);
    products.value = result.data;
    meta.value = result.meta;
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  currentPage.value = 1;
  router.replace({
    query: {
      ...(localSearch.value && { search: localSearch.value }),
      ...(localCategory.value && { category: localCategory.value }),
      ...(localMinPrice.value !== '' && { minPrice: String(localMinPrice.value) }),
      ...(localMaxPrice.value !== '' && { maxPrice: String(localMaxPrice.value) }),
      ...(localAvailable.value && { available: 'true' }),
      sortBy: localSort.value,
    },
  });
  fetchProducts();
}

function clearFilters() {
  localSearch.value = '';
  localCategory.value = '';
  localMinPrice.value = '';
  localMaxPrice.value = '';
  localAvailable.value = false;
  localSort.value = 'newest';
  currentPage.value = 1;
  router.replace({ query: {} });
  fetchProducts();
}

function onPageChange(page: number) {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchProducts();
}

onMounted(async () => {
  categories.value = await api.get<Category[]>('/categories');
  await fetchProducts();
});
</script>
