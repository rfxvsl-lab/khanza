<script setup lang="ts">
import { ref, onMounted } from 'vue';

useSeoMeta({
  title: 'Testimoni',
  description: 'Dengarkan apa yang dikatakan pelanggan puas kami tentang pengalaman mereka.'
});

const settings = useSettings();
const testimonials = ref<any[]>([]);
const services = ref<any[]>([]);
const loading = ref(true);

const formData = ref({ name: '', review: '', rating: 5, service_ordered: '' });
const profilePhoto = ref<File | null>(null);
const photoPreview = ref('');
const submitStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const submitMessage = ref('');
const hoverRating = ref(0);

onMounted(async () => {
  try {
    const res = await $fetch('/api/testimonials');
    testimonials.value = res as any[];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
  
  try {
    const res = await $fetch('/api/services');
    services.value = res as any[];
  } catch (e) { }
});

const handlePhotoChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      submitMessage.value = 'Ukuran foto maksimal 2MB';
      submitStatus.value = 'error';
      setTimeout(() => submitStatus.value = 'idle', 3000);
      return;
    }
    profilePhoto.value = file;
    photoPreview.value = URL.createObjectURL(file);
  }
};

const handleSubmit = async () => {
  submitStatus.value = 'loading';
  const fd = new FormData();
  fd.append('name', formData.value.name);
  fd.append('review', formData.value.review);
  fd.append('rating', String(formData.value.rating));
  fd.append('service_ordered', formData.value.service_ordered);
  if (profilePhoto.value) fd.append('profile_photo', profilePhoto.value);

  try {
    await $fetch('/api/testimonials-submit', { method: 'POST', body: fd });
    submitStatus.value = 'success';
    submitMessage.value = 'Testimoni berhasil dikirim! Menunggu persetujuan admin.';
    formData.value = { name: '', review: '', rating: 5, service_ordered: '' };
    profilePhoto.value = null;
    photoPreview.value = '';
  } catch (err: any) {
    submitStatus.value = 'error';
    submitMessage.value = err.response?._data?.statusMessage || 'Gagal mengirim testimoni';
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-16 md:py-20">
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="mb-16"
    >
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-[2px] bg-red-500" />
        <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Kata Pelanggan</span>
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
        <span class="text-transparent bg-clip-text bg-red-600">Testimoni</span> Pelanggan
      </h1>
      <p class="text-gray-500 max-w-xl text-lg">
        Jangan hanya percaya kata kami. Dengarkan apa yang dikatakan pelanggan puas kami tentang pengalaman mereka.
      </p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="p-8 rounded-none bg-white/[0.02] border border-white/[0.06]">
        <div class="flex gap-1 mb-6">
          <UiSkeleton v-for="j in 5" :key="j" class="w-5 h-5 rounded-none" />
        </div>
        <UiSkeleton type="text" class="w-full h-4 mb-2" />
        <UiSkeleton type="text" class="w-5/6 h-4 mb-6" />
        <div class="flex items-center gap-4">
          <UiSkeleton type="avatar" class="w-12 h-12" />
          <div class="flex-1 space-y-2">
            <UiSkeleton type="text" class="w-1/2 h-4" />
            <UiSkeleton type="text" class="w-1/3 h-3" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div
        v-if="testimonials.length > 0"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="relative rounded-none bg-gradient-to-br from-red-950/20 via-white/[0.02] to-transparent border border-red-500/10 p-8 md:p-12"
      >
        <Quote class="absolute top-8 right-8 text-red-500/10 w-20 h-20" />
        <div class="flex gap-1 mb-6">
          <Icon name="cil:star" v-for="i in testimonials[0].rating" :key="i" :size="18" class="fill-red-500 text-red-500" />
        </div>
        <p class="text-white text-xl md:text-2xl leading-relaxed mb-8 max-w-3xl font-light italic">
          "{{ testimonials[0].review }}"
        </p>
        <div class="flex items-center gap-4">
          <img v-if="testimonials[0].profile_photo" :src="testimonials[0].profile_photo" :alt="testimonials[0].name" class="w-14 h-14 rounded-none object-cover" />
          <div v-else class="w-14 h-14 rounded-none bg-red-600 flex items-center justify-center text-white font-bold text-xl">
            {{ testimonials[0].name.charAt(0) }}
          </div>
          <div>
            <h4 class="text-white font-bold text-lg">{{ testimonials[0].name }}</h4>
            <p v-if="testimonials[0].service_ordered" class="text-red-500/70 text-sm">{{ testimonials[0].service_ordered }}</p>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-none bg-green-500/20 flex items-center justify-center"><div class="w-2 h-2 rounded-none bg-green-500" /></div>
              <span class="text-gray-500 text-sm">Pelanggan Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(t, idx) in testimonials.slice(1)"
          :key="t.id"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500, delay: idx * 100 } }"
          class="relative bg-white/[0.02] border border-white/[0.06] rounded-none p-7 group hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500"
        >
          <Quote class="absolute top-6 right-6 text-white/[0.03] w-12 h-12 group-hover:text-red-500/10 transition-colors duration-500" />
          <div class="flex gap-1 mb-5">
            <Icon name="cil:star" v-for="i in t.rating" :key="i" :size="14" class="fill-red-500 text-red-500" />
          </div>
          <p class="text-gray-400 leading-relaxed mb-6 text-sm">"{{ t.review }}"</p>
          <div class="flex items-center gap-3 pt-5 border-t border-white/[0.04]">
            <img v-if="t.profile_photo" :src="t.profile_photo" :alt="t.name" class="w-10 h-10 rounded-none object-cover" />
            <div v-else class="w-10 h-10 rounded-none bg-red-600 flex items-center justify-center text-red-500 font-bold text-sm border border-red-500/10">
              {{ t.name.charAt(0) }}
            </div>
            <div>
              <h4 class="text-white font-semibold text-sm">{{ t.name }}</h4>
              <p class="text-gray-600 text-xs">{{ t.service_ordered || 'Pelanggan Terverifikasi' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Form -->
    <div
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="mt-20"
    >
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-[2px] bg-red-500" />
        <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Bagikan Pengalaman Anda</span>
      </div>
      <h2 class="text-3xl md:text-4xl font-bold mb-8">Tulis Testimoni</h2>

      <div v-if="submitStatus === 'success'" class="bg-white/[0.02] border border-green-500/20 rounded-none p-10 text-center">
        <div class="w-16 h-16 rounded-none bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
          <Icon name="cil:check-circle" 2 :size="32" />
        </div>
        <h3 class="text-2xl font-bold text-white mb-2">Terima Kasih!</h3>
        <p class="text-gray-400 mb-6">{{ submitMessage }}</p>
        <button @click="submitStatus = 'idle'" class="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium rounded-none transition-all">
          Tulis Testimoni Lain
        </button>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white/[0.02] border border-white/[0.06] rounded-none p-6 md:p-8 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1.5">Nama Anda *</label>
            <input type="text" required v-model="formData.name" placeholder="Masukkan nama" class="w-full px-4 py-3.5 rounded-none bg-black/50 border border-white/[0.08] text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1.5">Layanan yang Dipesan *</label>
            <select required v-model="formData.service_ordered" class="w-full px-4 py-3.5 rounded-none bg-black/50 border border-white/[0.08] text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all appearance-none">
              <option value="" disabled>Pilih layanan</option>
              <option v-for="svc in services" :key="svc.id" :value="svc.title">{{ svc.title }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Rating *</label>
          <div class="flex gap-1.5">
            <button
              v-for="star in 5" :key="star" type="button"
              @click="formData.rating = star"
              @mouseenter="hoverRating = star"
              @mouseleave="hoverRating = 0"
              class="p-1 transition-transform hover:scale-110"
            >
              <Icon name="cil:star" :size="28" :class="['transition-colors', star <= (hoverRating || formData.rating) ? 'fill-red-500 text-red-500' : 'text-gray-600']" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1.5">Ulasan Anda *</label>
          <textarea required rows="4" v-model="formData.review" placeholder="Ceritakan pengalaman Anda..." class="w-full px-4 py-3.5 rounded-none bg-black/50 border border-white/[0.08] text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all resize-none" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1.5">Foto Profil (Maks 2MB)</label>
          <div class="flex items-center gap-4">
            <div v-if="photoPreview" class="relative">
              <img :src="photoPreview" alt="Preview" class="w-16 h-16 rounded-none object-cover" />
              <button type="button" @click="profilePhoto = null; photoPreview = ''" class="absolute -top-2 -right-2 w-5 h-5 rounded-none bg-red-600 text-white text-xs flex items-center justify-center">×</button>
            </div>
            <label v-else class="flex items-center gap-2 px-4 py-3 rounded-none bg-black/50 border border-white/[0.08] text-gray-400 cursor-pointer hover:border-red-500/30 transition-colors">
              <Icon name="cil:camera" :size="18" /> <span class="text-sm">Upload Foto</span>
              <input type="file" accept="image/*" @change="handlePhotoChange" class="hidden" />
            </label>
          </div>
        </div>

        <div v-if="submitStatus === 'error'" class="p-3 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ submitMessage }}
        </div>

        <button type="submit" :disabled="submitStatus === 'loading'" class="w-full md:w-auto px-8 py-3.5 bg-red-600 text-white font-bold rounded-none hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 flex items-center gap-2 justify-center">
          <template v-if="submitStatus === 'loading'"><Icon name="cil:reload" :size="18" class="animate-spin" /> Mengirim...</template>
          <template v-else>Kirim Testimoni</template>
        </button>
      </form>
    </div>
  </div>
</template>
