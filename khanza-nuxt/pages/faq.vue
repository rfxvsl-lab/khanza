<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

useSeoMeta({
  title: 'FAQ',
  description: 'Temukan jawaban untuk pertanyaan umum seputar layanan, proses, dan harga kami.'
});

const faqs = ref<any[]>([]);
const loading = ref(true);
const searchTerm = ref('');
const openIndex = ref<number | null>(0);

onMounted(async () => {
  try {
    const data = await $fetch('/api/faqs');
    faqs.value = data as any[];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const filteredFaqs = computed(() => {
  return faqs.value.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const toggleFaq = (idx: number) => {
  openIndex.value = openIndex.value === idx ? null : idx;
};
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
        <span class="text-red-500 text-sm font-semibold tracking-wider uppercase">Pusat Bantuan</span>
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
        Pertanyaan yang <span class="text-transparent bg-clip-text bg-red-600">Sering Ditanyakan</span>
      </h1>
      <p class="text-gray-500 max-w-xl text-lg">
        Temukan jawaban untuk pertanyaan umum seputar layanan, proses, dan harga kami.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="relative mb-8">
          <Icon name="cil:search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
          <input
            type="text"
            placeholder="Cari pertanyaan..."
            v-model="searchTerm"
            class="w-full pl-12 pr-4 py-3.5 rounded-none bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/40 transition-colors"
          />
        </div>

        <div v-if="loading" class="space-y-4">
          <UiSkeleton v-for="i in 5" :key="i" class="w-full h-16 rounded-none" />
        </div>
        <div v-else-if="filteredFaqs.length === 0" class="text-center py-16">
          <div class="w-14 h-14 rounded-none bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Icon name="cil:search" :size="20" class="text-gray-600" />
          </div>
          <p class="text-gray-500">Tidak ada pertanyaan yang cocok</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(faq, idx) in filteredFaqs"
            :key="faq.id"
            v-motion
            :initial="{ opacity: 0, y: 15 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 300, delay: idx * 50 } }"
            :class="[
              'border rounded-none overflow-hidden transition-all duration-300',
              openIndex === idx ? 'bg-white/[0.03] border-red-500/15' : 'bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.02]'
            ]"
          >
            <button
              @click="toggleFaq(idx)"
              class="w-full px-6 py-5 flex items-center justify-between text-left group"
            >
              <div class="flex items-center gap-4">
                <span :class="['text-xs font-bold w-7 h-7 rounded-none flex items-center justify-center shrink-0 transition-colors', openIndex === idx ? 'bg-red-500/20 text-red-500' : 'bg-white/[0.04] text-gray-600']">
                  {{ String(idx + 1).padStart(2, '0') }}
                </span>
                <span class="text-white text-sm font-medium">{{ faq.question }}</span>
              </div>
              <Icon name="cil:chevron-bottom" :class="['text-gray-500 transition-transform duration-300 shrink-0 ml-4', openIndex === idx ? 'rotate-180 text-red-500' : '']"
                :size="18" />
            </button>

            <Transition name="expand">
              <div v-show="openIndex === idx">
                <div class="px-6 pb-5 pl-[4.25rem] text-gray-400 text-sm leading-relaxed">
                  {{ faq.answer }}
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-gradient-to-br from-red-900/40 to-black border border-red-500/30 rounded-none p-6 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div class="w-12 h-12 rounded-none bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4 relative z-10">
            <Icon name="lucide:message-circle" :size="22" class="text-red-400" />
          </div>
          <h3 class="text-lg font-bold text-white mb-2 relative z-10">Masih ada pertanyaan?</h3>
          <p class="text-gray-300 text-sm mb-5 leading-relaxed relative z-10">
            Tidak menemukan jawaban yang Anda cari? Hubungi tim kami langsung.
          </p>
          <div class="space-y-3 relative z-10">
            <a href="https://wa.me/62881036492931" target="_blank" class="flex items-center gap-3 text-sm text-white hover:text-red-400 transition-colors">
              <Icon name="cil:phone" :size="16" class="text-red-500" />
              0881-0364-92931
            </a>
            <a href="mailto:admin@khanzarepaint.com" class="flex items-center gap-3 text-sm text-white hover:text-red-400 transition-colors">
              <Icon name="cil:envelope-closed" :size="16" class="text-red-500/70" />
              admin@khanzarepaint.com
            </a>
          </div>
        </div>

        <div class="bg-white/[0.02] border border-white/[0.06] rounded-none p-6">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Topik Populer</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in ['Harga', 'Garansi', 'Proses', 'Durasi', 'Material', 'Reservasi']"
              :key="tag"
              @click="searchTerm = tag"
              class="px-3 py-1.5 rounded-none bg-white/[0.04] border border-white/[0.06] text-gray-500 text-xs font-medium hover:text-white hover:border-white/[0.1] transition-all"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  height: 0 !important;
  opacity: 0;
}
</style>
