<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Kelola FAQ - Admin' });

interface FAQ {
  id: number;
  question: string;
  answer: string;
  display_order: number;
}

const faqs = ref<FAQ[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const editingItem = ref<FAQ | null>(null);

const formData = ref({
  question: '',
  answer: '',
  display_order: 0
});

const fetchFaqs = async () => {
  loading.value = true;
  try {
    const data: any = await $fetch('/api/faqs');
    faqs.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFaqs();
});

const handleOpenModal = (item?: FAQ) => {
  if (item) {
    editingItem.value = item;
    formData.value = {
      question: item.question,
      answer: item.answer,
      display_order: item.display_order
    };
  } else {
    editingItem.value = null;
    formData.value = {
      question: '',
      answer: '',
      display_order: faqs.value.length > 0 ? Math.max(...faqs.value.map(f => f.display_order)) + 1 : 1
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
  const url = editingItem.value ? `/api/admin/faqs/${editingItem.value.id}` : '/api/admin/faqs';
  const method = editingItem.value ? 'PUT' : 'POST';

  try {
    await $fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData.value
    });
    fetchFaqs();
    handleCloseModal();
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat menyimpan FAQ');
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Yakin ingin menghapus FAQ ini?')) return;
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/faqs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchFaqs();
  } catch (err) {
    console.error(err);
    alert('Gagal menghapus FAQ');
  }
};

const moveOrder = async (id: number, currentOrder: number, direction: 'up' | 'down') => {
  const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
  const token = localStorage.getItem('adminToken');
  const swapItem = faqs.value.find(f => f.display_order === targetOrder);

  try {
    await $fetch(`/api/admin/faqs/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { display_order: targetOrder }
    });

    if (swapItem) {
      await $fetch(`/api/admin/faqs/${swapItem.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: { display_order: currentOrder }
      });
    }

    fetchFaqs();
  } catch (err) {
    console.error(err);
    alert('Gagal mengubah urutan');
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Kelola FAQ</h1>
      <button
        @click="handleOpenModal()"
        class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none transition-colors"
      >
        <Icon name="cil:plus" :size="20" /> Tambah FAQ
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <div v-else class="bg-white/5 border border-white/10 rounded-none overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-white/5 border-b border-white/10">
            <th class="p-4 font-medium text-gray-400 w-24 text-center">Urutan</th>
            <th class="p-4 font-medium text-gray-400">Pertanyaan</th>
            <th class="p-4 font-medium text-gray-400">Jawaban</th>
            <th class="p-4 font-medium text-gray-400 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in faqs" :key="item.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="p-4 text-center">
              <div class="flex flex-col items-center justify-center gap-1">
                <button
                  @click="moveOrder(item.id, item.display_order, 'up')"
                  :disabled="index === 0"
                  class="text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <Icon name="cil:arrow-top" :size="16" />
                </button>
                <span class="text-sm font-mono">{{ item.display_order }}</span>
                <button
                  @click="moveOrder(item.id, item.display_order, 'down')"
                  :disabled="index === faqs.length - 1"
                  class="text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <Icon name="cil:arrow-bottom" :size="16" />
                </button>
              </div>
            </td>
            <td class="p-4 font-medium max-w-xs">{{ item.question }}</td>
            <td class="p-4 text-gray-400 max-w-sm truncate">{{ item.answer }}</td>
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
          <tr v-if="faqs.length === 0">
            <td colspan="4" class="p-8 text-center text-gray-500">Belum ada FAQ.</td>
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
        <h2 class="text-2xl font-bold mb-6">{{ editingItem ? 'Edit FAQ' : 'Tambah FAQ' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Pertanyaan</label>
            <input
              type="text" required
              v-model="formData.question"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Jawaban</label>
            <textarea
              required rows="5"
              v-model="formData.answer"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Urutan Tampil</label>
            <input
              type="number" required min="1"
              v-model="formData.display_order"
              class="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <button
            type="submit"
            class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none transition-colors mt-4"
          >
            {{ editingItem ? 'Simpan Perubahan' : 'Tambah FAQ' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
