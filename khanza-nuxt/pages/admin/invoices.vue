<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Kelola Invoice - Admin' });

interface Invoice {
  id: number;
  doc_number?: string;
  client_name?: string;
  subtotal: number;
  discount_percent: number;
  total: number;
  payment_status: 'LUNAS' | 'DP';
  dp_amount: number;
  remaining_amount: number;
  created_at: string;
  metadata?: string;
}

const loading = ref(true);
const invoices = ref<Invoice[]>([]);
const isCreating = ref(false);
const currentStep = ref(1);

const company = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  signatureImage: null as string | null,
  stampImage: null as string | null
});

const faktur = ref({
  docNumber: '',
  date: new Date().toISOString().split('T')[0],
  customerName: '',
  customerAddress: '',
  items: [{ id: Date.now().toString(), description: '', quantity: 1, price: 0, total: 0 }],
  discount: 0,
  tax: 0,
  downPayment: 0,
  isDpBilling: false,
  signatureName: '',
  signatureLocation: '',
  notes: 'Terima kasih atas kepercayaan Anda.'
});

const fetchData = async () => {
  loading.value = true;
  const token = localStorage.getItem('adminToken');
  try {
    const [invData, setData]: any = await Promise.all([
      $fetch('/api/admin/invoices', { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
      $fetch('/api/settings').catch(() => ({}))
    ]);

    invoices.value = invData;
    company.value = {
      name: setData.invoice_company_name || '',
      address: setData.invoice_company_address || '',
      phone: setData.invoice_company_phone || '',
      email: setData.invoice_company_email || '',
      signatureImage: setData.invoice_company_signature || null,
      stampImage: setData.invoice_company_stamp || null
    };
    faktur.value.signatureName = setData.invoice_signature_name || '';
    faktur.value.signatureLocation = setData.invoice_signature_location || '';
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const generateDocNumber = () => {
  faktur.value.docNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

const handleNewInvoice = () => {
  generateDocNumber();
  faktur.value.items = [{ id: Date.now().toString(), description: '', quantity: 1, price: 0, total: 0 }];
  faktur.value.customerName = '';
  faktur.value.customerAddress = '';
  faktur.value.discount = 0;
  faktur.value.tax = 0;
  faktur.value.downPayment = 0;
  faktur.value.isDpBilling = false;
  isCreating.value = true;
  currentStep.value = 1;
};

const handleImageUpload = (field: 'signatureImage' | 'stampImage', e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files?.length) return;
  const file = target.files[0];
  if (file.size > 2 * 1024 * 1024) return alert('Maksimal 2MB');
  
  const reader = new FileReader();
  reader.onload = () => {
    company.value[field] = reader.result as string;
  };
  reader.readAsDataURL(file);
};

const addItem = () => {
  faktur.value.items.push({ id: Date.now().toString(), description: '', quantity: 1, price: 0, total: 0 });
};

const removeItem = (id: string) => {
  faktur.value.items = faktur.value.items.filter(i => i.id !== id);
};

const updateItem = (id: string, field: string, value: any) => {
  const item = faktur.value.items.find(i => i.id === id);
  if (item) {
    (item as any)[field] = value;
    if (field === 'quantity' || field === 'price') {
      item.total = item.quantity * item.price;
    }
  }
};

const subtotal = computed(() => faktur.value.items.reduce((sum, item) => sum + (item.total || 0), 0));
const taxAmount = computed(() => (subtotal.value - (faktur.value.discount || 0)) * ((faktur.value.tax || 0) / 100));
const grandTotal = computed(() => subtotal.value - (faktur.value.discount || 0) + taxAmount.value);
const totalAmount = computed(() => {
  if (faktur.value.downPayment) {
    return faktur.value.isDpBilling ? faktur.value.downPayment : grandTotal.value - faktur.value.downPayment;
  }
  return grandTotal.value;
});

const isSaving = ref(false);
const savedInvoiceId = ref<number | null>(null);

const handleSaveProfile = async () => {
  if (!company.value.name.trim() || !company.value.address.trim()) {
    return alert('Nama dan Alamat Perusahaan wajib diisi.');
  }
  
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        invoice_company_name: company.value.name,
        invoice_company_address: company.value.address,
        invoice_company_phone: company.value.phone,
        invoice_company_email: company.value.email,
        invoice_company_signature: company.value.signatureImage,
        invoice_company_stamp: company.value.stampImage,
        invoice_signature_name: faktur.value.signatureName,
        invoice_signature_location: faktur.value.signatureLocation,
      }
    });
    currentStep.value = 2;
  } catch (err) {
    alert('Gagal menyimpan profil perusahaan');
  }
};

