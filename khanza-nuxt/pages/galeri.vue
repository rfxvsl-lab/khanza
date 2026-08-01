<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

useSeoMeta({
  title: 'Galeri & Koleksi',
  description: 'Jelajahi koleksi kendaraan premium kami yang telah dirawat dengan teliti dan siap untuk pemilik barunya.'
});

const inventory = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const searchTerm = ref('');
const viewMode = ref<'grid' | 'list'>('grid');
const selectedCar = ref<any | null>(null);

onMounted(async () => {
  try {
    const data = await $fetch('/api/garage');
    inventory.value = data as any[];
  } catch (err) {
    error.value = 'Gagal memuat inventaris galeri.';
  } finally {
    loading.value = false;
  }
});

const filteredInventory = computed(() => {
  return inventory.value.filter(car => 
    car.status === 'available' && car.car_model.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-16 md:py-20">
    <!-- Header -->
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="mb-12"
    >
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-[2px] bg-red-500" />
        <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Koleksi Kami</span>
      </div>
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight">
            <span class="text-transparent bg-clip-text bg-red-600">Galeri</span> Kami
          </h1>
          <p class="text-gray-500 max-w-xl text-lg">
            Jelajahi koleksi kendaraan premium kami yang telah dirawat dengan teliti dan siap untuk pemilik barunya.
          </p>
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <Icon name="cil:search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
            <input
              type="text"
              placeholder="Cari kendaraan..."
              v-model="searchTerm"
              class="w-full md:w-64 pl-11 pr-4 py-3 rounded-none bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/40 transition-colors"
            />
          </div>
          <div class="flex rounded-none border border-white/[0.06] overflow-hidden">
            <button
              @click="viewMode = 'grid'"
              :class="['p-3 text-sm transition-colors', viewMode === 'grid' ? 'bg-white/[0.06] text-white' : 'text-gray-600 hover:text-gray-400']"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect width="7" height="7" /><rect x="9" width="7" height="7" /><rect y="9" width="7" height="7" /><rect x="9" y="9" width="7" height="7" /></svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="['p-3 text-sm transition-colors', viewMode === 'list' ? 'bg-white/[0.06] text-white' : 'text-gray-600 hover:text-gray-400']"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect width="16" height="3" /><rect y="6.5" width="16" height="3" /><rect y="13" width="16" height="3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      <UiSkeleton v-for="i in 6" :key="i" class="w-full h-64 rounded-none break-inside-avoid" />
    </div>
    <div v-else-if="error" class="text-center py-20 text-red-400 bg-red-500/5 rounded-none border border-red-500/10">
      <p class="text-lg">{{ error }}</p>
    </div>
    <div v-else>
      <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'">
        <div
          v-for="(car, idx) in filteredInventory"
          :key="car.id"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 400, delay: idx * 50 } }"
          :class="['group rounded-none overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-500', viewMode === 'list' ? 'flex flex-col md:flex-row' : '']"
        >
          <div :class="['relative overflow-hidden', viewMode === 'list' ? 'md:w-72 aspect-[4/3] md:aspect-auto' : 'aspect-[4/3]']">
            <img
              :src="car.images"
              :alt="car.car_model"
              referrerpolicy="no-referrer"
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-[#181818] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div class="absolute top-3 right-3 px-2.5 py-1 rounded-none bg-black/50 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
              {{ car.year }}
            </div>
            <button
              @click="selectedCar = car"
              class="absolute bottom-3 right-3 p-2.5 rounded-none bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 border border-white/10"
            >
              <Icon name="cil:eye" :size="16" />
            </button>
          </div>

          <div class="p-5 flex-1">
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-lg font-bold text-white group-hover:text-red-400 transition-colors">{{ car.car_model }}</h3>
                <p class="text-gray-600 text-sm">{{ car.description }}</p>
              </div>
              <p class="text-lg font-bold text-white whitespace-nowrap ml-4">{{ formatRupiah(car.price) }}</p>
            </div>

            <button
              @click="selectedCar = car"
              class="w-full py-3 rounded-none bg-white/[0.04] border border-white/[0.06] hover:bg-red-600 hover:border-red-600 text-white font-medium text-sm transition-all duration-300"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredInventory.length === 0" class="text-center py-20">
        <div class="w-16 h-16 rounded-none bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <Icon name="cil:search" :size="24" class="text-gray-600" />
        </div>
        <p class="text-gray-500 text-lg mb-2">Kendaraan tidak ditemukan</p>
        <p class="text-gray-600 text-sm">Coba sesuaikan kata pencarian Anda</p>
      </div>
    </div>

    <!-- Detail Modal -->
    <Transition name="fade">
      <div v-if="selectedCar" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click="selectedCar = null">
        <div
          v-motion
          :initial="{ scale: 0.95, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1 }"
          class="bg-[#0a0a0a] border border-white/[0.08] rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <div class="relative aspect-video">
            <img :src="selectedCar.images" :alt="selectedCar.car_model" class="w-full h-full object-cover rounded-t-2xl" referrerpolicy="no-referrer" />
            <button
              @click="selectedCar = null"
              class="absolute top-4 right-4 p-2 rounded-none bg-black/50 backdrop-blur-md text-white hover:bg-red-600 transition-colors border border-white/10"
            >
              <Icon name="cil:x" :size="18" />
            </button>
            <div class="absolute bottom-4 left-4 px-3 py-1.5 rounded-none bg-black/50 backdrop-blur-md text-white text-sm font-bold border border-white/10">
              {{ selectedCar.year }}
            </div>
          </div>

          <div class="p-6 md:p-8">
            <div class="flex justify-between items-start mb-4">
              <h2 class="text-2xl font-bold text-white">{{ selectedCar.car_model }}</h2>
              <span class="text-2xl font-bold text-red-500">{{ formatRupiah(selectedCar.price) }}</span>
            </div>
            <p class="text-gray-400 leading-relaxed mb-6">{{ selectedCar.description }}</p>

            <div class="grid grid-cols-3 gap-3 mb-6">
              <div class="p-3 rounded-none bg-white/[0.03] border border-white/[0.06] text-center">
                <p class="text-gray-500 text-xs mb-1">Tahun</p>
                <p class="text-white font-semibold text-sm">{{ selectedCar.year }}</p>
              </div>
              <div class="p-3 rounded-none bg-white/[0.03] border border-white/[0.06] text-center">
                <p class="text-gray-500 text-xs mb-1">Status</p>
                <p class="text-white font-semibold text-sm">Tersedia</p>
              </div>
              <div class="p-3 rounded-none bg-white/[0.03] border border-white/[0.06] text-center">
                <p class="text-gray-500 text-xs mb-1">Kondisi</p>
                <p class="text-white font-semibold text-sm">Sangat Baik</p>
              </div>
            </div>

            <button class="w-full py-3.5 rounded-none bg-red-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
              Tanyakan Kendaraan Ini
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
