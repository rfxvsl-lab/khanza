<template>
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div class="absolute top-[-15%] left-[-15%] w-[35vw] h-[35vw] rounded-none bg-red-950/15 blur-[150px] animate-blob1" />
    <div class="absolute bottom-[-15%] right-[-15%] w-[40vw] h-[40vw] rounded-none bg-red-950/10 blur-[150px] animate-blob2" />
    <div class="absolute top-[40%] left-[50%] w-[25vw] h-[25vw] rounded-none bg-red-950/5 blur-[120px] animate-blob3" />
  </div>
</template>

<style scoped>
@keyframes blob1 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, 20px) scale(1.05); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes blob2 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, -35px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes blob3 {
  0% { transform: translate(0, 0); }
  33% { transform: translate(25px, -20px); }
  66% { transform: translate(-15px, 15px); }
  100% { transform: translate(0, 0); }
}
.animate-blob1 { animation: blob1 15s ease-in-out infinite; }
.animate-blob2 { animation: blob2 18s ease-in-out infinite 3s; }
.animate-blob3 { animation: blob3 22s ease-in-out infinite 5s; }
</style>
