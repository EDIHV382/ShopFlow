<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-950 via-dark-900 to-accent-950">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2.5 mb-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <span class="text-white font-black">S</span>
          </div>
          <span class="font-extrabold text-2xl gradient-text">ShopFlow</span>
        </div>
        <h1 class="text-2xl font-bold text-white">Crear cuenta</h1>
        <p class="text-dark-400 mt-1 text-sm">Únete a ShopFlow hoy</p>
      </div>

      <div class="card p-8 space-y-5 animate-scale-in">
        <div>
          <label class="label">Nombre completo</label>
          <input v-model="form.name" type="text" class="input" :class="{'input-error': errors.name}" placeholder="Juan García" />
          <p v-if="errors.name" class="error-msg">⚠ {{ errors.name }}</p>
        </div>
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" class="input" :class="{'input-error': errors.email}" placeholder="tu@email.com" />
          <p v-if="errors.email" class="error-msg">⚠ {{ errors.email }}</p>
        </div>
        <div>
          <label class="label">Contraseña</label>
          <div class="relative">
            <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="input pr-12" :class="{'input-error': errors.password}" placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" />
            <button @click="showPass = !showPass" class="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">{{ showPass ? '🙈' : '👁️' }}</button>
          </div>
          <p v-if="errors.password" class="error-msg">⚠ {{ errors.password }}</p>
        </div>

        <p v-if="apiError" class="error-msg text-sm">⚠ {{ apiError }}</p>

        <button @click="handleRegister" :disabled="loading" class="btn btn-primary btn-md w-full">
          <span v-if="loading">Creando cuenta...</span>
          <span v-else>Crear cuenta gratis</span>
        </button>

        <p class="text-center text-sm text-dark-400">
          ¿Ya tienes cuenta? <NuxtLink to="/auth/login" class="text-primary-400 hover:text-primary-300 font-semibold">Iniciar sesión</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Crear cuenta — ShopFlow' })

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '' })
const errors = reactive<Partial<typeof form>>({})
const apiError = ref('')
const loading = ref(false)
const showPass = ref(false)

if (authStore.isAuthenticated) router.push('/')

function validate(): boolean {
  Object.assign(errors, {})
  if (!form.name.trim() || form.name.length < 2) errors.name = 'Nombre requerido (mín. 2 caracteres)'
  if (!form.email.includes('@')) errors.email = 'Email inválido'
  if (form.password.length < 8) errors.password = 'Mínimo 8 caracteres'
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Debe incluir al menos una mayúscula'
  else if (!/[0-9]/.test(form.password)) errors.password = 'Debe incluir al menos un número'
  return Object.values(errors).every(v => !v)
}

async function handleRegister() {
  apiError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await authStore.register(form.name, form.email, form.password)
    router.push('/')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear la cuenta'
    apiError.value = msg.includes('409') ? 'Este email ya está registrado' : msg
  } finally {
    loading.value = false
  }
}
</script>
