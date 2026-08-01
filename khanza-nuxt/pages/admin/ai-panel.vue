<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'AI Developer Panel - Admin' });

// State
const isPuterLoaded = ref(false);
const user = ref<any>(null);
const chatInput = ref('');
const messages = ref<{role: 'user'|'ai'|'system', content: string}[]>([]);
const isGenerating = ref(false);

// Code Changes State
const pendingChanges = ref<any[]>([]); // Array of { path, content }
const lastBackupId = ref<string | null>(null);

// Load Puter.js dynamically
useHead({
  script: [
    { 
      src: 'https://js.puter.com/v2/', 
      async: true,
      onload: () => checkPuterStatus()
    }
  ]
});

const checkPuterStatus = async () => {
  if (typeof window !== 'undefined' && (window as any).puter) {
    isPuterLoaded.value = true;
    try {
      if ((window as any).puter.auth.isSignedIn()) {
        user.value = await (window as any).puter.auth.getUser();
      }
    } catch (e) {
      console.error('Error checking auth', e);
    }
  }
};

const loginPuter = async () => {
  try {
    const puter = (window as any).puter;
    await puter.auth.signIn();
    user.value = await puter.auth.getUser();
    messages.value.push({
      role: 'system',
      content: `Berhasil login ke Puter.js sebagai ${user.value.username}`
    });
  } catch (error: any) {
    alert('Gagal login ke Puter.js: ' + error.message);
  }
};

const logoutPuter = () => {
  try {
    (window as any).puter.auth.signOut();
    user.value = null;
  } catch (e) {
    console.error(e);
  }
};

const systemPrompt = `You are an elite Nuxt 3 developer integrated into the admin panel of "Khanza Repaint". 
The user will ask you to build or modify features. 
You MUST respond with a JSON array containing the files to modify. 
Format your response exactly like this (NO MARKDOWN, JUST JSON):
[
  {
    "path": "pages/nama-file.vue",
    "content": "<template>...<\\/template><script setup>...<\\/script>"
  }
]
If the user is just asking a question, you can reply normally, but if they ask to BUILD or EDIT, output ONLY the JSON array.`;

const sendMessage = async () => {
  if (!chatInput.value.trim() || !isPuterLoaded.value) return;

  const userText = chatInput.value;
  messages.value.push({ role: 'user', content: userText });
  chatInput.value = '';
  isGenerating.value = true;

  try {
    const puter = (window as any).puter;
    
    // Call Puter AI
    // Note: puter.ai.chat supports passing a string or array of messages depending on version, 
    // we'll pass a combined string for safety.
    const prompt = `${systemPrompt}\n\nUser Request: ${userText}`;
    
    const response = await puter.ai.chat(prompt);
    
    const aiText = typeof response === 'string' ? response : response?.message?.content || String(response);
    
    // Try to parse JSON to see if it's a code edit
    try {
      // Find JSON array in the text in case it wrapped it in markdown
      const jsonMatch = aiText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      let parsed = null;
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(aiText);
      }
      
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].path && parsed[0].content) {
        messages.value.push({ role: 'ai', content: 'Saya telah menyiapkan draf kode untuk fitur tersebut. Silakan tinjau di panel "Pending Changes".' });
        pendingChanges.value = parsed;
      } else {
        messages.value.push({ role: 'ai', content: aiText });
      }
    } catch (parseError) {
      // Not JSON, just normal text
      messages.value.push({ role: 'ai', content: aiText });
    }

  } catch (error: any) {
    console.error(error);
    // Handle API Limit
    if (error.message?.includes('429') || error.status === 429) {
      messages.value.push({ role: 'system', content: 'Limit API Puter.js telah tercapai! Silakan klik tombol "Login Puter" dan gunakan akun lain untuk melanjutkan.' });
    } else {
      messages.value.push({ role: 'system', content: 'Error: ' + error.message });
    }
  } finally {
    isGenerating.value = false;
  }
};

const accChanges = async () => {
  if (pendingChanges.value.length === 0) return;
  
  try {
    isGenerating.value = true;
    const token = localStorage.getItem('adminToken');
    const response = await $fetch('/api/admin/ai/write-code', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { files: pendingChanges.value }
    });
    
    if (response && response.success) {
      lastBackupId.value = response.backupId;
      pendingChanges.value = [];
      messages.value.push({ role: 'system', content: `Kode berhasil disuntikkan ke sistem! Backup ID: ${response.backupId}` });
      alert('Perubahan berhasil diterapkan! (Di mode development, HMR akan memuat ulang halaman Anda)');
    }
  } catch (error: any) {
    alert('Gagal menerapkan perubahan: ' + (error.data?.statusMessage || error.data?.message || error.message));
  } finally {
    isGenerating.value = false;
  }
};

const rejectChanges = () => {
  pendingChanges.value = [];
  messages.value.push({ role: 'system', content: 'Anda telah membuang (Reject) draf kode dari AI.' });
};

const revertChanges = async () => {
  if (!lastBackupId.value) return;
  
  try {
    isGenerating.value = true;
    const token = localStorage.getItem('adminToken');
    const response = await $fetch('/api/admin/ai/revert', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { backupId: lastBackupId.value }
    });
    
    if (response && response.success) {
      lastBackupId.value = null;
      messages.value.push({ role: 'system', content: 'Kode berhasil di-REVERT (dikembalikan) ke keadaan sebelumnya!' });
      alert('Sistem berhasil direstore!');
    }
  } catch (error: any) {
    alert('Gagal melakukan revert: ' + (error.data?.statusMessage || error.data?.message || error.message));
  } finally {
    isGenerating.value = false;
  }
};

