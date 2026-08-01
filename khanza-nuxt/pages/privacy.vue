<script setup lang="ts">
useSeoMeta({
  title: 'Kebijakan Privasi - Khanza Repaint',
  description: 'Cara Khanza Repaint mengelola dan melindungi data pribadi serta kendaraan Anda.'
})
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-gray-400 pt-32 pb-24">
    <div class="max-w-4xl mx-auto px-6">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Kebijakan Privasi</h1>
      <p class="text-lg text-gray-500 mb-12">Keamanan data Anda sama pentingnya dengan keamanan kendaraan Anda. Kami di Khanza Repaint berkomitmen untuk melindungi informasi pribadi Anda.</p>

      <div class="space-y-12">
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">1. Data yang Kami Kumpulkan</h2>
          <p class="mb-4">Dalam operasional harian, sistem kami mengumpulkan informasi berupa:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4">
            <li><strong>Informasi Kontak:</strong> Nama lengkap, nomor telepon (WhatsApp), dan alamat email untuk keperluan pengiriman *invoice* dan konfirmasi reservasi.</li>
            <li><strong>Data Kendaraan:</strong> Merek, model, tahun pembuatan, nomor polisi (pelat nomor), dan nomor rangka mesin untuk dokumentasi hukum dan riwayat garansi.</li>
            <li><strong>Foto Kendaraan:</strong> Bukti kerusakan atau kondisi sebelum dan sesudah (*before/after*) sebagai *Quality Control* internal kami.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">2. Bagaimana Kami Menggunakan Data Anda</h2>
          <p class="mb-4">Data yang dikumpulkan sepenuhnya digunakan untuk:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4">
            <li>Memproses dan melacak pesanan servis Anda (Reservasi -> Pengerjaan -> Serah Terima).</li>
            <li>Melakukan validasi klaim garansi jangka panjang.</li>
            <li>Menghubungi Anda terkait pemberitahuan selesai servis, penagihan, atau pengingat jadwal pemeliharaan (*coating maintenance*).</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">3. Berbagi Data kepada Pihak Ketiga</h2>
          <p class="mb-4">Khanza Repaint <strong>tidak akan pernah menjual, menyewakan, atau menukar</strong> data pribadi pelanggan kepada pihak agensi iklan. Kami hanya membagikan data kepada pihak ketiga yang berwenang dalam kondisi tertentu, yaitu:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4">
            <li>Perusahaan asuransi (atas persetujuan pelanggan) untuk klaim asuransi *body repair*.</li>
            <li>Penegak hukum (Kepolisian) jika terdapat perintah resmi atau dugaan tindak pidana terkait kendaraan tersebut.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">4. Retensi dan Keamanan Data</h2>
          <p class="mb-4">Semua data akan disimpan menggunakan enkripsi dalam *database* sistem internal kami. Data histori kendaraan disimpan maksimal selama 7 tahun sejak kunjungan terakhir demi mendukung kelengkapan administrasi.</p>
        </section>
      </div>
    </div>
  </div>
</template>
