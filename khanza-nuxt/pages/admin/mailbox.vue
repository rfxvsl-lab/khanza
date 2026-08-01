<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});
useSeoMeta({ title: 'Mailbox & CRM - Admin' });

const currentTab = ref<'inbox' | 'sent' | 'compose' | 'broadcast'>('inbox');
const mailboxData = ref<{ inbox: any[], sent: any[] }>({ inbox: [], sent: [] });
const loading = ref(true);
const processing = ref(false);
const statusMsg = ref({ text: '', type: '' });

// Compose Form
const composeForm = ref({ to: '', subject: '', message: '' });
const broadcastForm = ref({ subject: '', message: '' });
const selectedMessage = ref<any>(null);

const fetchData = async () => {
  loading.value = true;
  const token = localStorage.getItem('adminToken');
  try {
    const data: any = await $fetch('/api/admin/mailbox', {
      headers: { Authorization: `Bearer ${token}` }
    });
    mailboxData.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openMessage = (msg: any, type: 'inbox' | 'sent') => {
  selectedMessage.value = { ...msg, msgType: type };
};

const replyToMessage = () => {
  if (selectedMessage.value && selectedMessage.value.msgType === 'inbox') {
    composeForm.value.to = selectedMessage.value.sender_email;
    composeForm.value.subject = `Re: ${selectedMessage.value.subject}`;
    composeForm.value.message = `\n\n--- Pesan Asli ---\nDari: ${selectedMessage.value.sender_name}\n${selectedMessage.value.subject}`;
    currentTab.value = 'compose';
    selectedMessage.value = null;
  }
};

const sendEmail = async (action: 'send' | 'broadcast') => {
  processing.value = true;
  statusMsg.value = { text: '', type: '' };
  
  const payload = action === 'send' 
    ? { action: 'send', to: composeForm.value.to, subject: composeForm.value.subject, message: composeForm.value.message }
    : { action: 'broadcast', to: '', subject: broadcastForm.value.subject, message: broadcastForm.value.message };

  const token = localStorage.getItem('adminToken');
  try {
    const res: any = await $fetch('/api/admin/mailbox', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    });
    statusMsg.value = { text: `Berhasil! Preview URL: ${res.previewUrl || 'N/A'}`, type: 'success' };
    
    if (action === 'send') composeForm.value = { to: '', subject: '', message: '' };
    else broadcastForm.value = { subject: '', message: '' };
    
    setTimeout(() => {
      statusMsg.value = { text: '', type: '' };
      fetchData();
      currentTab.value = 'sent';
    }, 3000);
  } catch (err: any) {
    statusMsg.value = { text: err.response?._data?.statusMessage || 'Gagal mengirim', type: 'error' };
  } finally {
    processing.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 bg-black text-white">
    
    <!-- Sidebar -->
    <div class="w-full md:w-64 flex flex-col shrink-0">
      <h2 class="text-2xl font-bold mb-6 text-red-500">CRM Mailbox</h2>
      
      <button 
        @click="currentTab = 'compose'; selectedMessage = null"
        class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-none mb-6 flex items-center justify-center gap-2 transition-colors"
      >
        <Icon name="cil:pencil" :size="18" /> Tulis Pesan
      </button>

      <nav class="flex flex-col gap-2">
        <button 
          @click="currentTab = 'inbox'; selectedMessage = null"
          :class="['flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2', currentTab === 'inbox' && !selectedMessage ? 'bg-white/10 border-red-500 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5']"
        >
          <Icon name="cil:inbox" :size="18" /> Inbox Reservasi
          <span class="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{{ mailboxData.inbox.length }}</span>
        </button>
        <button 
          @click="currentTab = 'sent'; selectedMessage = null"
          :class="['flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2', currentTab === 'sent' && !selectedMessage ? 'bg-white/10 border-red-500 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5']"
        >
          <Icon name="cil:send" :size="18" /> Sent Items
        </button>
        <button 
          @click="currentTab = 'broadcast'; selectedMessage = null"
          :class="['flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2', currentTab === 'broadcast' ? 'bg-white/10 border-red-500 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5']"
        >
          <Icon name="cil:bullhorn" :size="18" /> Broadcast Promo
        </button>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-none flex flex-col overflow-hidden">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <Icon name="cil:sync" class="animate-spin text-red-500" :size="32" />
      </div>

      <!-- READ MESSAGE VIEW -->
      <div v-else-if="selectedMessage" class="flex flex-col h-full overflow-y-auto">
        <div class="p-4 border-b border-white/[0.06] flex items-center gap-4 sticky top-0 bg-[#121212] z-10">
          <button @click="selectedMessage = null" class="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <Icon name="cil:arrow-left" :size="20" />
          </button>
          <h3 class="font-bold text-lg truncate">{{ selectedMessage.subject }}</h3>
        </div>
        
        <div class="p-6">
          <div class="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold">
                {{ selectedMessage.msgType === 'inbox' ? selectedMessage.sender_name.charAt(0).toUpperCase() : 'K' }}
              </div>
              <div>
                <p class="font-bold text-sm">{{ selectedMessage.msgType === 'inbox' ? selectedMessage.sender_name : 'Khanza Repaint' }}</p>
                <p class="text-xs text-gray-400">{{ selectedMessage.msgType === 'inbox' ? selectedMessage.sender_email : selectedMessage.to_email }}</p>
              </div>
            </div>
            <span class="text-xs text-gray-500">{{ formatDate(selectedMessage.msgType === 'inbox' ? selectedMessage.date : selectedMessage.sent_at) }}</span>
          </div>

          <div v-if="selectedMessage.msgType === 'inbox'" class="text-sm text-gray-300 leading-relaxed bg-black/50 p-6 border border-white/5">
            <p class="text-red-400 font-bold mb-4">Informasi Reservasi:</p>
            <table class="w-full text-left border-collapse">
              <tbody>
                <tr class="border-b border-white/5"><th class="py-2 w-1/3 text-gray-500 font-normal">Nama</th><td class="py-2">{{ selectedMessage.sender_name }}</td></tr>
                <tr class="border-b border-white/5"><th class="py-2 text-gray-500 font-normal">Email</th><td class="py-2">{{ selectedMessage.sender_email }}</td></tr>
                <tr class="border-b border-white/5"><th class="py-2 text-gray-500 font-normal">Telepon</th><td class="py-2">{{ selectedMessage.originalData.phone }}</td></tr>
                <tr class="border-b border-white/5"><th class="py-2 text-gray-500 font-normal">Kendaraan</th><td class="py-2">{{ selectedMessage.originalData.vehicle_info }}</td></tr>
                <tr><th class="py-2 text-gray-500 font-normal">Jadwal</th><td class="py-2">{{ formatDate(selectedMessage.originalData.scheduled_at) }}</td></tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {{ selectedMessage.body }}
          </div>

          <div class="mt-8" v-if="selectedMessage.msgType === 'inbox'">
            <button @click="replyToMessage" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors flex items-center gap-2">
              <Icon name="cil:action-undo" :size="16" /> Balas ke Email
            </button>
          </div>
        </div>
      </div>

      <!-- INBOX LIST -->
      <div v-else-if="currentTab === 'inbox'" class="flex-1 overflow-y-auto">
        <div class="p-4 border-b border-white/[0.06] bg-[#121212] sticky top-0 font-bold text-gray-300">
          Inbox Reservasi
        </div>
        <div v-if="mailboxData.inbox.length === 0" class="p-8 text-center text-gray-500">Tidak ada pesan masuk.</div>
        <div v-for="msg in mailboxData.inbox" :key="msg.id" @click="openMessage(msg, 'inbox')" class="flex items-center gap-4 p-4 border-b border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition-colors group">
          <div class="w-2 h-2 rounded-full bg-red-500"></div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-sm text-white truncate">{{ msg.sender_name }}</span>
              <span class="text-xs text-gray-500 whitespace-nowrap ml-4">{{ formatDate(msg.date) }}</span>
            </div>
            <div class="text-sm text-gray-400 truncate">{{ msg.subject }}</div>
          </div>
        </div>
      </div>

      <!-- SENT LIST -->
      <div v-else-if="currentTab === 'sent'" class="flex-1 overflow-y-auto">
        <div class="p-4 border-b border-white/[0.06] bg-[#121212] sticky top-0 font-bold text-gray-300">
          Pesan Terkirim
        </div>
        <div v-if="mailboxData.sent.length === 0" class="p-8 text-center text-gray-500">Belum ada email terkirim.</div>
        <div v-for="msg in mailboxData.sent" :key="msg.id" @click="openMessage(msg, 'sent')" class="flex items-center gap-4 p-4 border-b border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition-colors">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-sm text-white truncate">To: {{ msg.to_email }}</span>
              <span class="text-xs text-gray-500 whitespace-nowrap ml-4">{{ formatDate(msg.sent_at) }}</span>
            </div>
            <div class="text-sm text-gray-400 truncate">{{ msg.subject }}</div>
            <div class="text-xs mt-1">
               <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/10" :class="msg.type === 'broadcast' ? 'text-blue-400' : 'text-gray-400'">{{ msg.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- COMPOSE VIEW -->
      <div v-else-if="currentTab === 'compose'" class="flex-1 flex flex-col h-full bg-[#0a0a0a]">
        <div class="p-4 border-b border-white/[0.06] font-bold text-gray-300">Pesan Baru</div>
        <form @submit.prevent="sendEmail('send')" class="flex flex-col flex-1 p-6 gap-4 overflow-y-auto">
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Kepada (Email)</label>
            <input type="email" required v-model="composeForm.to" class="w-full bg-black border border-white/10 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none" placeholder="alamat@email.com">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subjek</label>
            <input type="text" required v-model="composeForm.subject" class="w-full bg-black border border-white/10 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none" placeholder="Subjek email">
          </div>
          <div class="flex-1 flex flex-col min-h-[300px]">
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pesan</label>
            <textarea required v-model="composeForm.message" class="w-full flex-1 bg-black border border-white/10 px-4 py-3 text-white focus:border-red-500 focus:outline-none resize-none" placeholder="Tulis pesan Anda di sini..."></textarea>
          </div>
          
          <div v-if="statusMsg.text" :class="['p-3 text-sm border', statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400']">
            {{ statusMsg.text }}
          </div>
          
          <div class="pt-4 flex justify-end">
            <button type="submit" :disabled="processing" class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
              <Icon v-if="processing" name="cil:sync" class="animate-spin" />
              <Icon v-else name="cil:send" />
              {{ processing ? 'Mengirim...' : 'Kirim Email' }}
            </button>
          </div>
        </form>
      </div>

      <!-- BROADCAST VIEW -->
      <div v-else-if="currentTab === 'broadcast'" class="flex-1 flex flex-col h-full bg-[#0a0a0a]">
        <div class="p-4 border-b border-white/[0.06] font-bold text-gray-300 flex items-center gap-2">
          <Icon name="cil:bullhorn" class="text-blue-500"/> Broadcast Promo Massal
        </div>
        <div class="p-6 bg-blue-500/10 border-b border-blue-500/20 text-blue-300 text-sm">
          <p>Fitur ini akan mengirimkan email ini ke <strong>semua email</strong> yang ada di daftar Newsletter Subscribers Anda (BCC). Harap gunakan dengan bijak untuk menghindari masuk spam.</p>
        </div>
        <form @submit.prevent="sendEmail('broadcast')" class="flex flex-col flex-1 p-6 gap-4 overflow-y-auto">
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subjek Promo</label>
            <input type="text" required v-model="broadcastForm.subject" class="w-full bg-black border border-white/10 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none" placeholder="Cth: Promo Spesial Repaint Bulan Ini!">
          </div>
          <div class="flex-1 flex flex-col min-h-[300px]">
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pesan Promo</label>
            <textarea required v-model="broadcastForm.message" class="w-full flex-1 bg-black border border-white/10 px-4 py-3 text-white focus:border-red-500 focus:outline-none resize-none" placeholder="Tulis konten promo menarik Anda di sini... (HTML template akan ditambahkan otomatis)"></textarea>
          </div>
          
          <div v-if="statusMsg.text" :class="['p-3 text-sm border', statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400']">
            {{ statusMsg.text }}
          </div>
          
          <div class="pt-4 flex justify-end">
            <button type="submit" :disabled="processing" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
              <Icon v-if="processing" name="cil:sync" class="animate-spin" />
              <Icon v-else name="cil:bullhorn" />
              {{ processing ? 'Memproses Broadcast...' : 'Kirim Blast Massal' }}
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>
