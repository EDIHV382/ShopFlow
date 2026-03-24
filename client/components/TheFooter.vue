<template>
  <footer class="bg-dark-900 border-t border-dark-800 mt-auto">
    <div class="container-page py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span class="text-white font-black text-sm">S</span>
            </div>
            <span class="font-extrabold text-xl gradient-text">ShopFlow</span>
          </div>
          <p class="text-dark-400 text-sm leading-relaxed max-w-xs">
            La mejor experiencia de compra online. Productos de calidad con entrega rápida y segura.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-semibold text-dark-200 mb-4 text-sm uppercase tracking-wider">Tienda</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/products" class="text-sm text-dark-400 hover:text-dark-100 transition-colors">Todos los productos</NuxtLink></li>
            <li><NuxtLink to="/products?sortBy=newest" class="text-sm text-dark-400 hover:text-dark-100 transition-colors">Novedades</NuxtLink></li>
            <li><NuxtLink to="/cart" class="text-sm text-dark-400 hover:text-dark-100 transition-colors">Mi carrito</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-dark-200 mb-4 text-sm uppercase tracking-wider">Cuenta</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/auth/login" class="text-sm text-dark-400 hover:text-dark-100 transition-colors">Iniciar sesión</NuxtLink></li>
            <li><NuxtLink to="/auth/register" class="text-sm text-dark-400 hover:text-dark-100 transition-colors">Crear cuenta</NuxtLink></li>
            <li><NuxtLink to="/orders" class="text-sm text-dark-400 hover:text-dark-100 transition-colors">Mis pedidos</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-dark-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-xs text-dark-500">© {{ year }} ShopFlow. Todos los derechos reservados.</p>
        <div class="flex items-center gap-3">
          <span class="text-xs text-dark-600 bg-dark-800 px-2 py-1 rounded-lg">🔒 Pagos seguros con Stripe</span>
          <span class="text-xs text-dark-600 bg-dark-800 px-2 py-1 rounded-lg">🌐 Powered by Vercel + Neon</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = computed(() => new Date().getFullYear())
</script>
