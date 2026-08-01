<script setup lang="ts">
const settings = useSettings();
</script>

<template>
  <footer class="relative z-10 bg-[#0a0a0a] border-t border-white/[0.04] overflow-hidden min-h-[60vh] flex flex-col justify-between">
    <!-- Blurred Background Logo -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-80">
      <img 
        :src="settings.logo_url || '/logo-baru.png'" 
        alt="Background Logo" 
        class="w-[90vw] max-w-[900px] object-contain blur-[12px] brightness-125"
      />
    </div>

    <!-- Center CTA Section -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 mt-10">
      <h2 class="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-8 max-w-4xl leading-tight drop-shadow-[0_5px_15px_rgba(0,0,0,1)] [text-shadow:_0_2px_10px_rgb(0_0_0_/_100%)]">
        Kembalikan Pesona Kendaraan Anda<br/>Bersama <span class="text-red-500">Khanza Repaint</span>
      </h2>
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <NuxtLink to="/reservasi" class="px-8 py-3.5 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
          Buat Reservasi
        </NuxtLink>
        <a href="https://wa.me/62881036492931" target="_blank" class="px-8 py-3.5 rounded-full bg-[#111] border border-white/10 text-white font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
          <Icon name="cib:whatsapp" :size="20" /> Konsultasi WA
        </a>
      </div>
    </div>

    <!-- Minimal Bottom Footer -->
    <div class="relative z-10 w-full px-6 md:px-10 pb-6 mt-10">
      <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6 text-xs sm:text-sm font-medium text-gray-400">
        <!-- Left -->
        <div class="w-full lg:w-1/3 flex items-center justify-center lg:justify-start gap-2">
          <span>Built by</span>
          <Icon name="cil:grid" :size="16" class="text-gray-500" />
          <span class="text-white">{{ settings.site_name }}</span>
        </div>

        <!-- Center Links -->
        <div class="w-full lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center z-10">
          <NuxtLink to="/support" class="hover:text-white transition-colors">Support</NuxtLink>
          <span class="text-gray-700 hidden sm:inline">|</span>
          <NuxtLink to="/terms" class="hover:text-white transition-colors">Terms of Service</NuxtLink>
          <span class="text-gray-700 hidden sm:inline">|</span>
          <NuxtLink to="/privacy" class="hover:text-white transition-colors">Privacy Policy</NuxtLink>
          <span class="text-gray-700 hidden sm:inline">|</span>
          <NuxtLink to="/community" class="hover:text-white transition-colors">Community Guidelines</NuxtLink>
          <span class="text-gray-700 hidden sm:inline">|</span>
          <NuxtLink to="/cookies" class="hover:text-white transition-colors">Cookie Policy</NuxtLink>
        </div>

        <!-- Right -->
        <div class="w-full lg:w-1/3 text-center lg:text-right">
          {{ settings.site_name }} is a premium repair service
        </div>
      </div>
    </div>
  </footer>
</template>
