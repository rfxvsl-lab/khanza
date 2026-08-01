<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Kelola Galeri - Admin' });

interface GarageItem {
  id: number;
  car_model: string;
  year: number;
  price: number;
  description: string;
  images: string;
  status: 'available' | 'sold';
}

const items = ref<GarageItem[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const editingItem = ref<GarageItem | null>(null);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const formData = ref({
  car_model: '',
  year: new Date().getFullYear(),
  price: 0,
  description: '',
  images: '',
  status: 'available' as 'available' | 'sold'
});

const fetchItems = async () => {
  loading.value = true;
  try {
    const data: any = await $fetch('/api/garage');
    items.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchItems();
});

const handleOpenModal = (item?: GarageItem) => {
  if (item) {
    editingItem.value = item;
    formData.value = { ...item };
  } else {
    editingItem.value = null;
    formData.value = {
      car_model: '',
      year: new Date().getFullYear(),
      price: 0,
      description: '',
      images: '',
      status: 'available'
    };
  }
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  editingItem.value = null;
};

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploading.value = true;
  const uploadData = new FormData();
  uploadData.append('image', file);

  try {
    const token = localStorage.getItem('adminToken');
    const data: any = await $fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uploadData
    });
    formData.value.images = data.url;
  } catch (err: any) {
    alert(err.response?._data?.error || 'Gagal mengunggah gambar.');
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const handleSubmit = async () => {
  const token = localStorage.getItem('adminToken');
  const url = editingItem.value ? `/api/admin/garage/${editingItem.value.id}` : '/api/admin/garage';
  const method = editingItem.value ? 'PUT' : 'POST';

  try {
    await $fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData.value
    });
    fetchItems();
    handleCloseModal();
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat menyimpan kendaraan');
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Yakin ingin menghapus kendaraan ini?')) return;
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/garage/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchItems();
  } catch (err) {
    console.error(err);
    alert('Gagal menghapus kendaraan');
  }
};

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const statusLabels: Record<string, string> = {
  available: 'Tersedia',
  sold: 'Terjual'
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Kelola Galeri</h1>
      <button
        @click="handleOpenModal()"
        class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none transition-colors"
      >
        <Icon name="cil:plus" :size="20" /> Tambah Kendaraan
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <div v-else class="bg-white/5 border border-white/10 rounded-none overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-white/5 border-b border-white/10">
            <th class="p-4 font-medium text-gray-400">Gambar</th>
            <th class="p-4 font-medium text-gray-400">Model</th>
            <th class="p-4 font-medium text-gray-400">Tahun</th>
            <th class="p-4 font-medium text-gray-400">Harga</th>
            <th class="p-4 font-medium text-gray-400">Status</th>
            <th class="p-4 font-medium text-gray-400 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="p-4">
              <img v-if="item.images" :src="item.images" :alt="item.car_model" class="w-16 h-16 object-cover rounded-none" referrerpolicy="no-referrer" />
              <div v-else class="w-16 h-16 bg-white/10 rounded-none flex items-center justify-center text-gray-500">
                <Icon name="cil:image" Icon :size="24" />
              </div>
            </td>
            <td class="p-4 font-medium">{{ item.car_model }}</td>
            <td class="p-4 text-gray-400">{{ item.year }}</td>
            <td class="p-4">{{ formatRupiah(item.price) }}</td>
            <td class="p-4">
              <span class="px-3 py-1 rounded-none text-xs font-bold uppercase tracking-wider"
                :class="item.status === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
              >
                {{ statusLabels[item.status] || item.status }}
              </span>
            </td>
            <td class="p-4 flex justify-end gap-2 items-center h-full">
              <button
                @click="handleOpenModal(item)"
                class="p-2 text-blue-400 hover:bg-blue-400/10 rounded-none transition-colors"
              >
                <Icon name="cil:pencil" :size="18" />
              </button>
              <button
                @click="handleDelete(item.id)"
                class="p-2 text-red-400 hover:bg-red-400/10 rounded-none transition-colors"
              >
                <Icon name="cil:trash" :size="18" />
              </button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-500">Belum ada kendaraan.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1 }"
        class="bg-[#111] border border-white/10 p-6 rounded-none w-full max-w-md relative max-h-[90vh] overflow-y-auto"
      >
        <button
          @click="handleCloseModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <Icon name="cil:x" :size="24" />
        </button>
        <h2 class="text-2xl font-bold mb-6">{{ editingItem ? 'Edit Kendaraan' : 'Tambah Kendaraan' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Model Kendaraan</label>
            <input
              type="text" required
              v-model="formData.car_model"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Tahun</label>
              <input
                type="number" required min="1900" :max="new Date().getFullYear() + 1"
                v-model="formData.year"
                class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Harga (Rp)</label>
              <input
                type="number" required min="0" step="1000"
                v-model="formData.price"
                class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              v-model="formData.status"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none appearance-none"
            >
              <option value="available">Tersedia</option>
              <option value="sold">Terjual</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">URL Gambar</label>
            <div class="flex gap-2">
              <input
                type="url" required
                v-model="formData.images"
                placeholder="https://contoh.com/gambar.jpg"
                class="flex-1 px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
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
                class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-none transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Icon name="cil:reload" v-if="uploading" class="animate-spin" :size="18" />
                <Icon name="cil:cloud-upload" v-else :size="18" />
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
            <textarea
              required rows="4"
              v-model="formData.description"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            ></textarea>
          </div>
          <button
            type="submit"
            :disabled="uploading"
            class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none transition-colors mt-4 disabled:opacity-50"
          >
            {{ editingItem ? 'Simpan Perubahan' : 'Tambah Kendaraan' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
