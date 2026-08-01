<script setup lang="ts">
useSeoMeta({
  title: 'Pusat Bantuan - Khanza Repaint',
  description: 'Informasi panduan, klaim garansi, dan cara menghubungi layanan pelanggan Khanza Repaint.'
})
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-gray-400 pt-32 pb-24">
    <div class="max-w-4xl mx-auto px-6">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Pusat Bantuan</h1>
      <p class="text-lg text-gray-500 mb-12">Kami siap membantu setiap kendala pada kendaraan Anda. Silakan pelajari panduan di bawah ini atau hubungi tim kami secara langsung.</p>

      <div class="space-y-12">
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">1. Cara Menghubungi Kami & Lokasi</h2>
          <p class="mb-6">Tim dukungan Khanza Repaint tersedia pada hari kerja melalui beberapa saluran berikut:</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl">
              <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                <Icon name="lucide:share-2" class="text-red-500" />
                Akun Media Sosial & Kontak
              </h3>
              <ul class="space-y-4">
                <li>
                  <a href="https://instagram.com/khanza.repaint" target="_blank" class="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                    <Icon name="mdi:instagram" :size="20" class="text-pink-500" />
                    @khanza.repaint
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/62881036492931" target="_blank" class="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                    <Icon name="mdi:whatsapp" :size="20" class="text-green-500" />
                    0881-0364-92931
                  </a>
                </li>
                <li>
                  <a href="https://tiktok.com/@khanza.repaint" target="_blank" class="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                    <Icon name="ic:baseline-tiktok" :size="20" class="text-white" />
                    khanza.repaint
                  </a>
                </li>
              </ul>
            </div>

            <div class="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl">
              <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                <Icon name="lucide:map-pin" class="text-red-500" />
                Alamat Bengkel
              </h3>
              <p class="text-sm leading-relaxed text-gray-400">
                <strong class="text-white">Bengkel KHANZA BODY REPAIR & REPAINT</strong><br/>
                Jl. Cokroaminoto RW V No.18, Mojosari, Ngenep,<br/>
                Kec. Karang Ploso, Kabupaten Malang,<br/>
                Jawa Timur 65152
              </p>
            </div>
          </div>

          <!-- Embed Google Map -->
          <div class="w-full h-[400px] rounded-2xl overflow-hidden border border-white/[0.05] bg-white/[0.02]">
            <iframe 
              src="https://maps.google.com/maps?q=Jl.%20Cokroaminoto%20RW%20V%20No.18,%20Mojosari,%20Ngenep,%20Kec.%20Karang%20Ploso,%20Kabupaten%20Malang,%20Jawa%20Timur%2065152&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">2. Prosedur Klaim Garansi</h2>
          <p class="mb-4">Khanza Repaint memberikan garansi hingga 5 tahun untuk pengerjaan <em>coating</em> dan 1 tahun untuk pengecatan ulang (*repaint*). Syarat klaim:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4">
            <li>Membawa faktur atau bukti pembayaran digital dari sistem Khanza Repaint.</li>
            <li>Kerusakan yang terjadi murni karena cacat material atau pengerjaan (bukan karena kecelakaan, benturan fisik, atau bahan kimia korosif pasca-perbaikan).</li>
            <li>Melakukan pengecekan fisik di bengkel kami secara langsung.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">3. Jam Operasional & Booking</h2>
          <p class="mb-4">Untuk menghindari antrean panjang, kami sangat menyarankan Anda melakukan reservasi melalui halaman <strong>Buat Reservasi</strong> sebelum mendatangi bengkel. Kendaraan dengan status "Reservasi Online" akan mendapatkan prioritas pada jalur antrean <em>Fast Track</em>.</p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">4. Penanganan Komplain Khusus</h2>
          <p class="mb-4">Jika Anda merasa tidak puas dengan hasil pekerjaan mekanik kami, mohon untuk menghubungi kami dalam waktu 2x24 jam setelah kendaraan diserahterimakan. Keluhan akan langsung dievaluasi oleh Kepala Montir (Head Mechanic) kami.</p>
        </section>
      </div>
    </div>
  </div>
</template>
