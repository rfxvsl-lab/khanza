<script setup lang="ts">
import { ref, onMounted } from 'vue';

useSeoMeta({
  title: 'Layanan Kami',
  description: 'Temukan rangkaian layanan finishing otomotif premium kami. Setiap kendaraan kami perlakukan sebagai mahakarya.'
});

useHead({
  script: [
    { src: '//www.instagram.com/embed.js', async: true }
  ]
});

const services = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await $fetch('/api/services');
    services.value = data as any[];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const getIcon = (name: string) => {
  const iconMap: Record<string, string> = {
    'ArrowRight': 'cil:arrow-right',
    'ShieldCheck': 'cil:shield-alt',
    'Sparkles': 'cil:diamond',
    'Droplets': 'cil:drop',
    'CheckCircle': 'cil:check-circle',
    'Check': 'cil:check',
    'ClipboardList': 'cil:clipboard',
    'Wrench': 'cil:settings',
    'Car': 'cil:car-alt'
  };
  return iconMap[name] || (name.includes(':') ? name : 'cil:car-alt');
};

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-16 md:py-20">
    <!-- Header -->
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="mb-16"
    >
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-[2px] bg-red-500" />
        <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Yang Kami Tawarkan</span>
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
        <span class="text-transparent bg-clip-text bg-red-600">Layanan</span> Kami
      </h1>
      <p class="text-gray-500 max-w-xl text-lg">
        Temukan rangkaian layanan finishing otomotif premium kami. Setiap kendaraan kami perlakukan sebagai mahakarya.
      </p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="i in 4" :key="i" class="p-8 rounded-none bg-white/[0.02] border border-white/[0.06]">
        <div class="flex justify-between mb-6">
          <UiSkeleton type="avatar" class="w-14 h-14 rounded-none" />
          <UiSkeleton type="text" class="w-24 h-8" />
        </div>
        <UiSkeleton type="text" class="w-3/4 h-6 mb-4" />
        <UiSkeleton type="text" class="w-full h-4 mb-2" />
        <UiSkeleton type="text" class="w-5/6 h-4 mb-6" />
        <div class="space-y-3 mb-8">
           <UiSkeleton type="text" class="w-1/2 h-4" />
           <UiSkeleton type="text" class="w-1/2 h-4" />
           <UiSkeleton type="text" class="w-1/2 h-4" />
        </div>
        <UiSkeleton class="w-full h-12 rounded-none" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="(service, idx) in services"
        :key="service.id"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500, delay: idx * 100 } }"
        class="group relative rounded-none overflow-hidden bg-[#050505] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500"
      >
        <!-- Service Image Header -->
        <div class="h-64 overflow-hidden relative w-full">
           <img v-if="service.image_url" :src="service.image_url" :alt="service.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
           <div v-else class="absolute inset-0 w-full h-full bg-white/[0.02]"></div>
           <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        </div>

        <div class="p-8 relative -mt-20 z-10">
          <div class="flex items-start justify-between mb-6">
            <div class="w-14 h-14 rounded-none bg-black/80 backdrop-blur-md border border-white/[0.1] flex items-center justify-center transition-all duration-300 group-hover:border-red-500/50">
              <Icon :name="getIcon(service.icon_name)" size="26" class="text-red-500" />
            </div>
            <span class="text-xl font-bold text-white bg-black/80 backdrop-blur-md px-4 py-2 border border-white/[0.1]">{{ formatRupiah(service.price) }}</span>
          </div>

          <h3 class="text-2xl font-bold text-white mb-3 uppercase tracking-wide group-hover:text-red-500 transition-colors duration-300">{{ service.title }}</h3>
          <p class="text-gray-400 mb-6 leading-relaxed text-sm">{{ service.description }}</p>

          <ul class="space-y-3 mb-8">
            <li v-for="feature in ['Material premium', 'Teknisi profesional', 'Kualitas terjamin']" :key="feature" class="flex items-center gap-3 text-gray-500 text-sm">
              <Icon name="cil:check" :size="14" class="text-red-500 shrink-0" />
              {{ feature }}
            </li>
          </ul>

          <NuxtLink
            :to="`/reservasi?service=${service.id}`"
            class="flex items-center justify-center gap-2 w-full py-4 rounded-none bg-white/[0.04] border border-white/[0.08] hover:bg-red-600 hover:border-red-600 text-white font-bold text-sm tracking-widest uppercase transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          >
            Pesan Layanan Ini <Icon name="cil:arrow-right" :size="16" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Instagram Embed Section -->
    <div class="mt-24 border-t border-white/[0.04] pt-16">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold mb-4 uppercase tracking-wider">Hasil Kerja Kami</h2>
        <p class="text-gray-500 max-w-xl mx-auto">Lihat cuplikan proses dan hasil akhir karya bengkel kami secara langsung.</p>
      </div>
      <div class="flex justify-center w-full overflow-hidden">
        <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/DWqSJe0EV6N/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#111; border:1px solid rgba(255,255,255,0.1); border-radius:0px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/DWqSJe0EV6N/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#111; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #222; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #222; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #222; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#FFFFFF"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#dc2626; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #222; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #222; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #222; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #222; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #222; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #222; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #222; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #222; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #222; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #222; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#999; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/DWqSJe0EV6N/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#999; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Bengkel Body Repair &amp; Repaint (@khanza.repaint)</a></p></div></blockquote>
      </div>
    </div>
  </div>
</template>