</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Panel Integrasi AI Developer</h2>
        <p class="text-gray-400 mt-1">Berbasis Puter.js API - Pengembang Otonom Khanza Repaint</p>
      </div>
      <div v-if="isPuterLoaded">
        <button v-if="!user" @click="loginPuter" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors text-sm">
          Login Puter.js
        </button>
        <div v-else class="flex items-center gap-3 bg-[#111] px-4 py-2 rounded-lg border border-white/5">
          <div class="text-xs text-gray-400">Terhubung sebagai: <span class="text-white font-bold">{{ user.username }}</span></div>
          <button @click="logoutPuter" class="text-xs text-red-500 hover:text-red-400 font-bold ml-2">Ganti Akun</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Terminal / Chat Interface -->
      <div class="bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
        <div class="bg-black/50 p-4 border-b border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="mdi:console" :size="20" class="text-purple-500" />
            <h3 class="font-bold text-white">Console J.A.R.V.I.S</h3>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full" :class="isPuterLoaded ? 'bg-green-500' : 'bg-red-500'"></span>
            <span class="text-[10px] text-gray-500 font-bold">{{ isPuterLoaded ? 'SYSTEM ONLINE' : 'OFFLINE' }}</span>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
          <div class="text-gray-500 text-xs text-center border-b border-white/5 pb-2">--- SESI DEV DIMULAI ---</div>
          
          <div v-for="(msg, i) in messages" :key="i" class="flex flex-col">
            <span class="text-xs font-bold mb-1" 
                  :class="{'text-blue-400': msg.role === 'user', 'text-purple-400': msg.role === 'ai', 'text-yellow-500': msg.role === 'system'}">
              {{ msg.role === 'user' ? 'YOU:' : msg.role === 'ai' ? 'AI DEV:' : 'SYSTEM:' }}
            </span>
            <div class="text-gray-300 break-words whitespace-pre-wrap pl-2 border-l-2"
                 :class="{'border-blue-500': msg.role === 'user', 'border-purple-500': msg.role === 'ai', 'border-yellow-500': msg.role === 'system'}">
              {{ msg.content }}
            </div>
          </div>
          
          <div v-if="isGenerating" class="text-purple-400 animate-pulse pl-2 border-l-2 border-purple-500">
            [AI Sedang Menulis Kode...]
          </div>
        </div>

        <div class="p-4 bg-black/50 border-t border-white/5">
          <div class="flex items-center gap-2">
            <span class="text-green-500 font-bold font-mono">></span>
            <input 
              v-model="chatInput" 
              @keyup.enter="sendMessage"
              type="text" 
              placeholder="Misal: Buatkan halaman /admin/artikel dengan fitur ZCRUD..." 
              class="w-full bg-transparent text-white font-mono text-sm outline-none placeholder:text-gray-600"
              :disabled="isGenerating || !isPuterLoaded"
            />
          </div>
        </div>
      </div>

      <!-- Pending Changes Panel -->
      <div class="flex flex-col gap-6">
        <div class="bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex flex-col flex-1">
          <div class="bg-black/50 p-4 border-b border-white/5 flex items-center justify-between">
            <h3 class="font-bold text-white flex items-center gap-2">
              <Icon name="lucide:git-pull-request" :size="18" class="text-orange-500" />
              Draf Kode (Pending Changes)
            </h3>
            <span v-if="pendingChanges.length" class="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-xs font-bold rounded-full">
              {{ pendingChanges.length }} File
            </span>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="pendingChanges.length === 0" class="h-full flex flex-col items-center justify-center text-gray-600 gap-3">
              <Icon name="lucide:code-2" :size="48" class="opacity-20" />
              <p class="text-sm font-medium">Belum ada draf kode dari AI.</p>
            </div>
            
            <div v-else class="space-y-6">
              <div v-for="(file, i) in pendingChanges" :key="i" class="border border-white/5 rounded-lg overflow-hidden">
                <div class="bg-black/50 px-3 py-2 text-xs font-mono text-gray-300 border-b border-white/5">
                  📝 {{ file.path }}
                </div>
                <div class="p-4 overflow-x-auto">
                  <pre class="text-[11px] font-mono text-gray-400 whitespace-pre-wrap">{{ file.content }}</pre>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="pendingChanges.length > 0" class="p-4 bg-black/50 border-t border-white/5 flex gap-3">
            <button @click="accChanges" class="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Icon name="lucide:check" :size="18" />
              ACC (Terapkan Kode)
            </button>
            <button @click="rejectChanges" class="px-6 py-3 bg-red-900/40 hover:bg-red-800 text-red-500 hover:text-white rounded-xl font-bold transition-colors text-sm">
              Tolak
            </button>
          </div>
        </div>
        
        <!-- Undo/Redo System -->
        <div class="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 class="font-bold text-blue-400 text-sm">Sistem Keamanan Revert</h4>
            <p class="text-xs text-blue-300/60 mt-1">Kembalikan website ke kondisi semula jika AI melakukan kesalahan.</p>
          </div>
          <button 
            @click="revertChanges"
            :disabled="!lastBackupId || isGenerating"
            class="px-4 py-2 bg-blue-600 disabled:bg-blue-900/50 hover:bg-blue-500 text-white disabled:text-gray-500 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
            <Icon name="lucide:undo-2" :size="16" />
            Undo Revert
          </button>
        </div>
      </div>
      
    </div>
  </div>
</template>
