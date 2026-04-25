<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Categorías</h2>
    </div>

    <!-- Add form -->
    <div class="card p-5">
      <h3 class="font-semibold text-dark-100 mb-4">
        {{ editingCat ? 'Editar categoría' : 'Nueva categoría' }}
      </h3>
      <div class="flex gap-3">
        <input
          v-model="form.name"
          type="text"
          class="input"
          placeholder="Nombre"
          @input="autoSlug"
        />
        <input v-model="form.slug" type="text" class="input" placeholder="slug-url" />
        <button
          @click="handleSave"
          :disabled="saving"
          class="btn btn-primary btn-sm whitespace-nowrap"
        >
          {{ saving ? '...' : editingCat ? 'Actualizar' : 'Agregar' }}
        </button>
        <button v-if="editingCat" @click="cancelEdit" class="btn btn-secondary btn-sm">✕</button>
      </div>
      <p v-if="error" class="error-msg mt-2">⚠ {{ error }}</p>
    </div>

    <!-- List -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-4 space-y-2">
        <div v-for="i in 5" :key="i" class="skeleton h-12 rounded-xl" />
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-dark-800 border-b border-dark-700">
          <tr>
            <th class="text-left px-4 py-3 text-dark-300">Nombre</th>
            <th class="text-left px-4 py-3 text-dark-300">Slug</th>
            <th class="text-right px-4 py-3 text-dark-300">Productos</th>
            <th class="text-center px-4 py-3 text-dark-300">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-800">
          <tr
            v-for="cat in categories"
            :key="cat.id"
            class="hover:bg-dark-800/50 transition-colors"
          >
            <td class="px-4 py-3 font-medium text-dark-100">{{ cat.name }}</td>
            <td class="px-4 py-3 font-mono text-xs text-dark-400">{{ cat.slug }}</td>
            <td class="px-4 py-3 text-right text-dark-300">{{ cat.product_count }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex justify-center gap-2">
                <button @click="startEdit(cat)" class="btn btn-secondary btn-sm px-3">
                  Editar
                </button>
                <button @click="confirmDelete(cat)" class="btn btn-danger btn-sm px-3">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :show="!!deletingCat"
      title="Eliminar categoría"
      :message="`¿Eliminar '${deletingCat?.name}'? Los productos quedarán sin categoría.`"
      icon="🗑️"
      confirm-text="Eliminar"
      :danger-confirm="true"
      @confirm="deleteCategory"
      @cancel="deletingCat = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types';

definePageMeta({ layout: 'admin' });
useSeoMeta({ title: 'Categorías — ShopFlow Admin' });

const api = useApi();
const categories = ref<(Category & { product_count: number })[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const form = reactive({ name: '', slug: '' });
const editingCat = ref<Category | null>(null);
const deletingCat = ref<Category | null>(null);

async function load() {
  loading.value = true;
  categories.value = await api.get('/categories');
  loading.value = false;
}

function autoSlug() {
  if (!editingCat.value) {
    form.slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

function startEdit(cat: Category) {
  editingCat.value = cat;
  form.name = cat.name;
  form.slug = cat.slug;
}

function cancelEdit() {
  editingCat.value = null;
  form.name = '';
  form.slug = '';
  error.value = '';
}

async function handleSave() {
  error.value = '';
  saving.value = true;
  try {
    if (editingCat.value) {
      await api.put(`/categories/${editingCat.value.id}`, form);
    } else {
      await api.post('/categories', form);
    }
    form.name = '';
    form.slug = '';
    editingCat.value = null;
    await load();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error';
  } finally {
    saving.value = false;
  }
}

function confirmDelete(cat: Category) {
  deletingCat.value = cat;
}

async function deleteCategory() {
  if (!deletingCat.value) {
    return;
  }
  await api.del(`/categories/${deletingCat.value.id}`);
  deletingCat.value = null;
  await load();
}

onMounted(load);
</script>
