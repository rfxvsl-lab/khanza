<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const x = ref(0);
const y = ref(0);

const updateMousePosition = (e: MouseEvent) => {
  x.value = e.clientX;
  y.value = e.clientY;
};

onMounted(() => {
  window.addEventListener('mousemove', updateMousePosition, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateMousePosition);
});
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
    :style="{ background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,0,0,0.06), transparent 40%)` }"
  />
</template>
