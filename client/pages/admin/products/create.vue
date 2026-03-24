<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/products" class="text-dark-400 hover:text-dark-100 transition-colors">←</NuxtLink>
      <h2 class="text-2xl font-bold text-white">{{ isEdit ? 'Editar producto' : 'Nuevo producto' }}</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="card p-6 space-y-5">
      <div>
        <label class="label">Nombre *</label>
        <input v-model="form.name" type="text" class="input" required placeholder="Nombre del producto" />
      </div>

      <div>
        <label class="label">Descripción</label>
        <textarea v-model="form.description" class="input min-h-[100px] resize-y" placeholder="Descripción detallada..." />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Precio (USD) *</label>
          <input v-model.number="form.price" type="number" class="input" step="0.01" min="0" required placeholder="0.00" />
        </div>
        <div>
          <label class="label">Stock *</label>
          <input v-model.number="form.stock" type="number" class="input" min="0" required placeholder="0" />
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
        <textarea v-model="imagesText" class="input min-h-[80px] font-mono text-sm resize-y"
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
        <p class="text-xs text-dark-500 mt-1">Primera imagen = imagen principal</p>
      </div>

      <p v-if="error" class="error-msg">⚠ {{ error }}</p>

      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="btn btn-primary btn-md flex-1">
          {{ saving ? 'Guardando...' : (isEdit ? 'Actualizar producto' : 'Crear producto') }}
        </button>
        <NuxtLink to="/admin/products" class="btn btn-secondary btn-md">Cancelar</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category } from '~/types'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const api = useApi()

const isEdit = computed(() => route.path.includes('/edit'))
const productId = computed(() => route.params.id as string | undefined)

const form = reactive({ name: '', description: '', price: 0, stock: 0, category_id: null as number | null, images: [] as string[] })
const imagesText = ref('')
const categories = ref<Category[]>([])
const saving = ref(false)
const error = ref('')

useSeoMeta({ title: isEdit.value ? 'Editar producto — Admin' : 'Nuevo producto — Admin' })

onMounted(async () => {
  categories.value = await api.get<Category[]>('/categories')
  if (isEdit.value && productId.value) {
    const product = await api.get<Product>(`/products/${productId.value}`)
    Object.assign(form, {
      name: product.name, description: product.description,
      price: product.price, stock: product.stock, category_id: product.category_id,
    })
    imagesText.value = product.images.join('\n')
  }
})

async function handleSubmit() {
  error.value = ''
  saving.value = true
  const images = imagesText.value.split('\n').map(s => s.trim()).filter(Boolean)
  try {
    if (isEdit.value && productId.value) {
      await api.put(`/products/${productId.value}`, { ...form, images })
    } else {
      await api.post('/products', { ...form, images })
    }
    router.push('/admin/products')
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>
