<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Konten Beranda - Admin' });

const formData = ref({
  title: '',
  description: '',
  hero_image: ''
});

const loading = ref(true);
const saving = ref(false);
const uploading = ref(false);
const message = ref({ type: '', text: '' });
const fileInput = ref<HTMLInputElement | null>(null);

const fetchContent = async () => {
  loading.value = true;
  try {
    const data: any = await $fetch('/api/content-home');
    formData.value = {
      title: data.title || '',
      description: data.description || '',
      hero_image: data.hero_image || ''
    };
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchContent();
});

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploading.value = true;
  message.value = { type: '', text: '' };

  const uploadData = new FormData();
  uploadData.append('image', file);

  try {
    const token = localStorage.getItem('adminToken');
    const data: any = await $fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uploadData
    });
    formData.value.hero_image = data.url;
    message.value = { type: 'success', text: 'Gambar berhasil diunggah.' };
  } catch (err: any) {
    message.value = { type: 'error', text: err.response?._data?.error || 'Gagal mengunggah gambar.' };
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const handleSubmit = async () => {
  saving.value = true;
  message.value = { type: '', text: '' };
  const token = localStorage.getItem('adminToken');

  try {
    await $fetch('/api/admin/content-home', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData.value
    });
    message.value = { type: 'success', text: 'Konten beranda berhasil diperbarui.' };
  } catch (err) {
    message.value = { type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' };
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <h1 class="text-3xl font-bold">Konten Halaman Beranda</h1>

    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <div
      v-else
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
      class="bg-white/5 border border-white/10 rounded-none p-8"
    >
      <div v-if="message.text" class="mb-6 p-4 rounded-none border" :class="message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'">
        {{ message.text }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">Judul Hero</label>
          <input
            type="text"
            required
            v-model="formData.title"
            class="w-full px-5 py-4 rounded-none bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
            placeholder="cth., Mendefinisikan Ulang Kesempurnaan Otomotif"
          />
          <p class="text-xs text-gray-500">Dua kata terakhir akan ditampilkan dengan warna merah.</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">Deskripsi Hero</label>
          <textarea
            required
            rows="3"
            v-model="formData.description"
            class="w-full px-5 py-4 rounded-none bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none resize-none"
            placeholder="Masukkan deskripsi hero..."
          ></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">Gambar Latar Hero</label>
          <div class="flex gap-4 mb-2">
            <input
              type="url"
              required
              v-model="formData.hero_image"
              class="flex-1 px-5 py-4 rounded-none bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
              placeholder="https://contoh.com/gambar.jpg"
            />
            <input
              type="file"
              accept="image/*"
              class="hidden"
              ref="fileInput"
              @change="handleImageUpload"
            />
            <button
              type="button"
              @click="fileInput?.click()"
              :disabled="uploading"
              class="px-6 py-4 rounded-none bg-white/10 hover:bg-white/20 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              <Icon name="cil:reload" v-if="uploading" class="animate-spin" :size="20" />
              <Icon name="cil:cloud-upload" v-else :size="20" />
              Unggah
            </button>
          </div>
          <div v-if="formData.hero_image" class="mt-4 rounded-none overflow-hidden border border-white/10 h-48 relative">
            <img :src="formData.hero_image" alt="Preview Hero" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
          </div>
        </div>

        <button
          type="submit"
          :disabled="saving || uploading"
          class="w-full py-4 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Icon name="cil:reload" v-if="saving" class="animate-spin" :size="20" />
          <Icon name="cil:save" v-else :size="20" />
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </form>
    </div>
  </div>
</template>
