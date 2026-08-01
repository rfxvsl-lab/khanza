<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettings } from '~/composables/useSettings';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Pengaturan Situs - Admin' });

const settings = useSettings();

const formData = ref({
  site_name: '',
  logo_url: '',
  footer_text: ''
});

const saving = ref(false);
const uploading = ref(false);
const message = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  formData.value = {
    site_name: settings.site_name,
    logo_url: settings.logo_url,
    footer_text: settings.footer_text
  };
});

const handleLogoUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploading.value = true;
  message.value = '';
  const uploadData = new FormData();
  uploadData.append('image', file);

  try {
    const token = localStorage.getItem('adminToken');
    const data: any = await $fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uploadData
    });
    formData.value.logo_url = data.url;
    message.value = 'Logo berhasil diunggah.';
  } catch (err: any) {
    message.value = err.response?._data?.error || 'Gagal mengunggah logo.';
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const handleSubmit = async () => {
  saving.value = true;
  message.value = '';
  try {
    const token = localStorage.getItem('adminToken');
    await $fetch('/api/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData.value
    });
    
    // Update global state
    settings.site_name = formData.value.site_name;
    settings.logo_url = formData.value.logo_url;
    settings.footer_text = formData.value.footer_text;
    
    message.value = 'Pengaturan berhasil disimpan. Refresh untuk melihat perubahan penuh.';
  } catch (err) {
    message.value = 'Terjadi kesalahan.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-3xl font-bold mb-8">Pengaturan Situs</h1>

    <div v-if="message" class="p-4 rounded-none mb-6 border" :class="message.includes('berhasil') ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'">
      {{ message }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6 bg-white/5 border border-white/10 p-6 rounded-none">
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-2">Nama Situs (Teks Header)</label>
        <input
          type="text"
          v-model="formData.site_name"
          class="w-full px-4 py-3 rounded-none bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-400 mb-2">Logo</label>
        <p class="text-xs text-gray-500 mb-3">Unggah file logo atau masukkan URL gambar. Kosongkan untuk menggunakan logo teks.</p>

        <div class="flex gap-3 mb-3">
          <input
            type="text"
            v-model="formData.logo_url"
            class="flex-1 px-4 py-3 rounded-none bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            placeholder="https://... atau unggah file"
          />
          <input
            type="file"
            accept="image/*"
            class="hidden"
            ref="fileInput"
            @change="handleLogoUpload"
          />
          <button
            type="button"
            @click="fileInput?.click()"
            :disabled="uploading"
            class="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-none transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            <Icon name="cil:reload" v-if="uploading" class="animate-spin" :size="18" />
            <Icon name="cil:cloud-upload" v-else :size="18" />
            Unggah
          </button>
        </div>

        <div v-if="formData.logo_url" class="mt-3 p-4 bg-black/50 rounded-none inline-flex items-center gap-4">
          <img :src="formData.logo_url" alt="Preview Logo" class="h-12 object-contain" referrerpolicy="no-referrer" />
          <button
            type="button"
            @click="formData.logo_url = ''"
            class="p-1.5 rounded-none bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
            title="Hapus logo"
          >
            <Icon name="cil:x" :size="14" />
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-400 mb-2">Deskripsi Footer</label>
        <textarea
          v-model="formData.footer_text"
          class="w-full px-4 py-3 rounded-none bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all h-32"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="saving || uploading"
        class="px-6 py-3 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50"
      >
        {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
      </button>
    </form>
  </div>
</template>
