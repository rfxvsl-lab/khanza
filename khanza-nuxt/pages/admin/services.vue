<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Kelola Layanan - Admin' });

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  icon_name: string;
  image_url?: string;
}

const services = ref<Service[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const editingService = ref<Service | null>(null);
const selectedFile = ref<File | null>(null);

const formData = ref({ title: '', description: '', price: 0, icon_name: 'cil:settings', image_url: '' });

const fetchServices = async () => {
  loading.value = true;
  try {
    const data: any = await $fetch('/api/services');
    services.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchServices();
});

const handleOpenModal = (service?: Service) => {
  if (service) {
    editingService.value = service;
    formData.value = { title: service.title, description: service.description, price: service.price, icon_name: service.icon_name, image_url: service.image_url || '' };
  } else {
    editingService.value = null;
    formData.value = { title: '', description: '', price: 0, icon_name: 'cil:settings', image_url: '' };
  }
  isModalOpen.value = true;
  selectedFile.value = null;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  editingService.value = null;
  selectedFile.value = null;
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const handleSubmit = async () => {
  const token = localStorage.getItem('adminToken');
  let finalImageUrl = formData.value.image_url;

  if (selectedFile.value) {
    try {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile.value);
      
      const res: any = await $fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData
      });
      finalImageUrl = res.url;
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah gambar');
      return;
    }
  }

  const url = editingService.value ? `/api/admin/services/${editingService.value.id}` : '/api/admin/services';
  const method = editingService.value ? 'PUT' : 'POST';

  try {
    await $fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: { ...formData.value, image_url: finalImageUrl }
    });
    fetchServices();
    handleCloseModal();
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat menyimpan layanan');
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Yakin ingin menghapus layanan ini?')) return;
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchServices();
  } catch (err) {
    console.error(err);
    alert('Gagal menghapus layanan');
  }
};

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Kelola Layanan</h1>
      <button
        @click="handleOpenModal()"
        class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none transition-colors"
      >
        <Icon name="cil:plus" :size="20" /> Tambah Layanan
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <div v-else class="bg-white/5 border border-white/10 rounded-none overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-white/5 border-b border-white/10">
            <th class="p-4 font-medium text-gray-400">Judul</th>
            <th class="p-4 font-medium text-gray-400">Deskripsi</th>
            <th class="p-4 font-medium text-gray-400">Harga</th>
            <th class="p-4 font-medium text-gray-400">Ikon</th>
            <th class="p-4 font-medium text-gray-400 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="p-4 font-medium">{{ service.title }}</td>
            <td class="p-4 text-gray-400 max-w-xs truncate">{{ service.description }}</td>
            <td class="p-4">{{ formatRupiah(service.price) }}</td>
            <td class="p-4">{{ service.icon_name }}</td>
            <td class="p-4 flex justify-end gap-2">
              <button
                @click="handleOpenModal(service)"
                class="p-2 text-blue-400 hover:bg-blue-400/10 rounded-none transition-colors"
              >
                <Icon name="cil:pencil" :size="18" />
              </button>
              <button
                @click="handleDelete(service.id)"
                class="p-2 text-red-400 hover:bg-red-400/10 rounded-none transition-colors"
              >
                <Icon name="cil:trash" :size="18" />
              </button>
            </td>
          </tr>
          <tr v-if="services.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-500">Belum ada layanan.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1 }"
        class="bg-[#111] border border-white/10 p-6 rounded-none w-full max-w-md relative"
      >
        <button
          @click="handleCloseModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <Icon name="cil:x" :size="24" />
        </button>
        <h2 class="text-2xl font-bold mb-6">{{ editingService ? 'Edit Layanan' : 'Tambah Layanan' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Judul</label>
            <input
              type="text" required
              v-model="formData.title"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
            <textarea
              required rows="3"
              v-model="formData.description"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Harga (Rp)</label>
            <input
              type="number" required min="0" step="1000"
              v-model="formData.price"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Nama Ikon (CoreUI)</label>
            <input
              type="text" required
              v-model="formData.icon_name"
              placeholder="cth., cil:settings, cil:car-alt, cil:star"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Upload Gambar</label>
            <input
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">ATAU URL Gambar (Opsional)</label>
            <input
              type="text"
              v-model="formData.image_url"
              placeholder="/images/services/nama-file.jpg"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
            <p class="text-xs text-gray-500 mt-1">Isi URL ini jika Anda tidak mengunggah file gambar.</p>
          </div>
          <button
            type="submit"
            class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none transition-colors mt-4"
          >
            {{ editingService ? 'Simpan Perubahan' : 'Tambah Layanan' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
