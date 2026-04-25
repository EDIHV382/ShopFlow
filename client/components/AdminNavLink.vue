<template>
  <NuxtLink
    :to="to"
    :class="[
      'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group',
      isActive
        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
        : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100',
    ]"
  >
    <span class="text-lg flex-shrink-0">{{ icon }}</span>
    <span v-if="open" class="text-sm transition-opacity duration-200">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to: string;
  icon: string;
  label: string;
  open: boolean;
}
const props = defineProps<Props>();
const route = useRoute();
const isActive = computed(() => route.path.startsWith(props.to));
</script>
