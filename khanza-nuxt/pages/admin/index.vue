<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: false
});

useSeoMeta({
  title: 'Admin Login - Khanza Repaint',
});

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

onMounted(() => {
  if (localStorage.getItem('adminToken')) {
    navigateTo('/admin/dashboard');
  }
});

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    const data: any = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    });
    
    if (import.meta.client) {
      localStorage.setItem('adminToken', data.token);
      await navigateTo('/admin/dashboard');
    }
  } catch (err: any) {
    error.value = err.response?._data?.statusMessage || 'Login gagal';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-black flex items-center justify-center px-6 selection:bg-red-500/30">
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      class="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-none backdrop-blur-xl"
    >
      <div class="flex justify-center mb-8">
        <div class="w-16 h-16 rounded-none bg-red-600 flex items-center justify-center text-white">
          <Icon name="cil:car-alt" :size="32" />
        </div>
      </div>
      <h1 class="text-2xl font-bold text-white text-center mb-8">Portal Admin</h1>

      <div v-if="error" class="bg-red-500/10 text-red-500 p-4 rounded-none mb-6 text-sm text-center border border-red-500/20">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            type="email"
            v-model="email"
            placeholder="Email Admin"
            class="w-full px-4 py-3 rounded-none bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            required
          />
        </div>
        <div>
          <input
            type="password"
            v-model="password"
            placeholder="Kata Sandi"
            class="w-full px-4 py-3 rounded-none bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50"
        >
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>
