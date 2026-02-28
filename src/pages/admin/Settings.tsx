import { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Loader2, Upload, X } from 'lucide-react';

export default function Settings() {
  const { site_name, logo_url, footer_text } = useSettings();
  const [formData, setFormData] = useState({
    site_name: '',
    logo_url: '',
    footer_text: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ site_name, logo_url, footer_text });
  }, [site_name, logo_url, footer_text]);

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, logo_url: data.url }));
        setMessage('Logo berhasil diunggah.');
      } else {
        setMessage(data.error || 'Gagal mengunggah logo.');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan saat mengunggah.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage('Pengaturan berhasil disimpan. Refresh untuk melihat perubahan.');
      } else {
        setMessage('Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Pengaturan Situs</h1>

      {message && (
        <div className={`p-4 rounded-xl mb-6 ${message.includes('berhasil') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Nama Situs (Teks Header)</label>
          <input
            type="text"
            value={formData.site_name}
            onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Logo</label>
          <p className="text-xs text-gray-500 mb-3">Unggah file logo atau masukkan URL gambar. Kosongkan untuk menggunakan logo teks.</p>

          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              placeholder="https://... atau unggah file"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleLogoUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              Unggah
            </button>
          </div>

          {formData.logo_url && (
            <div className="mt-3 p-4 bg-black/50 rounded-xl inline-flex items-center gap-4">
              <img src={formData.logo_url} alt="Preview Logo" className="h-12 object-contain" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, logo_url: '' })}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                title="Hapus logo"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Deskripsi Footer</label>
          <textarea
            value={formData.footer_text}
            onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all h-32"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
}
