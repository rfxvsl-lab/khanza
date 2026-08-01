<script setup lang="ts">
import { gsap } from 'gsap';
import { nextTick, onBeforeUpdate, onMounted, onUnmounted, ref, watch, type VNodeRef } from 'vue';

type CardNavLink = {
  label: string;
  href?: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo?: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const props = withDefaults(defineProps<CardNavProps>(), {
  logoAlt: 'Logo',
  className: '',
  ease: 'power3.out',
  baseColor: '#0a0a0a'
});

const isHamburgerOpen = ref(false);
const isExpanded = ref(false);

const navRef = ref<HTMLDivElement | null>(null);
const cardsRef = ref<HTMLDivElement[]>([]);
const tlRef = ref<gsap.core.Timeline | null>(null);

const setCardRef =
  (i: number): VNodeRef =>
  el => {
    if (el && el instanceof HTMLDivElement) {
      cardsRef.value[i] = el;
    }
  };

onBeforeUpdate(() => {
  cardsRef.value = [];
});

const calculateHeight = () => {
  const navEl = navRef.value;
  if (!navEl) return 260;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
    if (contentEl) {
      const wasVisible = contentEl.style.visibility;
      const wasPosition = contentEl.style.position;
      const wasHeight = contentEl.style.height;

      contentEl.style.visibility = 'visible';
      contentEl.style.position = 'static';
      contentEl.style.height = 'auto';

      const topBar = 80;
      const padding = 24;
      const contentHeight = contentEl.scrollHeight;

      contentEl.style.visibility = wasVisible;
      contentEl.style.position = wasPosition;
      contentEl.style.height = wasHeight;

      return topBar + contentHeight + padding;
    }
  }
  return 260;
};

const createTimeline = () => {
  const navEl = navRef.value;
  if (!navEl) return null;

  gsap.set(navEl, { height: 80, overflow: 'hidden' });
  gsap.set(cardsRef.value, { y: 50, opacity: 0 });

  const tl = gsap.timeline({ paused: true });

  tl.to(navEl, {
    height: calculateHeight,
    duration: 0.4,
    ease: props.ease
  });

  tl.to(cardsRef.value, { y: 0, opacity: 1, duration: 0.4, ease: props.ease, stagger: 0.08 }, '-=0.1');

  return tl;
};

const toggleMenu = () => {
  const tl = tlRef.value;
  if (!tl) return;
  if (!isExpanded.value) {
    isHamburgerOpen.value = true;
    isExpanded.value = true;
    nextTick(() => {
      tl.play(0);
    });
  } else {
    isHamburgerOpen.value = false;
    tl.eventCallback('onReverseComplete', () => {
      isExpanded.value = false;
      tl.eventCallback('onReverseComplete', null);
    });
    tl.reverse();
  }
};

const closeMenu = () => {
  if (isExpanded.value) {
    toggleMenu();
  }
};

const handleResize = () => {
  if (!tlRef.value) return;

  if (isExpanded.value) {
    const newHeight = calculateHeight();
    gsap.set(navRef.value, { height: newHeight });

    tlRef.value.kill();
    const newTl = createTimeline();
    if (newTl) {
      newTl.progress(1);
      tlRef.value = newTl;
    }
  } else {
    tlRef.value.kill();
    tlRef.value = createTimeline();
  }
};

onMounted(() => {
  tlRef.value = createTimeline();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  tlRef.value?.kill();
  tlRef.value = null;
  window.removeEventListener('resize', handleResize);
});

watch(
  () => [props.ease, props.items],
  () => {
    nextTick(() => {
      if (tlRef.value) tlRef.value.kill();
      tlRef.value = createTimeline();
    });
  }
);
</script>

