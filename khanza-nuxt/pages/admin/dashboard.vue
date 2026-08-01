<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, isSameWeek, isSameMonth, isSameYear, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

useSeoMeta({ title: 'Dasbor Admin - Khanza Repaint' });

const stats = ref({ total_bookings: 0, available_cars: 0, active_vouchers: 0, newsletter_subs: 0 });
const bookings = ref<any[]>([]);
const storeLogo = ref('');
const loading = ref(true);
const filter = ref<'week' | 'month' | 'year'>('month');

onMounted(async () => {
  const token = localStorage.getItem('adminToken');
  try {
    const [statsRes, bookRes, setRes]: any = await Promise.all([
      $fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      $fetch('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
      $fetch('/api/settings').catch(() => ({}))
    ]);
    if (statsRes) stats.value = statsRes;
    if (bookRes) bookings.value = bookRes;
    if (setRes) storeLogo.value = setRes.logo_url || '';
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const chartData = computed(() => {
  const now = new Date();
  const completed = bookings.value.filter(b => b.status === 'completed' && b.scheduled_at);

  if (filter.value === 'week') {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      const count = completed.filter(b => format(parseISO(b.scheduled_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length;
      return { name: format(day, 'EEEE', { locale: id }), total: count };
    });
  }

  if (filter.value === 'month') {
    return [1, 2, 3, 4].map(week => {
      const count = completed.filter(b => isSameMonth(parseISO(b.scheduled_at), now) && Math.ceil(parseISO(b.scheduled_at).getDate() / 7) === week).length;
      return { name: `Minggu ${week}`, total: count };
    });
  }

  if (filter.value === 'year') {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return months.map(m => {
      const count = completed.filter(b => isSameYear(parseISO(b.scheduled_at), now) && parseISO(b.scheduled_at).getMonth() === m).length;
      const monthName = format(new Date(now.getFullYear(), m, 1), 'MMM', { locale: id });
      return { name: monthName, total: count };
    });
  }
  return [];
});

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    foreColor: '#888',
    background: 'transparent'
  },
  colors: ['#ef4444'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 95, 100] }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: chartData.value.map(d => d.name),
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { show: true },
  grid: {
    borderColor: '#ffffff10',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } }
  },
  tooltip: { theme: 'dark' }
}));

const chartSeries = computed(() => [{
  name: 'Selesai',
  data: chartData.value.map(d => d.total)
}]);

const exportExcel = () => {
  const completed = bookings.value.filter(b => b.status === 'completed');
  if (completed.length === 0) return alert('Tidak ada data reservasi selesai untuk diekspor.');

  const worksheet = XLSX.utils.json_to_sheet(completed.map(b => ({
    'ID Reservasi': `#${b.id}`,
    'Klien': b.name || '-',
    'Kontak': `${b.email || '-'} | ${b.phone || '-'}`,
    'Kendaraan': b.vehicle_info,
    'Layanan': b.service_title || 'Layanan',
    'Tanggal Selesai': b.scheduled_at ? format(parseISO(b.scheduled_at), 'dd MMM yyyy HH:mm', { locale: id }) : '-'
  })));

  const wscols = [{ wch: 15 }, { wch: 25 }, { wch: 35 }, { wch: 25 }, { wch: 30 }, { wch: 25 }];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reservasi Selesai");
  XLSX.writeFile(workbook, `Rekap_KhanzaRepaint_${format(new Date(), 'ddMMyyyy')}.xlsx`);
};

const exportPDF = () => {
  const completed = bookings.value.filter(b => b.status === 'completed');
  if (completed.length === 0) return alert('Tidak ada data reservasi selesai untuk diekspor.');

  const doc = new jsPDF();
  const tableColumn = ["ID", "Klien", "Kendaraan", "Layanan", "Waktu Selesai"];
  const tableRows = completed.map(b => [
    b.id,
    b.name || '-',
    b.vehicle_info,
    b.service_title || '-',
    b.scheduled_at ? format(parseISO(b.scheduled_at), 'dd/MM/yyyy HH:mm') : '-'
  ]);

  doc.setFontSize(22);
  doc.setTextColor(220, 38, 38);
  doc.text("Khanza Repaint", 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Laporan Rekapitulasi Reservasi Selesai`, 14, 30);
  doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`, 14, 36);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 }
  });

  doc.save(`Laporan_KhanzaRepaint_${format(new Date(), 'ddMMyyyy')}.pdf`);
};
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 class="text-3xl font-bold">Ringkasan Dasbor</h1>
      <div class="flex items-center gap-2">
        <button @click="exportExcel" class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-none text-sm font-medium transition-colors">
          <Icon name="cil:cloud-download" :size="16" /> Excel
        </button>
        <button @click="exportPDF" class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none text-sm font-medium transition-colors">
          <Icon name="cil:cloud-download" :size="16" /> PDF
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="cil:reload" class="animate-spin text-red-500" :size="48" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white/5 border border-white/10 p-6 rounded-none">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-400 font-medium text-sm">Total Reservasi</h3>
            <span class="text-blue-400"><Icon name="cil:calendar" :size="24" /></span>
          </div>
          <p class="text-4xl font-bold">{{ stats.total_bookings }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 p-6 rounded-none">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-400 font-medium text-sm">Kendaraan Tersedia</h3>
            <span class="text-green-400"><Icon name="cil:car-alt" :size="24" /></span>
          </div>
          <p class="text-4xl font-bold">{{ stats.available_cars }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 p-6 rounded-none">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-400 font-medium text-sm">Voucher Aktif</h3>
            <span class="text-purple-400"><Icon name="cil:tag" :size="24" /></span>
          </div>
          <p class="text-4xl font-bold">{{ stats.active_vouchers }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 p-6 rounded-none">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-400 font-medium text-sm">Subs Newsletter</h3>
            <span class="text-red-400"><Icon name="cil:envelope-closed" :size="24" /></span>
          </div>
          <p class="text-4xl font-bold">{{ stats.newsletter_subs }}</p>
        </div>
      </div>

      <div class="bg-white/5 border border-white/10 rounded-none p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-white">Statistik Pekerjaan Selesai</h3>
            <p class="text-sm text-gray-400">Total reservasi yang telah selesai dikerjakan.</p>
          </div>
          <div class="flex items-center gap-2 bg-black/50 p-1 rounded-none border border-white/10">
            <Icon name="cil:filter" :size="14" class="text-gray-400 ml-2" />
            <select
              v-model="filter"
              class="bg-transparent text-sm text-white border-none py-1 pr-8 pl-2 outline-none appearance-none"
            >
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>
        </div>

        <div class="h-[300px] w-full">
          <ClientOnly>
            <apexchart width="100%" height="100%" type="area" :options="chartOptions" :series="chartSeries"></apexchart>
          </ClientOnly>
        </div>
      </div>
    </template>
  </div>
</template>
