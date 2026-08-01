<script setup lang="ts">
import { ref, onMounted } from 'vue';

useSeoMeta({
  title: 'Beranda',
  description: 'Repaint Mobil Premium & Detailing. Kami menggabungkan teknologi canggih dengan keahlian pengrajin untuk hasil yang tak tertandingi.'
});

const settings = useSettings();
const loading = ref(true);
const content = ref({ title: '', description: '', hero_image: '' });
const voucherEnabled = ref(true);

const email = ref('');
const voucherStatus = ref<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

// Voucher modal
const showVoucherModal = ref(false);
const voucherCode = ref('');
const voucherDiscount = ref(0);
const copied = ref(false);
const canClose = ref(false);

onMounted(async () => {
  try {
    const data = await $fetch('/api/content-home');
    content.value = data as any;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }

  try {
    const isClaimedLocal = localStorage.getItem('voucher_claimed');
    if (isClaimedLocal === 'true') {
      voucherEnabled.value = false;
      return;
    }
    const data: any = await $fetch('/api/voucher-status');
    voucherEnabled.value = data.enabled;
  } catch (e) {
    // default true
  }
});

const copyToClipboard = () => {
  navigator.clipboard.writeText(voucherCode.value);
  copied.value = true;
  canClose.value = true;
  setTimeout(() => copied.value = false, 2000);
};

const handleClaimVoucher = async () => {
  voucherStatus.value = { type: 'loading', message: 'Memproses...' };
  try {
    const data: any = await $fetch('/api/claim-voucher', {
      method: 'POST',
      body: { email: email.value },
    });
    
    localStorage.setItem('voucher_claimed', 'true');
    voucherCode.value = data.code;
    voucherDiscount.value = data.discount;
    canClose.value = false;
    copied.value = false;
    showVoucherModal.value = true;
    voucherStatus.value = { type: 'idle', message: '' };
    email.value = '';
  } catch (err: any) {
    const msg = err.response?._data?.statusMessage || 'Terjadi kesalahan. Silakan coba lagi.';
    voucherStatus.value = { type: 'error', message: msg };
  }
};

const splitTitle = (title: string) => {
  if(!title) return [];
  const words = title.split(' ');
  const lastTwo = words.slice(-2);
  const rest = words.slice(0, -2);
  return { rest: rest.join(' '), lastTwo: lastTwo.join(' ') };
};

const stats = [
  { value: 500, suffix: '+', label: 'Mobil Dicat' },
  { value: 10, suffix: '+', label: 'Tahun Pengalaman' },
  { value: 100, suffix: '%', label: 'Tingkat Kepuasan' },
  { value: 5, suffix: ' Thn', label: 'Garansi Cat' },
];

const features = [
  { icon: 'cil:diamond', title: 'Material Premium', desc: 'Kami hanya menggunakan cat dan clear coat kualitas tertinggi untuk hasil yang tahan lama dan sempurna.' },
  { icon: 'cil:shield-alt', title: 'Teknisi Ahli', desc: 'Tim kami terdiri dari profesional bersertifikat dengan pengalaman gabungan puluhan tahun.' },
  { icon: 'cil:drop', title: 'Detailing Presisi', desc: 'Setiap lekuk dan sudut diperhatikan dengan teliti, memastikan hasil yang sempurna tanpa cela.' }
];

const processes = [
  { step: '01', icon: 'cil:clipboard', title: 'Konsultasi', desc: 'Diskusikan keinginan Anda dan dapatkan penawaran detail yang disesuaikan.' },
  { step: '02', icon: 'cil:car-alt', title: 'Serah Terima', desc: 'Bawa kendaraan Anda ke fasilitas kami sesuai jadwal yang ditentukan.' },
  { step: '03', icon: 'cil:settings', title: 'Pengerjaan', desc: 'Tim ahli kami bekerja dengan alat presisi dan material premium terbaik.' },
  { step: '04', icon: 'cil:check-circle', title: 'Pengambilan', desc: 'Periksa dan ambil kendaraan Anda yang telah bertransformasi dengan indah.' },
];
</script>

