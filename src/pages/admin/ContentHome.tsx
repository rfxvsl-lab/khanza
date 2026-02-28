import { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2, Save, Upload } from 'lucide-react';

export default function AdminContentHome() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hero_image: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/content-home');
        const data = await res.json();
        if (res.ok) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            hero_image: data.hero_image || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, hero_image: data.url }));
        setMessage({ type: 'success', text: 'Gambar berhasil diunggah.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal mengunggah gambar.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengunggah.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch('/api/admin/content-home', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Konten beranda berhasil diperbarui.' });
      } else {
        setMessage({ type: 'error', text: 'Gagal memperbarui konten beranda.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Konten Halaman Beranda</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Judul Hero</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
              placeholder="cth., Mendefinisikan Ulang Kesempurnaan Otomotif"
            />
            <p className="text-xs text-gray-500">Dua kata terakhir akan ditampilkan dengan warna merah.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Deskripsi Hero</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none resize-none"
              placeholder="Masukkan deskripsi hero..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Gambar Latar Hero</label>
            <div className="flex gap-4 mb-2">
              <input
                type="url"
                required
                value={formData.hero_image}
                onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                className="flex-1 px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                placeholder="https://contoh.com/gambar.jpg"
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
                className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                Unggah
              </button>
            </div>
            {formData.hero_image && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10 h-48 relative">
                <img src={formData.hero_image} alt="Preview Hero" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
