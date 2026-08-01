<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

useSeoMeta({
  title: 'Reservasi',
  description: 'Jadwalkan layanan otomotif premium Anda. Tim ahli kami siap mentransformasi kendaraan Anda.'
});

const route = useRoute();
const settings = useSettings();
const services = ref<any[]>([]);

const STEPS = ['Pribadi', 'Kendaraan', 'Jadwal', 'Konfirmasi'];
const currentStep = ref(0);
const formData = ref({
  name: '', email: '', phone: '',
  make: '', model: '', year: '',
  service: (route.query.service as string) || '', date: '', time: '',
  voucher_code: ''
});

const status = ref<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
const voucherInfo = ref<{ valid: boolean; discount_percent: number; code: string } | null>(null);
const voucherChecking = ref(false);

onMounted(async () => {
  try {
    const data = await $fetch('/api/services');
    services.value = data as any[];
  } catch (e) {
    console.error(e);
  }
});

const validateVoucher = async () => {
  if (!formData.value.voucher_code.trim()) return;
  voucherChecking.value = true;
  try {
    const data: any = await $fetch('/api/validate-voucher', {
      method: 'POST',
      body: { code: formData.value.voucher_code.trim() }
    });
    voucherInfo.value = { valid: true, discount_percent: data.discount_percent, code: data.code };
  } catch (err: any) {
    voucherInfo.value = null;
    status.value = { type: 'error', message: err.response?._data?.statusMessage || 'Voucher tidak valid' };
    setTimeout(() => status.value = { type: 'idle', message: '' }, 3000);
  } finally {
    voucherChecking.value = false;
  }
};

const handleVoucherInput = () => {
  voucherInfo.value = null;
};

const handleSubmit = async () => {
  status.value = { type: 'loading', message: 'Memeriksa ketersediaan...' };
  try {
    const data: any = await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        date: `${formData.value.date}T${formData.value.time}`,
        service: formData.value.service,
        vehicle_info: `${formData.value.year} ${formData.value.make} ${formData.value.model}`,
        name: formData.value.name,
        email: formData.value.email,
        phone: formData.value.phone,
        voucher_code: voucherInfo.value?.valid ? formData.value.voucher_code.trim() : null
      },
    });
    status.value = { type: 'success', message: 'Reservasi berhasil dikonfirmasi!' };
    formData.value = { name: '', email: '', phone: '', make: '', model: '', year: '', service: '', date: '', time: '', voucher_code: '' };
    voucherInfo.value = null;
  } catch (err: any) {
    status.value = { type: 'error', message: err.response?._data?.statusMessage || 'Gagal membuat reservasi.' };
  }
};

const nextStep = () => { currentStep.value = Math.min(currentStep.value + 1, 3); };
const prevStep = () => { currentStep.value = Math.max(currentStep.value - 1, 0); };

const getServiceName = (id: string) => {
  const svc = services.value.find(s => String(s.id) === String(id));
  return svc ? svc.title : `Layanan #${id}`;
};

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

