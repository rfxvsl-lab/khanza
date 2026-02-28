import { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2, Plus, Edit, Trash2, X, Image as ImageIcon, Upload } from 'lucide-react';

interface GarageItem {
  id: number;
  car_model: string;
  year: number;
  price: number;
  description: string;
  images: string;
  status: 'available' | 'sold';
}

export default function AdminGarage() {
  const [items, setItems] = useState<GarageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GarageItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    car_model: '',
    year: new Date().getFullYear(),
    price: 0,
    description: '',
    images: '',
    status: 'available'
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/garage');
      const data = await res.json();
      if (res.ok) setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item?: GarageItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        car_model: item.car_model,
        year: item.year,
        price: item.price,
        description: item.description,
        images: item.images,
        status: item.status
      });
    } else {
      setEditingItem(null);
      setFormData({
        car_model: '',
        year: new Date().getFullYear(),
        price: 0,
        description: '',
        images: '',
        status: 'available'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, images: data.url }));
      } else {
        alert(data.error || 'Gagal mengunggah gambar.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengunggah.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const url = editingItem ? `/api/garage/${editingItem.id}` : '/api/garage';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchItems();
        handleCloseModal();
      } else {
        alert('Gagal menyimpan kendaraan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kendaraan ini?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/garage/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchItems();
      } else {
        alert('Gagal menghapus kendaraan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const statusLabels: Record<string, string> = {
    available: 'Tersedia',
    sold: 'Terjual'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kelola Galeri</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
        >
          <Plus size={20} /> Tambah Kendaraan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-red-500" size={48} />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 font-medium text-gray-400">Gambar</th>
                <th className="p-4 font-medium text-gray-400">Model</th>
                <th className="p-4 font-medium text-gray-400">Tahun</th>
                <th className="p-4 font-medium text-gray-400">Harga</th>
                <th className="p-4 font-medium text-gray-400">Status</th>
                <th className="p-4 font-medium text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    {item.images ? (
                      <img src={item.images} alt={item.car_model} className="w-16 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-gray-500">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{item.car_model}</td>
                  <td className="p-4 text-gray-400">{item.year}</td>
                  <td className="p-4">{formatRupiah(item.price)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.status === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2 items-center h-full">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Belum ada kendaraan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Model Kendaraan</label>
                <input
                  type="text" required
                  value={formData.car_model}
                  onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tahun</label>
                  <input
                    type="number" required min="1900" max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Harga (Rp)</label>
                  <input
                    type="number" required min="0" step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'sold' })}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none appearance-none"
                >
                  <option value="available">Tersedia</option>
                  <option value="sold">Terjual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">URL Gambar</label>
                <div className="flex gap-2">
                  <input
                    type="url" required
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="https://contoh.com/gambar.jpg"
                    className="flex-1 px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
                <textarea
                  required rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors mt-4 disabled:opacity-50"
              >
                {editingItem ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
