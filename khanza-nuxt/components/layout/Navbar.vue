<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const settings = useSettings();
const route = useRoute();

const items = [
  {
    label: "Layanan Utama",
    bgColor: "rgba(220, 38, 38, 0.15)", // red-500/15
    textColor: "#fff",
    links: [
      { label: "Daftar Layanan", href: "/layanan", ariaLabel: "Layanan" },
      { label: "Buat Reservasi", href: "/reservasi", ariaLabel: "Reservasi" }
    ]
  },
  {
    label: "Jelajahi", 
    bgColor: "rgba(255, 255, 255, 0.08)", // white/8
    textColor: "#fff",
    links: [
      { label: "Halaman Utama", href: "/", ariaLabel: "Beranda" },
      { label: "Galeri Hasil", href: "/galeri", ariaLabel: "Galeri" }
    ]
  },
  {
    label: "Informasi",
    bgColor: "rgba(255, 255, 255, 0.08)", // white/8
    textColor: "#fff",
    links: [
      { label: "Testimoni", href: "/testimoni", ariaLabel: "Testimoni" },
      { label: "Bantuan (FAQ)", href: "/faq", ariaLabel: "FAQ" }
    ]
  }
];
</script>

<template>
  <UiCardNav
    :logo="settings.logo_url || '/logo-baru.png'"
    :logo-alt="settings.site_name || 'Khanza Repaint'"
    :items="items"
    base-color="rgba(10, 10, 10, 0.7)"
    menu-color="#fff"
    button-bg-color="#dc2626"
    button-text-color="#ffffff"
    ease="power3.out"
  />
</template>

<style scoped>
/* Empty style block to fix Vite HMR cache */
</style>
