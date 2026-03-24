<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1">
    <button
      @click="$emit('change', currentPage - 1)"
      :disabled="currentPage <= 1"
      class="btn btn-secondary btn-sm px-3 disabled:opacity-30"
      aria-label="Página anterior"
    >
      ←
    </button>

    <template v-for="page in pagesToShow" :key="page">
      <span v-if="page === '...'" class="px-2 text-dark-500">…</span>
      <button
        v-else
        @click="$emit('change', Number(page))"
        :class="[
          'btn btn-sm px-3.5 min-w-[36px]',
          currentPage === page ? 'btn-primary' : 'btn-secondary'
        ]"
      >
        {{ page }}
      </button>
    </template>

    <button
      @click="$emit('change', currentPage + 1)"
      :disabled="currentPage >= totalPages"
      class="btn btn-secondary btn-sm px-3 disabled:opacity-30"
      aria-label="Página siguiente"
    >
      →
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
}
const props = defineProps<Props>()
defineEmits<{ change: [page: number] }>()

const pagesToShow = computed(() => {
  const { currentPage: cp, totalPages: tp } = props
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)

  const pages: (number | string)[] = [1]
  if (cp > 3) pages.push('...')
  for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) pages.push(i)
  if (cp < tp - 2) pages.push('...')
  pages.push(tp)
  return pages
})
</script>
