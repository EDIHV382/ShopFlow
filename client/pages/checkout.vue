<template>
  <div class="container-page py-10 max-w-5xl">
    <h1 class="text-3xl font-bold text-white mb-8">💳 Finalizar compra</h1>

    <!-- Redirect if cart empty -->
    <div v-if="cartStore.isEmpty" class="text-center py-16">
      <div class="text-5xl mb-4">🛒</div>
      <p class="text-dark-400 mb-6">Tu carrito está vacío.</p>
      <NuxtLink to="/products" class="btn btn-primary btn-md">Ir al catálogo</NuxtLink>
    </div>

    <div v-else class="grid lg:grid-cols-5 gap-10">
      <!-- Form -->
      <div class="lg:col-span-3 space-y-8">
        <!-- Shipping Address -->
        <div class="card p-6">
          <h2 class="font-bold text-dark-100 mb-6 flex items-center gap-2">📍 Dirección de envío</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="label">Nombre completo *</label>
              <input v-model="form.fullName" type="text" class="input" :class="{'input-error': errors.fullName}" placeholder="Juan García" />
              <p v-if="errors.fullName" class="error-msg">⚠ {{ errors.fullName }}</p>
            </div>
            <div class="sm:col-span-2">
              <label class="label">Dirección *</label>
              <input v-model="form.address" type="text" class="input" :class="{'input-error': errors.address}" placeholder="Calle Ejemplo #123" />
              <p v-if="errors.address" class="error-msg">⚠ {{ errors.address }}</p>
            </div>
            <div>
              <label class="label">Ciudad *</label>
              <input v-model="form.city" type="text" class="input" :class="{'input-error': errors.city}" placeholder="Ciudad de México" />
              <p v-if="errors.city" class="error-msg">⚠ {{ errors.city }}</p>
            </div>
            <div>
              <label class="label">Estado / Provincia *</label>
              <input v-model="form.state" type="text" class="input" placeholder="CDMX" />
            </div>
            <div>
              <label class="label">Código postal *</label>
              <input v-model="form.postalCode" type="text" class="input" :class="{'input-error': errors.postalCode}" placeholder="06600" />
              <p v-if="errors.postalCode" class="error-msg">⚠ {{ errors.postalCode }}</p>
            </div>
            <div>
              <label class="label">País *</label>
              <input v-model="form.country" type="text" class="input" placeholder="México" />
            </div>
            <div class="sm:col-span-2">
              <label class="label">Teléfono *</label>
              <input v-model="form.phone" type="tel" class="input" :class="{'input-error': errors.phone}" placeholder="+52 55 0000 0000" />
              <p v-if="errors.phone" class="error-msg">⚠ {{ errors.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="card p-6">
          <h2 class="font-bold text-dark-100 mb-6 flex items-center gap-2">🔒 Pago con Stripe</h2>
          <div id="stripe-card-element" class="input py-4" />
          <p v-if="stripeError" class="error-msg mt-2">⚠ {{ stripeError }}</p>
          <p class="text-xs text-dark-500 mt-3">
            Tarjeta de prueba: <span class="font-mono text-dark-300">4242 4242 4242 4242</span> — Fecha futura — CVC: cualquier
          </p>
        </div>

        <!-- Auth warning -->
        <div v-if="!authStore.isAuthenticated" class="card p-4 border-yellow-500/30 bg-yellow-500/10">
          <p class="text-sm text-yellow-400">
            ⚠️ <NuxtLink to="/auth/login?redirect=/checkout" class="underline font-semibold">Inicia sesión</NuxtLink> para guardar tu historial de pedidos.
          </p>
        </div>

        <button
          @click="handleSubmit"
          :disabled="processing"
          class="btn btn-primary btn-lg w-full"
        >
          <span v-if="processing">⏳ Procesando pago...</span>
          <span v-else>✓ Confirmar y pagar {{ formatPrice(cartStore.subtotal) }}</span>
        </button>
      </div>

      <!-- Order Summary -->
      <aside class="lg:col-span-2">
        <div class="card p-5 space-y-4 sticky top-20">
          <h3 class="font-bold text-dark-100">Resumen</h3>
          <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
            <div v-for="item in cartStore.items" :key="item.product_id" class="flex gap-3 items-center">
              <div class="w-12 h-12 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
                <img v-if="item.product_images?.[0]" :src="item.product_images[0]" :alt="item.product_name" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-dark-200 truncate">{{ item.product_name }}</p>
                <p class="text-xs text-dark-500">x{{ item.quantity }}</p>
              </div>
              <p class="text-sm font-semibold text-dark-100 flex-shrink-0">{{ formatPrice(item.product_price * item.quantity) }}</p>
            </div>
          </div>
          <div class="h-px bg-dark-800" />
          <div class="flex justify-between font-bold text-white">
            <span>Total</span>
            <span class="gradient-text">{{ formatPrice(cartStore.subtotal) }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeCardElement } from '@stripe/stripe-js'

definePageMeta({ layout: 'default', middleware: 'auth' })
useSeoMeta({ title: 'Checkout — ShopFlow' })

const config = useRuntimeConfig()
const cartStore = useCartStore()
const authStore = useAuthStore()
const api = useApi()
const router = useRouter()

const processing = ref(false)
const stripeError = ref('')

let stripe: Stripe | null = null
let cardElement: StripeCardElement | null = null

// Form state
const form = reactive({
  fullName: '', address: '', city: '', state: '',
  postalCode: '', country: 'México', phone: '',
})
const errors = reactive<Partial<typeof form>>({})

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(price)
}

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k as keyof typeof errors])
  if (!form.fullName.trim() || form.fullName.length < 2) errors.fullName = 'Nombre requerido'
  if (!form.address.trim() || form.address.length < 5) errors.address = 'Dirección requerida'
  if (!form.city.trim()) errors.city = 'Ciudad requerida'
  if (!form.postalCode.trim()) errors.postalCode = 'Código postal requerido'
  if (!form.phone.trim() || form.phone.length < 7) errors.phone = 'Teléfono requerido'
  return Object.keys(errors).length === 0
}

onMounted(async () => {
  stripe = await loadStripe(config.public.stripePublicKey)
  if (!stripe) return

  const elements = stripe.elements({
    appearance: {
      theme: 'night',
      variables: { colorBackground: '#1e293b', colorText: '#f1f5f9', borderRadius: '12px' },
    },
  })
  cardElement = elements.create('card', { style: { base: { fontSize: '16px' } } })
  cardElement.mount('#stripe-card-element')
  cardElement.on('change', (e) => {
    stripeError.value = e.error?.message || ''
  })
})

async function handleSubmit() {
  if (!validate() || !stripe || !cardElement) return

  processing.value = true
  stripeError.value = ''

  try {
    // 1. Create payment intent
    const { clientSecret } = await api.post<{ clientSecret: string }>('/stripe/create-payment-intent')

    // 2. Confirm card payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (result.error) {
      stripeError.value = result.error.message || 'Error al procesar el pago'
      return
    }

    const paymentId = result.paymentIntent?.id

    // 3. Create order in backend
    const order = await api.post<{ id: number }>('/orders', {
      shippingAddress: { ...form },
      stripePaymentId: paymentId,
    })

    // 4. Cart is cleared server-side; clear local too
    cartStore.clearCart()

    // 5. Redirect to confirmation
    router.push(`/orders/${order.id}?success=true`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al procesar el pedido'
    stripeError.value = msg
  } finally {
    processing.value = false
  }
}
</script>
