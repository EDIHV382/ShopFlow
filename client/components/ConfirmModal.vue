<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" @click="$emit('cancel')" />
        <div class="relative card p-6 max-w-sm w-full animate-scale-in shadow-2xl">
          <div class="text-3xl mb-4 text-center">{{ icon }}</div>
          <h3 class="text-lg font-bold text-dark-100 text-center mb-2">{{ title }}</h3>
          <p class="text-sm text-dark-400 text-center mb-6">{{ message }}</p>
          <div class="flex gap-3">
            <button @click="$emit('cancel')" class="btn btn-secondary btn-md flex-1">
              {{ cancelText }}
            </button>
            <button @click="$emit('confirm')" :class="['btn btn-md flex-1', dangerConfirm ? 'btn-danger' : 'btn-primary']">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title: string
  message?: string
  icon?: string
  confirmText?: string
  cancelText?: string
  dangerConfirm?: boolean
}
withDefaults(defineProps<Props>(), {
  message: '¿Estás seguro de continuar?',
  icon: '⚠️',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  dangerConfirm: false,
})
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
