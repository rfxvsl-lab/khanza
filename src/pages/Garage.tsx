import { motion } from 'motion/react';
import { Search, Loader2, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Car } from '../types';
import Spinner from '../components/ui/Spinner';

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

export default function Garage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchGarage = async () => {
      try {
        const res = await fetch('/api/garage');
        if (!res.ok) throw new Error('Gagal memuat inventaris');
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        setError('Gagal memuat inventaris galeri.');
      } finally {
        setLoading(false);
      }
    };
    fetchGarage();
  }, []);

  const filteredInventory = inventory.filter(car =>
    car.status === 'available' && car.car_model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-[2px] bg-red-500" />
          <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Koleksi Kami</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Galeri</span> Kami
            </h1>
            <p className="text-gray-500 max-w-xl text-lg">
              Jelajahi koleksi kendaraan premium kami yang telah dirawat dengan teliti dan siap untuk pemilik barunya.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Cari kendaraan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/40 transition-colors"
              />
            </div>
            <div className="flex rounded-xl border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 text-sm transition-colors ${viewMode === 'grid' ? 'bg-white/[0.06] text-white' : 'text-gray-600 hover:text-gray-400'}`}
                aria-label="Tampilan grid"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect width="7" height="7" /><rect x="9" width="7" height="7" /><rect y="9" width="7" height="7" /><rect x="9" y="9" width="7" height="7" /></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 text-sm transition-colors ${viewMode === 'list' ? 'bg-white/[0.06] text-white' : 'text-gray-600 hover:text-gray-400'}`}
                aria-label="Tampilan daftar"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect width="16" height="3" /><rect y="6.5" width="16" height="3" /><rect y="13" width="16" height="3" /></svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : error ? (
        <div className="text-center py-20 text-red-400 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredInventory.map((car, idx) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`group rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-500 ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                }`}
            >
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-72 aspect-[4/3] md:aspect-auto' : 'aspect-[4/3]'}`}>
                <img
                  src={car.images}
                  alt={car.car_model}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                  {car.year}
                </div>
                <button
                  onClick={() => setSelectedCar(car)}
                  className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 border border-white/10"
                  aria-label="Lihat cepat"
                >
                  <Eye size={16} />
                </button>
              </div>

              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">{car.car_model}</h3>
                    <p className="text-gray-600 text-sm">{car.description}</p>
                  </div>
                  <p className="text-lg font-bold text-white whitespace-nowrap ml-4">{formatRupiah(car.price)}</p>
                </div>

                <button
                  onClick={() => setSelectedCar(car)}
                  className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-red-600 hover:border-red-600 text-white font-medium text-sm transition-all duration-300"
                >
                  Lihat Detail
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !error && filteredInventory.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-600" />
          </div>
          <p className="text-gray-500 text-lg mb-2">Kendaraan tidak ditemukan</p>
          <p className="text-gray-600 text-sm">Coba sesuaikan kata pencarian Anda</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCar(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <img src={selectedCar.images} alt={selectedCar.car_model} className="w-full h-full object-cover rounded-t-2xl" referrerPolicy="no-referrer" />
              <button
                onClick={() => setSelectedCar(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 backdrop-blur-md text-white hover:bg-red-600 transition-colors border border-white/10"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white text-sm font-bold border border-white/10">
                {selectedCar.year}
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedCar.car_model}</h2>
                <span className="text-2xl font-bold text-red-500">{formatRupiah(selectedCar.price)}</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">{selectedCar.description}</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Tahun', value: selectedCar.year },
                  { label: 'Status', value: 'Tersedia' },
                  { label: 'Kondisi', value: 'Sangat Baik' },
                ].map((spec) => (
                  <div key={spec.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-gray-500 text-xs mb-1">{spec.label}</p>
                    <p className="text-white font-semibold text-sm">{spec.value}</p>
                  </div>
                ))}
              </div>

              <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                Tanyakan Kendaraan Ini
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
