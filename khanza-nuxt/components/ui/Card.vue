<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  class?: ClassValue;
  hover?: boolean;
}>(), {
  hover: true
});

const cardClass = computed(() => twMerge(clsx(
  'rounded-none bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm overflow-hidden',
  props.hover && 'hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(220,38,38,0.08)] transition-all duration-500',
  props.class
)));
</script>

<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>
