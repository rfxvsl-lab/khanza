<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const currentStep = ref(1);
const cursor = ref({ x: 50, y: 90, clicked: false, opacity: 0 });
const data = ref({ name: '', email: '', service: '', date: '', submitted: false });
let isAnimating = true;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const typeText = async (field: keyof typeof data.value, text: string) => {
  data.value[field] = '';
  for(let i = 0; i < text.length; i++) {
    if (!isAnimating) return;
    (data.value[field] as string) += text[i];
    await sleep(60 + Math.random() * 60);
  }
  await sleep(400);
};

const moveCursor = async (x: number, y: number) => {
  cursor.value.x = x;
  cursor.value.y = y;
  cursor.value.opacity = 1;
  await sleep(800); // wait for CSS transition
};

const clickCursor = async () => {
  cursor.value.clicked = true;
  await sleep(150);
  cursor.value.clicked = false;
  await sleep(300);
};

const runTutorial = async () => {
  while (isAnimating) {
    // Reset state
    data.value = { name: '', email: '', service: '', date: '', submitted: false };
    cursor.value.opacity = 0;
    cursor.value.x = 50;
    cursor.value.y = 90;
    currentStep.value = 1;
    await sleep(1000);
    if (!isAnimating) break;

    // STEP 1: Data Pribadi
    await moveCursor(20, 20);
    if (!isAnimating) break;
    await clickCursor();
    await typeText('name', 'Budi Santoso');
    
    await moveCursor(20, 36);
    if (!isAnimating) break;
    await clickCursor();
    await typeText('email', 'budi@contoh.com');

    // STEP 2: Kendaraan & Layanan
    currentStep.value = 2;
    await moveCursor(20, 56);
    if (!isAnimating) break;
    await clickCursor();
    data.value.service = 'Repaint Body Full';
    await sleep(800);

    // STEP 3: Jadwal
    currentStep.value = 3;
    await moveCursor(20, 72);
    if (!isAnimating) break;
    await clickCursor();
    data.value.date = 'Besok, 09:00 WIB';
    await sleep(800);

    // STEP 4: Konfirmasi
    currentStep.value = 4;
    await moveCursor(50, 90);
    if (!isAnimating) break;
    await clickCursor();
    data.value.submitted = true;
    
    // Hide cursor and wait before restart
    cursor.value.opacity = 0;
    await sleep(4000);
  }
};

onMounted(() => {
  runTutorial();
});

