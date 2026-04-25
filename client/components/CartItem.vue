<template>
  <div class="flex gap-4 p-4 card">
    <!-- Product image -->
    <div class="w-20 h-20 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
      <img
        v-if="item.product_images?.[0]"
        :src="item.product_images[0]"
        :alt="item.product_name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-2xl">📦</div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-semibold text-dark-100 leading-tight truncate">
        {{ item.product_name }}
      </h4>
      <p class="text-xs text-dark-400 mt-0.5">{{ formatPrice(item.product_price) }} c/u</p>

      <!-- Quantity controls -->
      <div class="flex items-center gap-2 mt-3">
        <button
          @click="decrease"
          class="w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-200 font-bold text-sm transition-colors"
        >
          −
        </button>
        <span class="text-sm font-semibold text-dark-100 min-w-[24px] text-center">{{
          item.quantity
        }}</span>
        <button
          @click="increase"
          :disabled="item.quantity >= item.product_stock"
          class="w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-200 font-bold text-sm transition-colors disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>

    <!-- Total + remove -->
    <div class="flex flex-col items-end justify-between">
      <button
        @click="handleRemove"
        class="text-dark-500 hover:text-red-400 transition-colors p-1"
        title="Eliminar"
      >
        ✕
      </button>
      <span class="text-base font-bold text-white">{{
        formatPrice(item.product_price * item.quantity)
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// We use a simplified CartItem type for the local cart
interface CartItemLocal {
  product_id: number;
  product_name: string;
  product_price: number;
  product_images: string[];
  product_stock: number;
  quantity: number;
}
interface Props {
  item: CartItemLocal;
}
const props = defineProps<Props>();

const cartStore = useCartStore();

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(price);
}

function increase() {
  cartStore.updateQuantity(props.item.product_id, props.item.quantity + 1);
}

function decrease() {
  cartStore.updateQuantity(props.item.product_id, props.item.quantity - 1);
}

function handleRemove() {
  cartStore.removeItem(props.item.product_id);
}
</script>