<template>
  <div>
    <div v-if="loading" class="min-h-[90vh] px-6 w-full max-w-7xl mx-auto flex items-center">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
        <div class="flex flex-col gap-6">
          <UiSkeleton type="text" class="w-32 h-6" />
          <UiSkeleton type="text" class="w-3/4 h-16 sm:h-20 lg:h-24" />
          <UiSkeleton type="text" class="w-full h-8" />
          <div class="flex gap-3 mt-4">
            <UiSkeleton class="w-40 h-14 rounded-none" />
            <UiSkeleton class="w-40 h-14 rounded-none" />
          </div>
        </div>
        <div class="hidden lg:grid grid-cols-2 gap-4">
          <UiSkeleton v-for="i in 4" :key="i" class="h-32 rounded-none" />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col">
      <!-- Hero Section -->
      <section class="relative min-h-[90vh] flex items-center px-6">
        <div class="absolute inset-0 z-0">
          <div
            v-if="content.hero_image"
            class="absolute inset-0 bg-cover bg-center opacity-45"
            :style="{ backgroundImage: `url(${content.hero_image})` }"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
          <div class="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/80" />
        </div>

        <div class="max-w-7xl mx-auto w-full relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Left: Text -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 700 } }"
            >
              <div class="flex items-center gap-2 mb-6">
                <div class="w-8 h-[2px] bg-red-500" />
                <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Repaint Mobil Premium</span>
              </div>

              <UiTextType 
                as="h1"
                :text="content.title || 'REPAINT TERPERCAYA DI MALANG'"
                :typing-speed="75"
                :pause-duration="1500"
                :show-cursor="true"
                cursor-character="|"
                class-name="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
              />

              <p class="text-gray-400 text-lg max-w-lg mb-8 leading-relaxed">
                {{ content.description }}
              </p>

              <div class="flex flex-col sm:flex-row gap-3">
                <NuxtLink
                  to="/reservasi"
                  class="px-7 py-4 bg-red-600 text-white font-semibold rounded-none transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 justify-center"
                >
                  Buat Reservasi <Icon name="cil:arrow-right" :size="18" />
                </NuxtLink>
                <NuxtLink
                  to="/layanan"
                  class="px-7 py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-semibold rounded-none transition-all duration-300 text-center"
                >
                  Jelajahi Layanan
                </NuxtLink>
              </div>
            </div>

            <!-- Right: Stats -->
            <div
              v-motion
              :initial="{ opacity: 0, x: 40 }"
              :enter="{ opacity: 1, x: 0, transition: { duration: 700, delay: 300 } }"
              class="hidden lg:grid grid-cols-2 gap-4"
            >
              <div
                v-for="(stat, idx) in stats"
                :key="stat.label"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 500 + idx * 100 } }"
                class="p-6 rounded-none bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] backdrop-blur-sm"
              >
                <p class="text-3xl font-bold text-white mb-1">
                  <UiAnimatedCounter :target="stat.value" :suffix="stat.suffix" />
                </p>
                <p class="text-gray-500 text-sm">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>



      <!-- Features Section -->
      <section class="max-w-7xl mx-auto px-6 w-full mb-32">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="mb-16"
        >
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-[2px] bg-red-500" />
            <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Mengapa Memilih Kami</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold mb-3">Keahlian Bertemu Teknologi</h2>
          <p class="text-gray-500 max-w-xl">Kami menggabungkan teknologi canggih dengan keahlian pengrajin untuk menghasilkan hasil yang tak tertandingi.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(feature, idx) in features"
            :key="idx"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500, delay: idx * 150 } }"
            class="group relative p-8 rounded-none bg-white/[0.02] border border-white/[0.06] transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1]"
          >
            <div class="absolute left-0 top-8 bottom-8 w-[2px] bg-red-600 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div class="w-14 h-14 rounded-none bg-red-500/10 text-red-500 flex items-center justify-center mb-5 group-hover:bg-red-500/15 group-hover:scale-105 transition-all duration-300">
              <Icon :name="feature.icon" :size="28" />
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">{{ feature.title }}</h3>
            <p class="text-gray-500 leading-relaxed text-sm">{{ feature.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Process Timeline -->
      <section class="max-w-7xl mx-auto px-6 w-full mb-32">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="mb-16"
        >
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-[2px] bg-red-500" />
            <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Proses Kami</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold mb-3">Cara Kerjanya</h2>
          <p class="text-gray-500 max-w-xl">Proses yang dirancang untuk kenyamanan Anda, dari reservasi hingga hasil yang memukau.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
          <div
            v-for="(item, idx) in processes"
            :key="idx"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500, delay: idx * 100 } }"
            class="relative group"
          >
            <div v-if="idx < 3" class="hidden md:block absolute top-10 left-[60%] w-full h-[1px] bg-gradient-to-r from-white/[0.08] to-transparent" />
            <div class="p-6 rounded-none bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300 h-full">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-red-500/40 text-2xl font-bold">{{ item.step }}</span>
                <div class="w-10 h-10 rounded-none bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Icon :name="item.icon" :size="24" />
                </div>
              </div>
              <h3 class="text-lg font-bold text-white mb-2">{{ item.title }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Voucher Section -->
      <section v-if="voucherEnabled" class="max-w-5xl mx-auto px-6 w-full mb-32">
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.97 }"
          :visibleOnce="{ opacity: 1, scale: 1, transition: { duration: 600 } }"
          class="relative rounded-none overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-red-950/40 via-[#0a0a0a] to-[#0a0a0a]" />
          <div class="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-none blur-[100px]" />
          <div class="absolute bottom-0 left-0 w-60 h-60 bg-red-500/5 rounded-none blur-[80px]" />

          <div class="relative z-10 p-10 md:p-16 border border-red-500/10 rounded-none">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold mb-5">
                  <Icon name="cil:diamond" :size="12" /> Penawaran Terbatas
                </div>
                <h2 class="text-3xl md:text-4xl font-bold mb-3">Diskon Spesial untuk Cat Pertama Anda</h2>
                <p class="text-gray-500 leading-relaxed">
                  Masukkan email Anda untuk mendapatkan voucher diskon eksklusif untuk layanan cat ulang pertama Anda.
                </p>
              </div>

              <form @submit.prevent="handleClaimVoucher" class="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  v-model="email"
                  placeholder="Masukkan alamat email Anda"
                  class="w-full px-5 py-4 rounded-none bg-black/50 border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
                <button
                  type="submit"
                  :disabled="voucherStatus.type === 'loading'"
                  class="w-full py-4 rounded-none bg-red-600 text-white font-bold transition-all disabled:opacity-50 hover:shadow-[0_0_25px_rgba(220,38,38,0.3)]"
                >
                  {{ voucherStatus.type === 'loading' ? 'Memproses...' : 'Klaim Voucher Anda' }}
                </button>

                <div
                  v-if="voucherStatus.type === 'error' && voucherStatus.message"
                  v-motion
                  :initial="{ opacity: 0, y: -5 }"
                  :enter="{ opacity: 1, y: 0 }"
                  class="text-sm font-medium p-3 rounded-none text-center text-red-400 bg-red-500/10 border border-red-500/20"
                >
                  {{ voucherStatus.message }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Voucher Success Modal -->
      <Transition name="fade">
        <div v-if="showVoucherModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1 }"
            class="bg-[#111] border border-white/10 p-8 rounded-none w-full max-w-md text-center relative"
          >
            <button
              v-if="canClose"
              @click="showVoucherModal = false"
              class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <Icon name="cil:x" :size="20" />
            </button>

            <div class="w-16 h-16 rounded-none bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-5">
              <Icon name="cil:check-circle" :size="32" />
            </div>

            <h3 class="text-2xl font-bold text-white mb-2">Voucher Berhasil Diklaim!</h3>
            <p class="text-gray-400 mb-6">Anda mendapatkan diskon <span class="text-red-500 font-bold">{{ voucherDiscount }}%</span></p>

            <div class="bg-black/50 border border-red-500/30 rounded-none p-5 mb-4">
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Kode Voucher Anda</p>
              <p class="text-3xl font-mono font-bold text-white tracking-widest">{{ voucherCode }}</p>
            </div>

            <button
              @click="copyToClipboard"
              :class="[
                'w-full py-3.5 rounded-none font-bold flex items-center justify-center gap-2 transition-all',
                copied ? 'bg-green-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
              ]"
            >
              <template v-if="copied"><Icon name="cil:check" :size="18" /> Kode Berhasil Disalin!</template>
              <template v-else><Icon name="cil:copy" :size="18" /> Salin Kode Voucher</template>
            </button>

            <div class="mt-4 p-3 rounded-none bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs text-left">
              ⚠️ <strong>Penting:</strong> Simpan kode ini! Salin atau screenshot sebelum menutup. Kode ini hanya ditampilkan sekali dan digunakan saat pemesanan.
            </div>

            <button
              v-if="!canClose"
              @click="canClose = true"
              class="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors underline"
            >
              Saya Sudah Menyimpan Kode
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
