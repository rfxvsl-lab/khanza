<template>
  <div class="min-h-screen bg-black text-white font-sans selection:bg-red-500/30 selection:text-red-200 overflow-x-hidden">
    <LayoutNavbar />
    
    <main class="relative z-10 pt-24 min-h-screen">
      <slot />
    </main>

    <LayoutFooter />

    <LayoutCookieToast />
  </div>
</template>