<template>
  <div
    :class="`card-nav-container fixed left-1/2 -translate-x-1/2 w-[95%] max-w-[1100px] z-[99] top-[1.2em] md:top-[2em] ${props.className}`"
  >
    <nav
      ref="navRef"
      :class="[
        'card-nav block h-[80px] p-0 rounded-none shadow-2xl relative overflow-hidden will-change-[height] border border-white/20',
        { open: isExpanded }
      ]"
      :style="{ backgroundColor: props.baseColor, backdropFilter: 'blur(20px)' }"
    >
      <div
        class="card-nav-top top-0 z-[2] absolute inset-x-0 flex justify-between items-center p-2 px-6 h-[80px]"
      >
        <NuxtLink to="/" @click="closeMenu" class="flex items-center gap-2 logo-container z-10 w-[200px]">
          <img v-if="props.logo" :src="props.logo" :alt="props.logoAlt" class="h-16 w-auto object-contain" />
          <span v-else class="text-white font-bold text-lg">KHANZA</span>
        </NuxtLink>

        <div class="hidden md:flex flex-1 justify-center relative">
          <div class="text-white/40 font-medium text-xs tracking-[0.2em] uppercase" :class="isExpanded ? 'opacity-0 transition-opacity' : 'opacity-100 transition-opacity delay-200'">
            Menu Utama
          </div>
        </div>

        <div class="flex items-center gap-3 w-[200px] justify-end">
          <NuxtLink
            to="/reservasi"
            @click="closeMenu"
            class="hidden md:inline-flex px-5 py-2.5 rounded-none text-sm font-bold transition-all duration-300 cursor-pointer card-nav-cta-button hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            :style="{
              backgroundColor: props.buttonBgColor,
              color: props.buttonTextColor
            }"
          >
            Reservasi
          </NuxtLink>

          <div
            :class="[
              'hamburger-menu group h-[40px] w-[40px] rounded-none flex flex-col items-center justify-center cursor-pointer gap-[5px] bg-white/10 hover:bg-white/20 transition-colors border border-white/20',
              { open: isHamburgerOpen }
            ]"
            @click="toggleMenu"
            role="button"
            :aria-label="isExpanded ? 'Close menu' : 'Open menu'"
            tabindex="0"
            :style="{ color: props.menuColor || '#fff' }"
          >
            <div
              :class="[
                'hamburger-line w-[20px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] group-hover:opacity-100',
                { 'translate-y-[3.5px] rotate-45': isHamburgerOpen }
              ]"
            />
            <div
              :class="[
                'hamburger-line w-[20px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] group-hover:opacity-100',
                { '-translate-y-[3.5px] -rotate-45': isHamburgerOpen }
              ]"
            />
          </div>
        </div>
      </div>

      <div
        :class="[
          'card-nav-content absolute left-0 right-0 top-[80px] bottom-0 p-3 flex flex-col items-stretch gap-3 justify-start z-[1] md:flex-row md:items-stretch md:gap-3',
          isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        ]"
        :aria-hidden="!isExpanded"
      >
        <div
          v-for="(item, idx) in (props.items || []).slice(0, 3)"
          :key="`${item.label}-${idx}`"
          :ref="setCardRef(idx)"
          class="relative flex flex-col flex-[1_1_auto] md:flex-[1_1_0%] gap-4 p-5 rounded-none min-w-0 h-auto md:h-full min-h-[80px] md:min-h-0 select-none nav-card border border-white/10 hover:border-white/20 transition-colors shadow-lg"
          :style="{ backgroundColor: item.bgColor, color: item.textColor }"
        >
          <div class="font-bold text-xl md:text-2xl tracking-tight nav-card-label opacity-90">
            {{ item.label }}
          </div>
          <div class="flex flex-col gap-1 mt-auto nav-card-links">
            <NuxtLink
              v-for="(lnk, i) in item.links"
              :key="`${lnk.label}-${i}`"
              class="inline-flex items-center justify-between w-full p-2 -mx-2 rounded-none hover:bg-white/5 text-[15px] md:text-[16px] no-underline transition-colors duration-300 cursor-pointer nav-card-link text-white/70 hover:text-white"
              :to="lnk.href || ''"
              @click="closeMenu"
              :aria-label="lnk.ariaLabel"
            >
              <span>{{ lnk.label }}</span>
              <Icon name="cil:arrow-top-right" class="nav-card-link-icon shrink-0 opacity-50" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.card-nav {
  transform: translateZ(0);
}
</style>
