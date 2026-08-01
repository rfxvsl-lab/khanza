<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Kelola Testimoni - Admin' });

interface Testimonial {
  id: number;
  name: string;
  review: string;
  rating: number;
  is_approved: number;
}

const testimonials = ref<Testimonial[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const editingItem = ref<Testimonial | null>(null);

const formData = ref({
  name: '',
  review: '',
  rating: 5,
  is_approved: 1
});

const fetchTestimonials = async () => {
  loading.value = true;
  const token = localStorage.getItem('adminToken');
  try {
    const data: any = await $fetch('/api/admin/testimonials', {
      headers: { Authorization: `Bearer ${token}` }
    });
    testimonials.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTestimonials();
});

const handleOpenModal = (item?: Testimonial) => {
  if (item) {
    editingItem.value = item;
    formData.value = {
      name: item.name,
      review: item.review,
      rating: item.rating,
      is_approved: item.is_approved
    };
  } else {
    editingItem.value = null;
    formData.value = {
      name: '',
      review: '',
      rating: 5,
      is_approved: 1
    };
  }
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  editingItem.value = null;
};

const handleSubmit = async () => {
  const token = localStorage.getItem('adminToken');
  const url = editingItem.value ? `/api/admin/testimonials/${editingItem.value.id}` : '/api/admin/testimonials';
  const method = editingItem.value ? 'PUT' : 'POST';

  try {
    await $fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData.value
    });
    fetchTestimonials();
    handleCloseModal();
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat menyimpan testimoni');
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Yakin ingin menghapus testimoni ini?')) return;
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTestimonials();
  } catch (err) {
    console.error(err);
    alert('Gagal menghapus testimoni');
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Kelola Testimoni</h1>
      <button
        @click="handleOpenModal()"
        class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none transition-colors"
      >
        <Icon name="cil:plus" :size="20" /> Tambah Testimoni
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <div v-else class="bg-white/5 border border-white/10 rounded-none overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-white/5 border-b border-white/10">
            <th class="p-4 font-medium text-gray-400">Nama</th>
            <th class="p-4 font-medium text-gray-400">Ulasan</th>
            <th class="p-4 font-medium text-gray-400">Rating</th>
            <th class="p-4 font-medium text-gray-400">Status</th>
            <th class="p-4 font-medium text-gray-400 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in testimonials" :key="item.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="p-4 font-medium">{{ item.name }}</td>
            <td class="p-4 text-gray-400 max-w-xs truncate">{{ item.review }}</td>
            <td class="p-4">
              <div class="flex gap-1">
                <Icon name="cil:star" v-for="i in 5"
                  :key="i"
                  :size="16"
                  :class="i <= item.rating ? 'fill-red-500 text-red-500' : 'text-gray-600'" />
              </div>
            </td>
            <td class="p-4">
              <span class="px-3 py-1 rounded-none text-xs font-bold uppercase tracking-wider"
                :class="item.is_approved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'"
              >
                {{ item.is_approved ? 'Disetujui' : 'Menunggu' }}
              </span>
            </td>
            <td class="p-4 flex justify-end gap-2">
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
          <tr v-if="testimonials.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-500">Belum ada testimoni.</td>
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
        class="bg-[#111] border border-white/10 p-6 rounded-none w-full max-w-md relative"
      >
        <button
          @click="handleCloseModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <Icon name="cil:x" :size="24" />
        </button>
        <h2 class="text-2xl font-bold mb-6">{{ editingItem ? 'Edit Testimoni' : 'Tambah Testimoni' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Nama Pelanggan</label>
            <input
              type="text" required
              v-model="formData.name"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Rating (1-5)</label>
            <input
              type="number" required min="1" max="5"
              v-model="formData.rating"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              v-model="formData.is_approved"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none appearance-none"
            >
              <option :value="1">Disetujui</option>
              <option :value="0">Menunggu</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Isi Ulasan</label>
            <textarea
              required rows="4"
              v-model="formData.review"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            ></textarea>
          </div>
          <button
            type="submit"
            class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none transition-colors mt-4"
          >
            {{ editingItem ? 'Simpan Perubahan' : 'Tambah Testimoni' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
