<script setup lang="ts">
defineProps<{
  type?: 'card' | 'text' | 'image' | 'avatar';
  class?: string;
}>();
</script>

<template>
  <div
    :class="[
      'animate-pulse bg-white/5 rounded-none border border-white/5',
      type === 'text' ? 'h-4 rounded-none' : '',
      type === 'image' ? 'h-48' : '',
      type === 'avatar' ? 'h-12 w-12 rounded-none' : '',
      $props.class
    ]"
  ></div>
</template>