onUnmounted(() => {
  isAnimating = false;
});
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
    <!-- Form UI Mockup -->
    <div class="relative rounded-none border border-white/10 overflow-hidden shadow-2xl bg-[#0a0a0a] p-5 md:p-8 flex flex-col pointer-events-none select-none h-[420px]">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span class="text-xs text-red-500 uppercase tracking-widest font-bold">Auto</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div v-for="i in 4" :key="i" class="flex items-center gap-2">
            <div :class="[
              'w-5 h-5 rounded-none flex items-center justify-center text-[10px] font-bold transition-colors duration-500',
              currentStep >= i ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-gray-600'
            ]">{{ i }}</div>
            <div v-if="i < 4" :class="[
              'w-3 h-[1px] transition-colors duration-500',
              currentStep > i ? 'bg-red-500/50' : 'bg-white/10'
            ]"></div>
          </div>
        </div>
      </div>
      
      <div class="space-y-4 flex-1">
        <!-- Step 1 & 2 Layout -->
        <Transition name="fade" mode="out-in">
          <div v-if="!data.submitted" class="space-y-4">
            <div class="w-full px-4 py-3 bg-black/50 border border-white/[0.08] text-white text-sm flex items-center gap-3 relative">
              <Icon name="cil:user" class="text-gray-500 shrink-0" :size="16" /> 
              <span class="truncate">{{ data.name }}<span v-if="currentStep === 1 && !data.name.endsWith('o') && cursor.y < 30" class="animate-pulse">|</span></span>
              <span v-if="!data.name" class="text-gray-600 absolute left-12 top-1/2 -translate-y-1/2">Nama Lengkap</span>
            </div>
            <div class="w-full px-4 py-3 bg-black/50 border border-white/[0.08] text-white text-sm flex items-center gap-3 relative">
              <Icon name="cil:envelope-closed" class="text-gray-500 shrink-0" :size="16" /> 
              <span class="truncate">{{ data.email }}<span v-if="currentStep === 1 && data.name && cursor.y > 30" class="animate-pulse">|</span></span>
              <span v-if="!data.email" class="text-gray-600 absolute left-12 top-1/2 -translate-y-1/2">Alamat Email</span>
            </div>
            <div class="w-full px-4 py-3 bg-black/50 border border-white/[0.08] text-white text-sm flex items-center gap-3 relative">
              <Icon name="cil:car-alt" class="text-gray-500 shrink-0" :size="16" /> 
              <span>{{ data.service }}</span>
              <span v-if="!data.service" class="text-gray-600 absolute left-12 top-1/2 -translate-y-1/2">Pilih Layanan</span>
              <Icon name="cil:chevron-bottom" class="text-gray-600 absolute right-4 top-1/2 -translate-y-1/2" :size="14" />
            </div>
            <div class="w-full px-4 py-3 bg-black/50 border border-white/[0.08] text-white text-sm flex items-center gap-3 relative">
              <Icon name="cil:calendar" class="text-gray-500 shrink-0" :size="16" /> 
              <span>{{ data.date }}</span>
              <span v-if="!data.date" class="text-gray-600 absolute left-12 top-1/2 -translate-y-1/2">Jadwal Kedatangan</span>
            </div>
            <div class="w-full px-4 py-3.5 bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 mt-6 transition-all duration-300"
                 :class="currentStep === 4 ? 'shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-[1.02]' : ''">
              Konfirmasi Reservasi
            </div>
          </div>
          
          <div v-else class="flex flex-col items-center justify-center h-full text-center space-y-4 pb-8">
            <div class="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center scale-up-anim">
              <Icon name="cil:check-circle" :size="32" />
            </div>
            <h4 class="text-white font-bold text-lg">Reservasi Berhasil!</h4>
            <p class="text-gray-500 text-xs max-w-[80%] mx-auto">Kami akan segera menghubungi Anda untuk konfirmasi lebih lanjut.</p>
          </div>
        </Transition>
      </div>

      <!-- Animated Mouse Cursor -->
      <div 
        class="absolute w-6 h-6 z-50 pointer-events-none transition-all duration-700 ease-in-out flex flex-col items-start"
        :style="{ 
          left: cursor.x + '%', 
          top: cursor.y + '%',
          opacity: cursor.opacity,
          transform: `translate(-50%, -50%) scale(${cursor.clicked ? 0.8 : 1})`
        }"
      >
        <!-- The Cursor SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="drop-shadow-lg text-white fill-white">
          <path d="M4.5.79v22.42l6.56-6.57h9.29L4.5.79z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <div v-if="cursor.clicked" class="absolute top-1 left-1 w-4 h-4 bg-red-500/50 rounded-full animate-ping"></div>
      </div>
    </div>
    
    <!-- Step by Step Explanation -->
    <div class="space-y-6 relative">
      <div class="absolute left-4 top-4 bottom-4 w-[1px] bg-white/[0.05] -z-10"></div>
      
      <div :class="['flex gap-4 transition-all duration-500', currentStep >= 1 ? 'opacity-100' : 'opacity-30']">
        <div :class="['w-8 h-8 rounded-none flex items-center justify-center font-bold shrink-0 border transition-all duration-500', 
          currentStep === 1 ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 
          currentStep > 1 ? 'bg-white/10 text-gray-300 border-white/20' : 'bg-transparent text-gray-600 border-gray-800'
        ]">1</div>
        <div class="pt-1">
          <h4 :class="['font-bold mb-1 transition-colors', currentStep === 1 ? 'text-red-400' : 'text-white']">Data Pribadi</h4>
          <p class="text-sm text-gray-400 leading-relaxed">Isi <strong>Nama Lengkap</strong>, <strong>Alamat Email</strong>, dan <strong>Nomor Telepon/WA</strong> Anda. Pastikan email dan nomor aktif.</p>
        </div>
      </div>
      
      <div :class="['flex gap-4 transition-all duration-500', currentStep >= 2 ? 'opacity-100' : 'opacity-30']">
        <div :class="['w-8 h-8 rounded-none flex items-center justify-center font-bold shrink-0 border transition-all duration-500', 
          currentStep === 2 ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 
          currentStep > 2 ? 'bg-white/10 text-gray-300 border-white/20' : 'bg-transparent text-gray-600 border-gray-800'
        ]">2</div>
        <div class="pt-1">
          <h4 :class="['font-bold mb-1 transition-colors', currentStep === 2 ? 'text-red-400' : 'text-white']">Kendaraan & Layanan</h4>
          <p class="text-sm text-gray-400 leading-relaxed">Pilih <strong>Jenis Layanan</strong> yang Anda inginkan (misal: <em>Repaint Body</em>) beserta detail kendaraan Anda.</p>
        </div>
      </div>
      
      <div :class="['flex gap-4 transition-all duration-500', currentStep >= 3 ? 'opacity-100' : 'opacity-30']">
        <div :class="['w-8 h-8 rounded-none flex items-center justify-center font-bold shrink-0 border transition-all duration-500', 
          currentStep === 3 ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 
          currentStep > 3 ? 'bg-white/10 text-gray-300 border-white/20' : 'bg-transparent text-gray-600 border-gray-800'
        ]">3</div>
        <div class="pt-1">
          <h4 :class="['font-bold mb-1 transition-colors', currentStep === 3 ? 'text-red-400' : 'text-white']">Jadwal & Voucher</h4>
          <p class="text-sm text-gray-400 leading-relaxed">Pilih <strong>Tanggal</strong> kedatangan Anda. Anda juga bisa memasukkan kode Voucher jika memilikinya.</p>
        </div>
      </div>
      
      <div :class="['flex gap-4 transition-all duration-500', currentStep >= 4 ? 'opacity-100' : 'opacity-30']">
        <div :class="['w-8 h-8 rounded-none flex items-center justify-center font-bold shrink-0 border transition-all duration-500', 
          currentStep === 4 ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 
          currentStep > 4 ? 'bg-white/10 text-gray-300 border-white/20' : 'bg-transparent text-gray-600 border-gray-800'
        ]">4</div>
        <div class="pt-1">
          <h4 :class="['font-bold mb-1 transition-colors', currentStep === 4 ? 'text-red-400' : 'text-white']">Konfirmasi Akhir</h4>
          <p class="text-sm text-gray-400 leading-relaxed">Periksa kembali data Anda dan klik <strong>Konfirmasi Reservasi</strong>. Tim kami akan segera merespons Anda!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scale-up-anim {
  animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes scaleUp {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
