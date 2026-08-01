import cron from 'node-cron';

export default defineNitroPlugin((nitroApp) => {
  // Hanya jalankan di production (biar tidak mengganggu saat development)
  // Tapi untuk testing saat ini, kita biarkan jalan di semua environment.
  
  // Menjadwalkan cron job berjalan setiap 10 menit
  cron.schedule('*/10 * * * *', async () => {
    try {
      // Kita asumsikan URL base dari server saat ini.
      // Pada platform hosting (seperti Vercel, Render), process.env.URL atau process.env.BASE_URL biasanya tersedia.
      const targetUrl = process.env.BASE_URL || process.env.URL || `http://localhost:${process.env.PORT || 3000}`;
      
      console.log(`[Cron] Membangunkan server di: ${targetUrl}/api/ping ...`);
      
      const response = await $fetch('/api/ping', { baseURL: targetUrl });
      
      console.log('[Cron] Berhasil! Respon:', response);
    } catch (error: any) {
      console.error('[Cron] Gagal membangunkan server:', error.message);
    }
  });

  console.log('[Cron] Plugin Keep-Alive berhasil diinisialisasi (Berjalan setiap 10 menit).');
});
