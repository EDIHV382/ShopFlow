<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950"
  >
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2.5 mb-4">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow"
          >
            <span class="text-white font-black">S</span>
          </div>
          <span class="font-extrabold text-2xl gradient-text">ShopFlow</span>
        </div>
        <h1 class="text-2xl font-bold text-white">Iniciar sesión</h1>
        <p class="text-dark-400 mt-1 text-sm">Bienvenido de vuelta</p>
      </div>

      <div class="card p-8 space-y-5 animate-scale-in">
        <div>
          <label class="label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            :class="{ 'input-error': error }"
            placeholder="tu@email.com"
            @keyup.enter="handleLogin"
          />
        </div>
        <div>
          <label class="label">Contraseña</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              class="input pr-12"
              :class="{ 'input-error': error }"
              placeholder="••••••••"
              @keyup.enter="handleLogin"
            />
            <button
              @click="showPass = !showPass"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
            >
              {{ showPass ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <p v-if="error" class="error-msg text-sm">⚠ {{ error }}</p>

        <button @click="handleLogin" :disabled="loading" class="btn btn-primary btn-md w-full">
          <span v-if="loading">Iniciando sesión...</span>
          <span v-else>Iniciar sesión</span>
        </button>

        <p class="text-center text-sm text-dark-400">
          ¿No tienes cuenta?
          <NuxtLink
            to="/auth/register"
            class="text-primary-400 hover:text-primary-300 font-semibold"
            >Regístrate</NuxtLink
          >
        </p>

        <!-- Test credentials hint -->
        <div class="card p-3 bg-dark-800/80 text-center">
          <p class="text-xs text-dark-400 mb-1">Credenciales de prueba:</p>
          <button @click="fillAdmin" class="text-xs text-primary-400 hover:underline mr-2">
            Admin</button
          >·
          <button @click="fillCliente" class="text-xs text-accent-400 hover:underline ml-2">
            Cliente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });
useSeoMeta({ title: 'Iniciar sesión — ShopFlow' });

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();
const route = useRoute();

const form = reactive({ email: '', password: '' });
const error = ref('');
const loading = ref(false);
const showPass = ref(false);

// Redirect if already authenticated
if (authStore.isAuthenticated) {
  router.push('/');
}

const fillAdmin = () => {
  form.email = 'admin@shopflow.com';
  form.password = 'Admin1234!';
};
const fillCliente = () => {
  form.email = 'cliente@shopflow.com';
  form.password = 'Cliente1234!';
};

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    const data = await authStore.login(form.email, form.password);
    await cartStore.syncFromBackend(data.token);
    const redirect = String(route.query.redirect || '/');
    router.push(redirect);
  } catch {
    error.value = 'Email o contraseña incorrectos';
  } finally {
    loading.value = false;
  }
}
</script>
