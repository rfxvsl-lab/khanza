import { useState, useEffect } from 'react';
import { Loader2, Tag, FileText, User, Mail, Phone, Car, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_info: string;
  service_id: number;
  scheduled_at: string;
  status: string;
  service_title: string;
  voucher_code: string | null;
  created_at: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/admin/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchBookings();
    } catch (err) {
      alert('Gagal memperbarui status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data reservasi ini?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBookings();
    } catch (err) {
      alert('Gagal menghapus reservasi');
    }
  };

  const statusLabels: Record<string, { text: string; color: string }> = {
    pending: { text: 'Menunggu', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    completed: { text: 'Selesai', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    cancelled: { text: 'Dibatalkan', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kelola Reservasi</h1>
        <span className="text-sm text-gray-400">{bookings.length} reservasi</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-red-500" size={48} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada reservasi.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusInfo = statusLabels[booking.status] || statusLabels.pending;
            return (
              <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-red-500 text-sm font-bold">#{booking.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                      {booking.voucher_code && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                          <Tag size={12} /> Voucher: {booking.voucher_code}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-500 shrink-0" />
                        <span className="text-gray-400">Nama:</span>
                        <span className="text-white font-medium">{booking.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-gray-500 shrink-0" />
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white font-medium truncate">{booking.email || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-gray-500 shrink-0" />
                        <span className="text-gray-400">Telepon:</span>
                        <span className="text-white font-medium">{booking.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car size={14} className="text-gray-500 shrink-0" />
                        <span className="text-gray-400">Kendaraan:</span>
                        <span className="text-white font-medium">{booking.vehicle_info}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Layanan:</span>
                        <span className="text-white font-medium">{booking.service_title || `ID: ${booking.service_id}`}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Jadwal:</span>
                        <span className="text-white font-medium">
                          {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap gap-2 md:flex-col">
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      className="px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:border-red-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="pending">Menunggu</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate('/admin/invoices')}
                        className="px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1.5 flex-1 justify-center"
                      >
                        <FileText size={14} /> Invoice
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1.5 justify-center"
                        title="Hapus Reservasi"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
