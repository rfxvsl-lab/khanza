<script setup lang="ts">
import { ref, watch } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

const props = defineProps<{
  target: number;
  suffix?: string;
}>();

const count = ref(0);
const targetRef = ref(null);
const targetIsVisible = ref(false);

const { stop } = useIntersectionObserver(
  targetRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      targetIsVisible.value = true;
      stop();
    }
  },
  { threshold: 0.5 }
);

watch(targetIsVisible, (isVisible) => {
  if (!isVisible) return;
  let start = 0;
  const duration = 2000;
  const step = (timestamp: number) => {
    start = start || timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    count.value = Math.floor(progress * props.target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
});
</script>

<template>
  <span ref="targetRef">{{ count }}{{ suffix }}</span>
</template>
