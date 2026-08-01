<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  class?: ClassValue;
}>();

const buttonClass = computed(() => {
  const variant = props.variant || 'primary';
  const size = props.size || 'md';
  return twMerge(
    clsx(
      'font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 rounded-none disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]': variant === 'primary',
        'bg-white/10 hover:bg-white/20 text-white border border-white/10': variant === 'secondary',
        'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white': variant === 'ghost',
        'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20': variant === 'danger',
      },
      {
        'px-4 py-2 text-sm': size === 'sm',
        'px-6 py-3 text-base': size === 'md',
        'px-8 py-4 text-lg': size === 'lg',
      },
      props.class
    )
  );
});
</script>

<template>
  <button :class="buttonClass" :disabled="disabled || loading">
    <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>
