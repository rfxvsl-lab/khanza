<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Langganan Newsletter - Admin' });

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

const subscribers = ref<Subscriber[]>([]);
const loading = ref(true);

const fetchSubscribers = async () => {
  loading.value = true;
  const token = localStorage.getItem('adminToken');
  try {
    const data: any = await $fetch('/api/admin/newsletters', {
      headers: { Authorization: `Bearer ${token}` }
    });
    subscribers.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSubscribers();
});

const handleDelete = async (id: number) => {
  if (!confirm('Yakin ingin menghapus subscriber ini?')) return;
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/newsletters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchSubscribers();
  } catch (err) {
    alert('Gagal menghapus');
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Langganan Newsletter</h1>
      <span class="text-sm text-gray-400">{{ subscribers.length }} subscriber</span>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <div v-else class="bg-white/5 border border-white/10 rounded-none overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-white/5 border-b border-white/10">
            <th class="p-4 font-medium text-gray-400">#</th>
            <th class="p-4 font-medium text-gray-400">Email</th>
            <th class="p-4 font-medium text-gray-400">Tanggal</th>
            <th class="p-4 font-medium text-gray-400 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sub, idx) in subscribers" :key="sub.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="p-4 text-gray-500">{{ idx + 1 }}</td>
            <td class="p-4 font-medium flex items-center gap-2">
              <Icon name="cil:envelope-closed" :size="16" class="text-red-500/60" />
              {{ sub.email }}
            </td>
            <td class="p-4 text-gray-400 text-sm">
              {{ sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' }}
            </td>
            <td class="p-4 text-right">
              <button
                @click="handleDelete(sub.id)"
                class="p-2 text-red-400 hover:bg-red-400/10 rounded-none transition-colors"
              >
                <Icon name="cil:trash" :size="18" />
              </button>
            </td>
          </tr>
          <tr v-if="subscribers.length === 0">
            <td colspan="4" class="p-8 text-center text-gray-500">Belum ada subscriber.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
