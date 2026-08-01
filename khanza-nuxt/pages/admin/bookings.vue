<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Kelola Reservasi - Admin' });

const bookings = ref<any[]>([]);
const loading = ref(true);
const router = useRouter();

const fetchBookings = async () => {
  loading.value = true;
  const token = localStorage.getItem('adminToken');
  try {
    const data: any = await $fetch('/api/admin/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    bookings.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBookings();
});

const updateStatus = async (id: number, status: string) => {
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/bookings/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { status }
    });
    fetchBookings();
  } catch (err) {
    alert('Gagal memperbarui status');
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Yakin ingin menghapus data reservasi ini?')) return;
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchBookings();
  } catch (err) {
    alert('Gagal menghapus reservasi');
  }
};

const statusLabels: Record<string, { text: string; color: string }> = {
  pending: { text: 'Menunggu', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  completed: { text: 'Selesai', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  cancelled: { text: 'Dibatalkan', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Kelola Reservasi</h1>
      <span class="text-sm text-gray-400">{{ bookings.length }} reservasi</span>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <div v-else-if="bookings.length === 0" class="text-center py-20 text-gray-500">
      Belum ada reservasi.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="bg-white/5 border border-white/10 rounded-none p-6 hover:bg-white/[0.07] transition-colors"
      >
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <!-- Left: Details -->
          <div class="flex-1 space-y-3">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-mono text-red-500 text-sm font-bold">#{{ booking.id }}</span>
              <span
                class="px-3 py-1 rounded-none text-xs font-bold uppercase border"
                :class="(statusLabels[booking.status] || statusLabels.pending).color"
              >
                {{ (statusLabels[booking.status] || statusLabels.pending).text }}
              </span>
              <span v-if="booking.voucher_code" class="px-3 py-1 rounded-none text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                <Icon name="cil:tag" :size="12" /> Voucher: {{ booking.voucher_code }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div class="flex items-center gap-2 text-sm">
                <Icon name="cil:user" :size="14" class="text-gray-500 shrink-0" />
                <span class="text-gray-400">Nama:</span>
                <span class="text-white font-medium">{{ booking.name || '-' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Icon name="cil:envelope-closed" :size="14" class="text-gray-500 shrink-0" />
                <span class="text-gray-400">Email:</span>
                <span class="text-white font-medium truncate">{{ booking.email || '-' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Icon name="cil:phone" :size="14" class="text-gray-500 shrink-0" />
                <span class="text-gray-400">Telepon:</span>
                <span class="text-white font-medium">{{ booking.phone || '-' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Icon name="cil:car-alt" :size="14" class="text-gray-500 shrink-0" />
                <span class="text-gray-400">Kendaraan:</span>
                <span class="text-white font-medium">{{ booking.vehicle_info }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-400">Layanan:</span>
                <span class="text-white font-medium">{{ booking.service_title || `ID: ${booking.service_id}` }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-400">Jadwal:</span>
                <span class="text-white font-medium">
                  {{ booking.scheduled_at ? formatDate(booking.scheduled_at) : '-' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex flex-wrap gap-2 md:flex-col">
            <select
              :value="booking.status"
              @change="updateStatus(booking.id, ($event.target as HTMLSelectElement).value)"
              class="px-3 py-2 bg-black/50 border border-white/10 rounded-none text-white text-sm focus:border-red-500 outline-none appearance-none cursor-pointer"
            >
              <option value="pending">Menunggu</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
            <div class="flex gap-2">
              <button
                @click="router.push('/admin/invoices')"
                class="px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-none text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1.5 flex-1 justify-center"
              >
                <Icon name="cil:file" :size="14" /> Invoice
              </button>
              <button
                @click="handleDelete(booking.id)"
                class="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-none text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1.5 justify-center"
                title="Hapus Reservasi"
              >
                <Icon name="cil:trash" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