const handleSaveInvoice = async () => {
  isSaving.value = true;
  const token = localStorage.getItem('adminToken');
  try {
    const res: any = await $fetch('/api/admin/invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        items: faktur.value.items,
        discount_percent: 0,
        subtotal: subtotal.value,
        total: totalAmount.value,
        payment_status: faktur.value.downPayment > 0 ? (faktur.value.isDpBilling ? 'DP' : 'LUNAS') : 'LUNAS',
        dp_amount: faktur.value.downPayment,
        remaining_amount: faktur.value.isDpBilling ? (grandTotal.value - faktur.value.downPayment) : 0,
        metadata: {
          docNumber: faktur.value.docNumber,
          date: faktur.value.date,
          customerName: faktur.value.customerName,
          customerAddress: faktur.value.customerAddress,
          discount: faktur.value.discount,
          tax: faktur.value.tax,
          notes: faktur.value.notes,
        }
      }
    });
    savedInvoiceId.value = res.id;
    currentStep.value = 3;
    fetchData(); // refresh table in background
  } catch (err) {
    alert('Gagal menyimpan invoice');
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Yakin ingin menghapus invoice ini?')) return;
  const token = localStorage.getItem('adminToken');
  try {
    await $fetch(`/api/admin/invoices/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  } catch (err) {
    alert('Gagal menghapus');
  }
};

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
};

const printInvoice = () => {
  const printContent = document.getElementById('invoice-print');
  if (!printContent) return;
  const w = window.open('', '', 'width=800,height=900');
  if (!w) return;
  w.document.write(`<html><head><title>Invoice ${faktur.value.docNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
  body { padding: 40px; color: #111; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #dc2626; padding-bottom: 20px; }
  .header-left h1 { font-size: 24px; color: #111; text-transform: uppercase; margin-bottom: 5px; }
  .header-left p { font-size: 14px; color: #555; white-space: pre-line; }
  .header-right { text-align: right; }
  .inv-title { font-size: 32px; font-weight: bold; color: #dc2626; margin-bottom: 5px; letter-spacing: 2px; }
  .inv-no { font-size: 16px; color: #333; font-weight: bold; }
  .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .info-block h4 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 8px; letter-spacing: 1px; }
  .info-block p { font-size: 14px; color: #222; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  th { background: #f8f9fa; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #555; border-bottom: 2px solid #ddd; }
  td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
  .totals-wrapper { display: flex; justify-content: space-between; align-items: flex-start; }
  .notes { width: 50%; font-size: 13px; color: #666; background: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 3px solid #dc2626; }
  .totals { width: 40%; text-align: right; }
  .totals-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; color: #444; }
  .totals-row.grand { font-size: 20px; font-weight: bold; color: #dc2626; border-top: 2px solid #dc2626; padding-top: 10px; margin-top: 10px; }
  .signature-section { margin-top: 60px; display: flex; justify-content: flex-end; }
  .signature-box { text-align: center; width: 200px; position: relative; }
  .signature-box p { font-size: 14px; color: #333; }
  .sig-img { height: 80px; object-fit: contain; margin: 10px 0; z-index: 2; position: relative; }
  .stamp-img { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); height: 100px; opacity: 0.7; mix-blend-mode: multiply; z-index: 1; }
  .sig-name { font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 5px; }
</style></head><body>`);
  w.document.write(printContent.innerHTML);
  w.document.write('</body></html>');
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 500);
};

const inputClass = "w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors";
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-white tracking-tight">Kelola Invoice</h1>
      <button
        v-if="!isCreating"
        @click="handleNewInvoice"
        class="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-600/20"
      >
        <Icon name="cil:plus" :size="20" /> Buat Invoice Native
      </button>
      <button
        v-else
        @click="isCreating = false"
        class="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
      >
        <Icon name="cil:arrow-left" :size="20" /> Kembali ke Tabel
      </button>
    </div>

    <!-- MAIN TABLE VIEW -->
    <div v-if="!isCreating">
      <div v-if="loading" class="flex justify-center py-20">
        <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
      </div>
      <div v-else class="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-white/5 border-b border-white/10">
                <th class="p-4 font-semibold text-gray-400">ID / Dokumen</th>
                <th class="p-4 font-semibold text-gray-400">Pelanggan</th>
                <th class="p-4 font-semibold text-gray-400">Total</th>
                <th class="p-4 font-semibold text-gray-400">Status</th>
                <th class="p-4 font-semibold text-gray-400">Tanggal</th>
                <th class="p-4 font-semibold text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in invoices" :key="inv.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="p-4">
                  <div class="font-mono text-red-500 font-bold">
                    {{ (inv.metadata && JSON.parse(inv.metadata).docNumber) || `INV-${String(inv.id).padStart(4, '0')}` }}
                  </div>
                </td>
                <td class="p-4 font-medium text-gray-200">
                  {{ (inv.metadata && JSON.parse(inv.metadata).customerName) || inv.client_name || '-' }}
                </td>
                <td class="p-4 font-bold text-white">{{ formatRupiah(inv.total) }}</td>
                <td class="p-4">
                  <span class="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
                    :class="inv.payment_status === 'LUNAS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'"
                  >
                    {{ inv.payment_status || 'LUNAS' }}
                  </span>
                </td>
                <td class="p-4 text-gray-400 text-sm">
                  {{ inv.created_at ? new Date(inv.created_at).toLocaleDateString('id-ID') : '-' }}
                </td>
                <td class="p-4 flex justify-end gap-2">
                  <button @click="handleDelete(inv.id)" class="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                    <Icon name="cil:trash" :size="20" />
                  </button>
                </td>
              </tr>
              <tr v-if="invoices.length === 0">
                <td colspan="6" class="p-12 text-center text-gray-500">Belum ada invoice yang dibuat.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- EDITOR NATIVE VIEW -->
    <div v-else class="space-y-6">
      <!-- Stepper -->
      <div class="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 border-b border-white/10">
        <div v-for="step in [{id:1, label:'Profil Perusahaan'}, {id:2, label:'Editor Faktur'}, {id:3, label:'Selesai'}]" :key="step.id" class="flex items-center">
          <button
            @click="currentStep = step.id <= 2 ? step.id : currentStep"
            class="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-colors text-sm whitespace-nowrap"
            :class="currentStep === step.id ? 'bg-red-600/20 text-red-500 border border-red-500/30' : (currentStep > step.id ? 'text-green-500 hover:bg-white/5' : 'text-gray-500')"
          >
            <div class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                 :class="currentStep === step.id ? 'bg-red-600 text-white' : (currentStep > step.id ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400')">
              {{ currentStep > step.id ? '✓' : step.id }}
            </div>
            {{ step.label }}
          </button>
          <div v-if="step.id < 3" class="w-8 sm:w-12 h-px bg-white/10 mx-2"></div>
        </div>
      </div>

      <!-- STEP 1: Profil Perusahaan -->
      <div v-if="currentStep === 1" class="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-xl shadow-xl max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white mb-2">Profil Perusahaan</h2>
          <p class="text-gray-400 text-sm">Informasi ini akan muncul di bagian header (*kop*) faktur Anda. Data akan tersimpan otomatis untuk faktur berikutnya.</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Nama Perusahaan *</label>
            <input type="text" v-model="company.name" placeholder="Khanza Repaint" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Alamat Perusahaan *</label>
            <textarea v-model="company.address" rows="3" placeholder="Jl. Raya Otomotif No. 1..." :class="[inputClass, 'resize-none']"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Telepon</label>
              <input type="text" v-model="company.phone" placeholder="0812..." :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input type="email" v-model="company.email" placeholder="admin@..." :class="inputClass" />
            </div>
          </div>
        </div>

        <div class="border-t border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Gambar TTD (PNG Transparan)</label>
            <div v-if="company.signatureImage" class="relative inline-block bg-white/10 p-2 rounded-lg border border-white/10">
              <img :src="company.signatureImage" alt="TTD" class="h-16 object-contain" />
              <button @click="company.signatureImage = null" class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow">
                <Icon name="cil:x" :size="14" />
              </button>
            </div>
            <input v-else type="file" accept="image/*" @change="e => handleImageUpload('signatureImage', e)" class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700" />
            
            <div class="mt-4">
              <label class="block text-xs font-semibold text-gray-400 mb-1">Nama Penandatangan</label>
              <input type="text" v-model="faktur.signatureName" placeholder="John Doe" :class="[inputClass, 'py-1.5 text-sm']" />
            </div>
            <div class="mt-2">
              <label class="block text-xs font-semibold text-gray-400 mb-1">Lokasi (Kota)</label>
              <input type="text" v-model="faktur.signatureLocation" placeholder="Jakarta" :class="[inputClass, 'py-1.5 text-sm']" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Stempel Perusahaan (PNG)</label>
            <div v-if="company.stampImage" class="relative inline-block bg-white/10 p-2 rounded-lg border border-white/10">
              <img :src="company.stampImage" alt="Stempel" class="h-16 object-contain" />
              <button @click="company.stampImage = null" class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow">
                <Icon name="cil:x" :size="14" />
              </button>
            </div>
            <input v-else type="file" accept="image/*" @change="e => handleImageUpload('stampImage', e)" class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700" />
            <p class="text-xs text-gray-500 mt-2">Stempel akan diletakkan menumpuk di atas tanda tangan saat dicetak.</p>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-white/10">
          <button @click="handleSaveProfile" class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20">
            Lanjut ke Faktur <Icon name="cil:arrow-right" :size="18" />
          </button>
        </div>
      </div>

      <!-- STEP 2: Editor Faktur -->
      <div v-if="currentStep === 2" class="animate-fade-in space-y-6">
        <div class="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div class="bg-black/50 px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-600/20 text-red-500 rounded-lg">
                <Icon name="cil:file" :size="24" />
              </div>
              <div>
                <h3 class="font-bold text-white text-lg">Editor Faktur</h3>
                <p class="text-xs text-gray-400">Dari: {{ company.name || 'Perusahaan' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <input type="text" v-model="faktur.docNumber" class="px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-red-400 font-mono font-bold text-sm w-full sm:w-48 text-center outline-none focus:border-red-500" />
              <button @click="generateDocNumber" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Generate Ulang">
                <Icon name="cil:reload" :size="16" />
              </button>
            </div>
          </div>

          <div class="p-6 sm:p-8 space-y-8">
            <!-- Customer & Date -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-black/30 p-5 rounded-xl border border-white/5 space-y-4">
                <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Penagihan Kepada</h4>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Nama Pelanggan</label>
                  <input type="text" v-model="faktur.customerName" placeholder="Nama..." :class="inputClass" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Alamat Pelanggan</label>
                  <textarea v-model="faktur.customerAddress" rows="2" placeholder="Alamat lengkap..." :class="[inputClass, 'resize-none']"></textarea>
                </div>
              </div>
              <div class="bg-black/30 p-5 rounded-xl border border-white/5 space-y-4">
                <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Informasi Faktur</h4>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Tanggal</label>
                  <input type="date" v-model="faktur.date" :class="inputClass" />
                </div>
              </div>
            </div>

            <!-- Items -->
            <div>
              <h4 class="text-lg font-bold text-white border-b border-white/10 pb-3 mb-4">Daftar Barang & Jasa</h4>
              <div class="space-y-3">
                <div v-for="(item, idx) in faktur.items" :key="item.id" class="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div class="w-full sm:flex-1">
                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 sm:hidden">Deskripsi</label>
                    <input type="text" :value="item.description" @input="e => updateItem(item.id, 'description', (e.target as HTMLInputElement).value)" placeholder="Nama layanan..." class="w-full px-3 py-2 bg-transparent border-b border-transparent focus:border-red-500 focus:outline-none sm:text-sm font-medium text-white placeholder:text-gray-600 transition-colors" />
                  </div>
                  <div class="flex w-full sm:w-auto gap-3 items-end sm:items-center">
                    <div class="w-24">
                      <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 sm:hidden">Qty</label>
                      <input type="number" min="1" :value="item.quantity" @input="e => updateItem(item.id, 'quantity', Number((e.target as HTMLInputElement).value))" class="w-full px-3 py-2 bg-black border border-white/10 rounded-lg focus:ring-1 focus:ring-red-500 outline-none sm:text-sm text-center text-white" />
                    </div>
                    <div class="flex-1 sm:w-40">
                      <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 sm:hidden">Harga</label>
                      <input type="number" min="0" :value="item.price" @input="e => updateItem(item.id, 'price', Number((e.target as HTMLInputElement).value))" class="w-full px-3 py-2 bg-black border border-white/10 rounded-lg focus:ring-1 focus:ring-red-500 outline-none sm:text-sm text-right text-white" placeholder="Rp..." />
                    </div>
                    <div class="w-36 hidden sm:flex justify-end font-bold text-red-500">
                      {{ formatRupiah(item.total) }}
                    </div>
                    <button @click="removeItem(item.id)" class="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Icon name="cil:trash" :size="20" />
                    </button>
                  </div>
                </div>
              </div>
              <button @click="addItem" class="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-lg transition-colors border border-red-500/20 hover:border-red-500">
                <Icon name="cil:plus" :size="16" /> Tambah Baris
              </button>
            </div>

            <!-- Totals & Notes -->
            <div class="flex flex-col md:flex-row gap-8 border-t border-white/10 pt-8">
              <div class="flex-1">
                <label class="block text-sm font-semibold text-gray-400 mb-2">Catatan (Tampil di cetakan)</label>
                <textarea v-model="faktur.notes" rows="5" placeholder="Terima kasih..." :class="[inputClass, 'resize-none']"></textarea>
              </div>
              <div class="w-full md:w-[350px] bg-black/40 p-6 rounded-xl border border-white/5 space-y-4">
                <div class="flex justify-between text-sm text-gray-300">
                  <span>Subtotal</span>
                  <span class="font-bold text-white">{{ formatRupiah(subtotal) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm gap-4">
                  <span class="text-gray-400">Diskon (Rp)</span>
                  <input type="number" min="0" v-model="faktur.discount" class="w-32 px-2 py-1 bg-black border border-white/10 rounded focus:border-red-500 outline-none text-right text-white" />
                </div>
                <div class="flex justify-between items-center text-sm gap-4">
                  <span class="text-gray-400">Pajak (%)</span>
                  <input type="number" min="0" max="100" v-model="faktur.tax" class="w-32 px-2 py-1 bg-black border border-white/10 rounded focus:border-red-500 outline-none text-right text-white" />
                </div>
                <div class="flex justify-between items-center text-sm gap-4 border-t border-white/10 pt-3">
                  <span class="text-gray-400">Down Payment (Rp)</span>
                  <input type="number" min="0" v-model="faktur.downPayment" class="w-32 px-2 py-1 bg-black border border-white/10 rounded focus:border-red-500 outline-none text-right text-white" />
                </div>
                <div class="flex justify-between items-center text-xs gap-2 pt-1">
                  <span class="text-gray-500">Hanya tagihkan DP?</span>
                  <input type="checkbox" v-model="faktur.isDpBilling" class="accent-red-500 w-4 h-4 cursor-pointer" />
                </div>
                <div class="border-t border-white/10 pt-4 mt-2 flex justify-between items-end">
                  <span class="font-bold text-gray-400 uppercase text-xs tracking-wider mb-1">Total Tagihan</span>
                  <span class="font-bold text-2xl text-red-500">{{ formatRupiah(totalAmount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center pb-10">
          <button @click="currentStep = 1" class="px-5 py-2.5 text-gray-400 hover:text-white transition-colors font-medium">Kembali</button>
          <button @click="handleSaveInvoice" :disabled="isSaving" class="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20">
            <Icon v-if="isSaving" name="cil:reload" class="animate-spin" :size="20" />
            <Icon v-else name="cil:save" :size="20" />
            Simpan Faktur
          </button>
        </div>
      </div>

      <!-- STEP 3: Preview -->
      <div v-if="currentStep === 3" class="animate-fade-in space-y-6 max-w-4xl mx-auto pb-10">
        <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
            <Icon name="cil:check-circle" :size="32" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Faktur Berhasil Disimpan!</h2>
          <p class="text-gray-400">Anda dapat mencetak atau menyimpannya sebagai PDF menggunakan tombol di bawah.</p>
        </div>

        <div class="flex gap-4 justify-center">
          <button @click="handleNewInvoice" class="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <Icon name="cil:plus" :size="20" /> Buat Baru
          </button>
          <button @click="printInvoice" class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20">
            <Icon name="cil:print" :size="20" /> Cetak / PDF
          </button>
        </div>

        <!-- Hidden Print Template container -->
        <div id="invoice-print" class="hidden">
          <div class="header">
            <div class="header-left">
              <h1>{{ company.name || 'Khanza Repaint' }}</h1>
              <p>{{ company.address }}<br>{{ company.phone ? 'Telp: ' + company.phone : '' }}<br>{{ company.email }}</p>
            </div>
            <div class="header-right">
              <div class="inv-title">INVOICE</div>
              <div class="inv-no">{{ faktur.docNumber }}</div>
              <div style="font-size:12px; color:#777; margin-top:5px;">Tanggal: {{ faktur.date ? new Date(faktur.date).toLocaleDateString('id-ID') : '' }}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-block">
              <h4>Ditagihkan Kepada</h4>
              <p>{{ faktur.customerName || '-' }}</p>
              <p style="font-weight:normal; color:#555; white-space:pre-line;">{{ faktur.customerAddress }}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th style="text-align:center; width:80px;">Qty</th>
                <th style="text-align:right; width:150px;">Harga Satuan</th>
                <th style="text-align:right; width:150px;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in faktur.items" :key="item.id">
                <td>{{ item.description }}</td>
                <td style="text-align:center;">{{ item.quantity }}</td>
                <td style="text-align:right;">{{ formatRupiah(item.price) }}</td>
                <td style="text-align:right; font-weight:500;">{{ formatRupiah(item.total) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-wrapper">
            <div class="notes">
              <strong>Catatan:</strong><br>
              <span style="white-space:pre-line;">{{ faktur.notes }}</span>
            </div>
            <div class="totals">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>{{ formatRupiah(subtotal) }}</span>
              </div>
              <div v-if="faktur.discount > 0" class="totals-row" style="color: #16a34a;">
                <span>Diskon:</span>
                <span>-{{ formatRupiah(faktur.discount) }}</span>
              </div>
              <div v-if="faktur.tax > 0" class="totals-row">
                <span>Pajak ({{ faktur.tax }}%):</span>
                <span>+{{ formatRupiah(taxAmount) }}</span>
              </div>
              <div class="totals-row grand">
                <span>Total:</span>
                <span>{{ formatRupiah(grandTotal) }}</span>
              </div>
              <div v-if="faktur.downPayment > 0" class="totals-row" style="margin-top:20px; border-top:1px dashed #ccc; padding-top:10px;">
                <span>Telah Dibayar (DP):</span>
                <span>{{ formatRupiah(faktur.downPayment) }}</span>
              </div>
              <div v-if="faktur.downPayment > 0" class="totals-row" style="font-weight:bold; color:#111;">
                <span>Sisa Pembayaran:</span>
                <span>{{ formatRupiah(grandTotal - faktur.downPayment) }}</span>
              </div>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <p>{{ faktur.signatureLocation || 'Jakarta' }}, {{ faktur.date ? new Date(faktur.date).toLocaleDateString('id-ID') : '' }}</p>
              <div style="position:relative; height:120px; display:flex; align-items:center; justify-content:center;">
                <img v-if="company.stampImage" :src="company.stampImage" class="stamp-img" />
                <img v-if="company.signatureImage" :src="company.signatureImage" class="sig-img" />
              </div>
              <div class="sig-name">{{ faktur.signatureName || 'Pimpinan' }}</div>
              <div style="font-size:12px; color:#666;">{{ company.name || 'Manajemen' }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
