<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showCookieToast = ref(false);

onMounted(() => {
  // Check if user has already accepted cookies
  const hasAccepted = localStorage.getItem('cookies_accepted');
  if (!hasAccepted) {
    // Small delay for better UX
    setTimeout(() => {
      showCookieToast.value = true;
    }, 1500);
  }
});

const acceptCookies = () => {
  localStorage.setItem('cookies_accepted', 'true');
  showCookieToast.value = false;
};
</script>

<template>
  <Transition name="toast-slide">
    <div v-if="showCookieToast" class="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div class="p-5 flex flex-col gap-4">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-red-500/20 text-red-500 rounded-full shrink-0">
            <Icon name="cil:cookie" :size="20" />
          </div>
          <div>
            <h4 class="font-bold text-white text-sm mb-1">Kami menggunakan Cookie 🍪</h4>
            <p class="text-xs text-gray-400 leading-relaxed">
              Website ini menggunakan cookie untuk memastikan Anda mendapatkan pengalaman terbaik. 
              <NuxtLink to="/cookies" class="text-red-500 hover:underline">Pelajari lebih lanjut.</NuxtLink>
            </p>
          </div>
        </div>
        <div class="flex justify-end">
          <button 
            @click="acceptCookies"
            class="px-5 py-2 bg-white text-black hover:bg-gray-200 text-xs font-bold rounded-xl transition-colors shadow"
          >
            Paham & Setuju
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(100px) scale(0.9);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
</style>
