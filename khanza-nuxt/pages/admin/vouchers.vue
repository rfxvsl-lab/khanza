<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Kelola Voucher - Admin' });

interface Voucher {
  id: number;
  code: string;
  discount_percent: number;
  email_claimed: string;
  is_used: boolean | number;
}

const vouchers = ref<Voucher[]>([]);
const loading = ref(true);
const enabled = ref(true);
const defaultDiscount = ref(30);
const saving = ref(false);

const fetchVouchers = async () => {
  loading.value = true;
  const token = localStorage.getItem('adminToken');
  try {
    const data: any = await $fetch('/api/admin/vouchers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    vouchers.value = data.vouchers || [];
    enabled.value = data.enabled;
    defaultDiscount.value = data.default_discount || 30;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchVouchers();
});

const toggleEnabled = async () => {
  const token = localStorage.getItem('adminToken');
  saving.value = true;
  try {
    await $fetch('/api/admin/voucher-toggle', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { enabled: !enabled.value }
    });
    enabled.value = !enabled.value;
  } catch (err) {
    alert('Gagal mengubah pengaturan');
  } finally {
    saving.value = false;
  }
};

const saveDiscount = async () => {
  const token = localStorage.getItem('adminToken');
  saving.value = true;
  try {
    await $fetch('/api/admin/voucher-discount', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { discount: defaultDiscount.value }
    });
    alert('Diskon default disimpan');
  } catch (err) {
    alert('Gagal menyimpan');
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Yakin ingin menghapus voucher ini?')) return;
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/vouchers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchVouchers();
  } catch (err) {
    alert('Gagal menghapus');
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Kelola Voucher</h1>
    </div>

    <!-- Settings Card -->
    <div class="bg-white/5 border border-white/10 rounded-none p-6">
      <h2 class="text-lg font-bold mb-4">Pengaturan Voucher</h2>
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Toggle -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">Status Fitur Voucher</span>
          <button
            @click="toggleEnabled"
            :disabled="saving"
            class="flex items-center gap-2 px-4 py-2 rounded-none font-medium transition-all"
            :class="enabled ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
          >
            <Icon name="cil:toggle-on" v-if="enabled" :size="20" />
            <Icon name="cil:toggle-off" v-else :size="20" />
            {{ enabled ? 'Aktif' : 'Nonaktif' }}
          </button>
        </div>

        <!-- Default Discount -->
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-400">Diskon Default (%)</span>
          <input
            type="number" min="1" max="100"
            v-model="defaultDiscount"
            class="w-20 px-3 py-2 bg-black/50 border border-white/10 rounded-none text-white text-center focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
          <button
            @click="saveDiscount"
            :disabled="saving"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-none transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Voucher list -->
    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <div v-else class="bg-white/5 border border-white/10 rounded-none overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-white/5 border-b border-white/10">
            <th class="p-4 font-medium text-gray-400">Kode</th>
            <th class="p-4 font-medium text-gray-400">Diskon</th>
            <th class="p-4 font-medium text-gray-400">Email</th>
            <th class="p-4 font-medium text-gray-400">Status</th>
            <th class="p-4 font-medium text-gray-400 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vouchers" :key="v.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="p-4 font-mono font-bold flex items-center gap-2">
              <Icon name="cil:tag" :size="14" class="text-red-500/60" />
              {{ v.code }}
            </td>
            <td class="p-4 text-white">{{ v.discount_percent }}%</td>
            <td class="p-4 text-gray-400">{{ v.email_claimed }}</td>
            <td class="p-4">
              <span class="px-3 py-1 rounded-none text-xs font-bold uppercase"
                :class="v.is_used ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'"
              >
                {{ v.is_used ? 'Terpakai' : 'Aktif' }}
              </span>
            </td>
            <td class="p-4 text-right">
              <button
                @click="handleDelete(v.id)"
                class="p-2 text-red-400 hover:bg-red-400/10 rounded-none transition-colors"
              >
                <Icon name="cil:trash" :size="18" />
              </button>
            </td>
          </tr>
          <tr v-if="vouchers.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-500">Belum ada voucher.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
