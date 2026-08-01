<script setup lang="ts">

defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
const goBack = () => {
  if (import.meta.client) {
    window.history.back()
  }
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="max-w-md"
      >
        <div class="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-4">
          {{ error?.statusCode || 404 }}
        </div>
        <h1 class="text-2xl font-bold text-white mb-3">{{ error?.statusMessage || 'Halaman Tidak Ditemukan' }}</h1>
        <p class="text-gray-500 mb-8 leading-relaxed">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="handleError"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
          >
            <Icon name="cil:home" :size="16" /> Ke Beranda
          </button>
          <button
            @click="goBack"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.04] border border-white/[0.06] text-white font-semibold rounded-xl hover:bg-white/[0.08] transition-all"
          >
            <Icon name="cil:arrow-left" :size="16" /> Kembali
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
