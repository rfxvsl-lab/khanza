<template>
  <div class="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 selection:text-red-200 overflow-x-hidden relative">
    
    <!-- Universal Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <!-- Ambient Glows -->
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px]" />
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-red-900/10 blur-[120px]" />
      
      <!-- Tech Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>

    <LayoutNavbar />
    
    <main class="relative z-10 pt-24 min-h-screen">
      <slot />
    </main>

    <LayoutFooter />

    <LayoutCookieToast />
  </div>
</template>
