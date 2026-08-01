<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { computed, useSlots } from 'vue';

const props = defineProps<{
  label?: string;
  error?: string;
  class?: ClassValue;
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
const slots = useSlots();

const inputClass = computed(() => twMerge(clsx(
  'w-full px-4 py-3 rounded-none bg-black/50 border text-white placeholder-gray-500 transition-all duration-300',
  'focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none',
  !!slots.icon ? 'pl-12' : '',
  props.error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20',
  props.class
)));
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="text-sm font-medium text-gray-300">{{ label }}</label>
    <div class="relative">
      <div v-if="$slots.icon" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        <slot name="icon" />
      </div>
      <input
        :type="type || 'text'"
        :class="inputClass"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :required="required"
      />
    </div>
    <p v-if="error" class="text-red-400 text-xs">{{ error }}</p>
  </div>
</template>
