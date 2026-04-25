<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/products" class="text-dark-400 hover:text-dark-100 transition-colors"
        >←</NuxtLink
      >
      <h2 class="text-2xl font-bold text-white">Editar producto</h2>
    </div>

    <div v-if="loadingProduct" class="skeleton h-96 rounded-2xl" />

    <form v-else @submit.prevent="handleSubmit" class="card p-6 space-y-5">
      <div>
        <label class="label">Nombre *</label>
        <input v-model="form.name" type="text" class="input" required />
      </div>
      <div>
        <label class="label">Descripción</label>
        <textarea v-model="form.description" class="input min-h-[100px] resize-y" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Precio (USD) *</label>
          <input
            v-model.number="form.price"
            type="number"
            class="input"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div>
          <label class="label">Stock *</label>
          <input v-model.number="form.stock" type="number" class="input" min="0" required />
        </div>
      </div>
      <div>
        <label class="label">Categoría</label>
        <select v-model.number="form.category_id" class="input">
          <option :value="null">Sin categoría</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">URLs de imágenes (una por línea)</label>
        <textarea v-model="imagesText" class="input min-h-[80px] font-mono text-sm resize-y" />
      </div>
      <p v-if="error" class="error-msg">⚠ {{ error }}</p>
      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="btn btn-primary btn-md flex-1">
          {{ saving ? 'Guardando...' : 'Actualizar producto' }}
        </button>
        <NuxtLink to="/admin/products" class="btn btn-secondary btn-md">Cancelar</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category } from '~/types';

definePageMeta({ layout: 'admin' });
useSeoMeta({ title: 'Editar producto — Admin' });

const route = useRoute();
const router = useRouter();
const api = useApi();
const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category_id: null as number | null,
});
const imagesText = ref('');
const categories = ref<Category[]>([]);
const saving = ref(false);
const loadingProduct = ref(true);
const error = ref('');

onMounted(async () => {
  const [product, cats] = await Promise.all([
    api.get<Product>(`/products/${route.params.id}`),
    api.get<Category[]>('/categories'),
  ]);
  Object.assign(form, {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category_id: product.category_id,
  });
  imagesText.value = product.images.join('\n');
  categories.value = cats;
  loadingProduct.value = false;
});

async function handleSubmit() {
  error.value = '';
  saving.value = true;
  const images = imagesText.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  try {
    await api.put(`/products/${route.params.id}`, { ...form, images });
    router.push('/admin/products');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al guardar';
  } finally {
    saving.value = false;
  }
}
</script>
