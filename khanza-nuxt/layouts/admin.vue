<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettings } from '~/composables/useSettings';

const router = useRouter();
const settings = useSettings();

const isMobileMenuOpen = ref(false);

const handleLogout = () => {
  if (import.meta.client) {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  }
};

const navItems = [
  { name: 'Dasbor', path: '/admin/dashboard', icon: 'cil:speedometer' },
  { name: 'Konten Beranda', path: '/admin/content-home', icon: 'cil:home' },
  { name: 'Pengaturan', path: '/admin/settings', icon: 'cil:settings' },
  { name: 'Layanan', path: '/admin/services', icon: 'cil:settings' },
  { name: 'Reservasi', path: '/admin/bookings', icon: 'cil:calendar' },
  { name: 'Galeri', path: '/admin/garage', icon: 'cil:car-alt' },
  { name: 'Testimoni', path: '/admin/testimonials', icon: 'cil:speech' },
  { name: 'FAQ', path: '/admin/faqs', icon: 'cil:info' },
  { name: 'Newsletter', path: '/admin/newsletters', icon: 'cil:envelope-closed' },
  { name: 'CRM Mailbox', path: '/admin/mailbox', icon: 'cil:send' },
  { name: 'Voucher', path: '/admin/vouchers', icon: 'cil:tag' },
  { name: 'Invoice', path: '/admin/invoices', icon: 'cil:file' },
];
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white flex selection:bg-red-500/30">
    <!-- Overlay for mobile -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false" 
      class="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
    ></div>

    <aside 
      :class="[
        'w-64 bg-black border-r border-white/10 flex flex-col h-screen fixed lg:sticky top-0 z-50 transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 class="text-xl font-bold text-white truncate">{{ settings.site_name }} <span class="text-red-500 text-sm">Admin</span></h2>
        <button @click="isMobileMenuOpen = false" class="lg:hidden text-gray-400 hover:text-white">
          <Icon name="cil:x" :size="24" />
        </button>
      </div>
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-gray-400 hover:bg-white/5 hover:text-white"
          active-class="!bg-red-600 !text-white"
        >
          <Icon :name="item.icon" :size="20" />
          <span class="font-medium">{{ item.name }}</span>
        </NuxtLink>
      </nav>
      <div class="p-4 border-t border-white/10">
        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-500 transition-colors"
        >
          <Icon name="cil:account-logout" :size="20" />
          <span class="font-medium">Keluar</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto h-screen flex flex-col w-full lg:w-[calc(100%-16rem)]">
      <div class="lg:hidden p-4 border-b border-white/10 flex items-center bg-[#0a0a0a] sticky top-0 z-30">
        <button @click="isMobileMenuOpen = true" class="text-gray-400 hover:text-white mr-4">
          <Icon name="cil:menu" :size="28" />
        </button>
        <h2 class="text-lg font-bold text-white truncate">{{ settings.site_name }} Admin</h2>
      </div>
      <div class="p-4 sm:p-8 flex-1 overflow-x-hidden">
        <slot />
      </div>
    </main>
  </div>
</template>
