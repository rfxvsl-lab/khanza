import { useState, useEffect } from 'react';
import { Loader2, CalendarDays, Car, Tag, Mail, Download, Filter } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, isSameWeek, isSameMonth, isSameYear, startOfWeek, endOfWeek, subDays, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_info: string;
  service_title: string;
  scheduled_at: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total_bookings: 0, available_cars: 0, active_vouchers: 0, newsletter_subs: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [storeLogo, setStoreLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const [statsRes, bookRes, setRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/settings')
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (bookRes.ok) setBookings(await bookRes.json());
        if (setRes.ok) {
          const sData = await setRes.json();
          setStoreLogo(sData.logo_url || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process chart data for COMPLETED bookings
  const getChartData = () => {
    const now = new Date();
    const completed = bookings.filter(b => b.status === 'completed' && b.scheduled_at);

    if (filter === 'week') {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });

      return days.map(day => {
        const count = completed.filter(b => format(parseISO(b.scheduled_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length;
        return { name: format(day, 'EEEE', { locale: id }), total: count };
      });
    }

    if (filter === 'month') {
      // Create 4 weeks
      return [1, 2, 3, 4].map(week => {
        const count = completed.filter(b => isSameMonth(parseISO(b.scheduled_at), now) && Math.ceil(parseISO(b.scheduled_at).getDate() / 7) === week).length;
        return { name: `Minggu ${week}`, total: count };
      });
    }

    if (filter === 'year') {
      const months = Array.from({ length: 12 }, (_, i) => i);
      return months.map(m => {
        const count = completed.filter(b => isSameYear(parseISO(b.scheduled_at), now) && parseISO(b.scheduled_at).getMonth() === m).length;
        const monthName = format(new Date(now.getFullYear(), m, 1), 'MMM', { locale: id });
        return { name: monthName, total: count };
      });
    }
    return [];
  };

  const chartData = getChartData();

  // Export to Excel
  const exportExcel = () => {
    const completed = bookings.filter(b => b.status === 'completed');
    if (completed.length === 0) return alert('Tidak ada data reservasi selesai untuk diekspor.');

    const worksheet = XLSX.utils.json_to_sheet(completed.map(b => ({
      'ID Reservasi': `#${b.id}`,
      'Klien': b.name || '-',
      'Kontak': `${b.email || '-'} | ${b.phone || '-'}`,
      'Kendaraan': b.vehicle_info,
      'Layanan': b.service_title || 'Layanan',
      'Tanggal Selesai': b.scheduled_at ? format(parseISO(b.scheduled_at), 'dd MMM yyyy HH:mm', { locale: id }) : '-'
    })));

    // Auto width
    const wscols = [
      { wch: 15 }, { wch: 25 }, { wch: 35 }, { wch: 25 }, { wch: 30 }, { wch: 25 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservasi Selesai");
    XLSX.writeFile(workbook, `Rekap_KhanzaRepaint_${format(new Date(), 'ddMMyyyy')}.xlsx`);
  };

  // Export to PDF
  const exportPDF = () => {
    const completed = bookings.filter(b => b.status === 'completed');
    if (completed.length === 0) return alert('Tidak ada data reservasi selesai untuk diekspor.');

    const doc = new jsPDF();
    const tableColumn = ["ID", "Klien", "Kendaraan", "Layanan", "Waktu Selesai"];
    const tableRows: any[] = [];

    completed.forEach(b => {
      const row = [
        b.id,
        b.name || '-',
        b.vehicle_info,
        b.service_title || '-',
        b.scheduled_at ? format(parseISO(b.scheduled_at), 'dd/MM/yyyy HH:mm') : '-'
      ];
      tableRows.push(row);
    });

    // Add Logo & Header
    if (storeLogo) {
      // Simplified: text header if no easy base64 mapping, but usually we can drawimage if it's base64/url
      // For cross-origin issues with jsPDF, a text fallback is safe if image fails. We will attempt text first.
      doc.setFontSize(22);
      doc.setTextColor(220, 38, 38);
      doc.text("Khanza Repaint", 14, 22);
    } else {
      doc.setFontSize(22);
      doc.setTextColor(220, 38, 38);
      doc.text("Khanza Repaint", 14, 22);
    }

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

  const statCards = [
    { label: 'Total Reservasi (Semua)', value: stats.total_bookings, icon: <CalendarDays size={24} />, color: 'text-blue-400' },
    { label: 'Kendaraan Tersedia', value: stats.available_cars, icon: <Car size={24} />, color: 'text-green-400' },
    { label: 'Voucher Aktif', value: stats.active_vouchers, icon: <Tag size={24} />, color: 'text-purple-400' },
    { label: 'Subscriber Newsletter', value: stats.newsletter_subs, icon: <Mail size={24} />, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Ringkasan Dasbor</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Download size={16} /> Excel
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-red-500" size={48} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-400 font-medium text-sm">{stat.label}</h3>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <p className="text-4xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Statistik Pekerjaan Selesai</h3>
                <p className="text-sm text-gray-400">Total reservasi yang telah selesai dikerjakan.</p>
              </div>
              <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/10">
                <Filter size={14} className="text-gray-400 ml-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-transparent text-sm text-white border-none py-1 pr-8 pl-2 outline-none appearance-none"
                >
                  <option value="week">Minggu Ini</option>
                  <option value="month">Bulan Ini</option>
                  <option value="year">Tahun Ini</option>
                </select>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#ef4444' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
