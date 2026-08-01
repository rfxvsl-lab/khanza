<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { computed } from 'vue';

const props = defineProps<{
  size?: 'sm' | 'md' | 'lg';
  class?: ClassValue;
}>();

const wrapperClass = computed(() => twMerge(clsx('flex items-center justify-center', props.class)));
const spinnerClass = computed(() => {
  const size = props.size || 'md';
  return clsx(
    'rounded-none border-2 border-white/10 border-t-red-500 animate-spin',
    {
      'w-5 h-5': size === 'sm',
      'w-10 h-10': size === 'md',
      'w-16 h-16': size === 'lg',
    }
  );
});
</script>

<template>
  <div :class="wrapperClass">
    <div :class="spinnerClass" />
  </div>
</template>