const inputClass = "w-full px-4 py-3.5 rounded-none bg-black/50 border border-white/[0.08] text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all";
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-16 md:py-20">
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="mb-12"
    >
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-[2px] bg-red-500" />
        <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Jadwalkan Kunjungan</span>
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
        Buat <span class="text-transparent bg-clip-text bg-red-600">Reservasi</span>
      </h1>
      <p class="text-gray-500 max-w-xl text-lg">
        Jadwalkan layanan otomotif premium Anda. Tim ahli kami siap mentransformasi kendaraan Anda.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 200 } }"
          class="bg-white/[0.02] border border-white/[0.06] rounded-none p-6 md:p-8"
        >
          <div v-if="status.type === 'success'" class="text-center py-16 flex flex-col items-center">
            <div class="w-20 h-20 rounded-none bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
              <Icon name="cil:check-circle" 2 :size="40" />
            </div>
            <h2 class="text-3xl font-bold text-white mb-3">Reservasi Dikonfirmasi!</h2>
            <p class="text-gray-500 max-w-md mb-8">
              Terima kasih telah memilih {{ settings.site_name }}. Kami akan menghubungi Anda untuk konfirmasi detail.
            </p>
            <button
              @click="status.type = 'idle'; currentStep = 0;"
              class="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold rounded-none transition-all"
            >
              Buat Reservasi Lagi
            </button>
          </div>

          <div v-else>
            <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              <div v-for="(step, idx) in STEPS" :key="step" class="flex items-center gap-2 flex-shrink-0">
                <div
                  :class="['w-8 h-8 rounded-none flex items-center justify-center text-sm font-bold transition-all',
                    idx === currentStep ? 'bg-red-600 text-white' : idx < currentStep ? 'bg-red-500/20 text-red-500' : 'bg-white/[0.04] text-gray-600'
                  ]"
                >
                  {{ idx < currentStep ? '✓' : idx + 1 }}
                </div>
                <span :class="['text-sm font-medium hidden sm:inline', idx === currentStep ? 'text-white' : 'text-gray-600']">{{ step }}</span>
                <div v-if="idx < 3" :class="['w-6 md:w-10 h-[1px]', idx < currentStep ? 'bg-red-500/30' : 'bg-white/[0.06]']" />
              </div>
            </div>

            <form @submit.prevent="handleSubmit">
              <Transition name="fade" mode="out-in">
                <!-- Step 0 -->
                <div v-if="currentStep === 0" key="step-0" class="space-y-4">
                  <h3 class="text-lg font-bold text-white mb-4">Data Pribadi</h3>
                  <div class="relative">
                    <Icon name="cil:user" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
                    <input type="text" required v-model="formData.name" placeholder="Nama Lengkap" :class="`${inputClass} pl-12`" />
                  </div>
                  <div class="relative">
                    <Icon name="cil:envelope-closed" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
                    <input type="email" required v-model="formData.email" placeholder="Alamat Email" :class="`${inputClass} pl-12`" />
                  </div>
                  <div class="relative">
                    <Icon name="cil:phone" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
                    <input type="tel" required v-model="formData.phone" placeholder="Nomor Telepon" :class="`${inputClass} pl-12`" />
                  </div>
                </div>

                <!-- Step 1 -->
                <div v-else-if="currentStep === 1" key="step-1" class="space-y-4">
                  <h3 class="text-lg font-bold text-white mb-4">Kendaraan & Layanan</h3>
                  <div class="grid grid-cols-2 gap-3">
                    <input type="text" required v-model="formData.make" placeholder="Merek (cth. Toyota)" :class="inputClass" />
                    <input type="text" required v-model="formData.model" placeholder="Model (cth. Avanza)" :class="inputClass" />
                  </div>
                  <input type="text" v-model="formData.year" placeholder="Tahun (cth. 2023)" :class="inputClass" />
                  <div class="relative">
                    <Icon name="cil:car-alt" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
                    <select required v-model="formData.service" :class="`${inputClass} pl-12 appearance-none`">
                      <option value="" disabled>Pilih Layanan</option>
                      <option v-for="svc in services" :key="svc.id" :value="svc.id">
                        {{ svc.title }} — {{ formatRupiah(svc.price) }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Step 2 -->
                <div v-else-if="currentStep === 2" key="step-2" class="space-y-4">
                  <h3 class="text-lg font-bold text-white mb-4">Jadwal & Voucher</h3>
                  <div class="relative">
                    <Calendar class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
                    <input type="date" required v-model="formData.date" :min="new Date().toISOString().split('T')[0]" :class="`${inputClass} pl-12 [color-scheme:dark]`" />
                  </div>
                  <div class="relative">
                    <Icon name="cil:clock" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
                    <input type="time" required v-model="formData.time" :class="`${inputClass} pl-12 [color-scheme:dark]`" />
                  </div>

                  <!-- Voucher -->
                  <div class="mt-6 p-4 rounded-none bg-white/[0.02] border border-white/[0.06]">
                    <label class="text-sm font-medium text-gray-400 mb-2 block">Kode Voucher (Opsional)</label>
                    <div class="flex gap-2">
                      <div class="relative flex-1">
                        <Icon name="cil:tag" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
                        <input
                          type="text"
                          v-model="formData.voucher_code"
                          @input="handleVoucherInput"
                          placeholder="Masukkan kode voucher"
                          :class="`${inputClass} pl-12 uppercase`"
                        />
                      </div>
                      <button
                        type="button"
                        @click="validateVoucher"
                        :disabled="!formData.voucher_code.trim() || voucherChecking"
                        class="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-none transition-colors disabled:opacity-40 text-sm whitespace-nowrap"
                      >
                        {{ voucherChecking ? 'Cek...' : 'Validasi' }}
                      </button>
                    </div>
                    <div v-if="voucherInfo?.valid" class="mt-3 flex items-center gap-2 p-3 rounded-none bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                      <Icon name="cil:check-circle" 2 :size="16" />
                      Voucher valid! Diskon {{ voucherInfo.discount_percent }}% akan diterapkan.
                    </div>
                  </div>
                </div>

                <!-- Step 3 -->
                <div v-else-if="currentStep === 3" key="step-3">
                  <h3 class="text-lg font-bold text-white mb-6">Ringkasan Reservasi</h3>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between py-3 border-b border-white/[0.04]"><span class="text-gray-500 text-sm">Nama</span><span class="text-white text-sm font-medium">{{ formData.name }}</span></div>
                    <div class="flex items-center justify-between py-3 border-b border-white/[0.04]"><span class="text-gray-500 text-sm">Email</span><span class="text-white text-sm font-medium">{{ formData.email }}</span></div>
                    <div class="flex items-center justify-between py-3 border-b border-white/[0.04]"><span class="text-gray-500 text-sm">Telepon</span><span class="text-white text-sm font-medium">{{ formData.phone }}</span></div>
                    <div class="flex items-center justify-between py-3 border-b border-white/[0.04]"><span class="text-gray-500 text-sm">Kendaraan</span><span class="text-white text-sm font-medium">{{ formData.year }} {{ formData.make }} {{ formData.model }}</span></div>
                    <div class="flex items-center justify-between py-3 border-b border-white/[0.04]"><span class="text-gray-500 text-sm">Layanan</span><span class="text-white text-sm font-medium">{{ getServiceName(formData.service) }}</span></div>
                    <div class="flex items-center justify-between py-3 border-b border-white/[0.04]"><span class="text-gray-500 text-sm">Tanggal & Waktu</span><span class="text-white text-sm font-medium">{{ formData.date }} pukul {{ formData.time }}</span></div>
                    <div v-if="voucherInfo?.valid" class="flex items-center justify-between py-3 border-b border-white/[0.04]">
                      <span class="text-gray-500 text-sm">Voucher</span>
                      <span class="text-green-400 text-sm font-bold flex items-center gap-1.5"><Icon name="cil:tag" :size="14" /> {{ formData.voucher_code }} (-{{ voucherInfo.discount_percent }}%)</span>
                    </div>
                  </div>
                </div>
              </Transition>

              <div v-if="status.type === 'error'" class="flex items-center gap-3 p-4 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 mt-6">
                <Icon name="cil:warning" :size="18" />
                <p class="text-sm">{{ status.message }}</p>
              </div>

              <div class="flex items-center justify-between mt-8 gap-3">
                <button v-if="currentStep > 0" type="button" @click="prevStep" class="flex items-center gap-2 px-5 py-3 bg-white/[0.04] border border-white/[0.06] text-white font-medium rounded-none hover:bg-white/[0.08] transition-all text-sm">
                  <Icon name="cil:arrow-left" :size="16" /> Kembali
                </button>
                <div v-else></div>

                <button v-if="currentStep < 3" type="button" @click="nextStep" class="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-none hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all text-sm">
                  Selanjutnya <Icon name="cil:arrow-right" :size="16" />
                </button>
                <button v-else type="submit" :disabled="status.type === 'loading'" class="flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-bold rounded-none hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 text-sm">
                  {{ status.type === 'loading' ? 'Memproses...' : 'Konfirmasi Reservasi' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="hidden lg:block space-y-6">
        <div class="bg-white/[0.02] border border-white/[0.06] rounded-none p-6">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Jam Operasional</h3>
          <ul class="space-y-3 text-sm">
            <li class="flex justify-between text-gray-500"><span>Sen — Jum</span><span class="text-white">08.00 — 18.00</span></li>
            <li class="flex justify-between text-gray-500"><span>Sabtu</span><span class="text-white">09.00 — 16.00</span></li>
            <li class="flex justify-between text-gray-500"><span>Minggu</span><span class="text-red-500">Tutup</span></li>
          </ul>
        </div>
        <div class="bg-white/[0.02] border border-white/[0.06] rounded-none p-6">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kontak</h3>
          <ul class="space-y-3">
            <li class="flex items-center gap-3 text-gray-500 text-sm"><Icon name="cil:phone" :size="14" class="text-red-500/70 shrink-0" /> 0881-0364-92931</li>
            <li class="flex items-center gap-3 text-gray-500 text-sm"><Icon name="cil:envelope-closed" :size="14" class="text-red-500/70 shrink-0" /> admin@khanzarepaint.com</li>
            <li class="flex items-start gap-3 text-gray-500 text-sm leading-relaxed"><Icon name="cil:location-pin" :size="14" class="text-red-500/70 shrink-0 mt-1" /> Jl. Cokroaminoto RW V No.18, Mojosari, Ngenep, Kec. Karang Ploso, Kabupaten Malang, Jawa Timur 65152</li>
          </ul>
        </div>
        <div class="bg-red-600 border border-red-500/10 rounded-none p-6 text-center">
          <p class="text-sm text-gray-400 mb-2">Butuh bantuan memilih?</p>
          <p class="text-white font-semibold">Hubungi kami untuk konsultasi gratis</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(20px); }
.fade-leave-to { transform: translateX(-20px); }
</style>
