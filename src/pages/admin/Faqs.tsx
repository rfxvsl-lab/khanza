import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2, Plus, Edit, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  display_order: number;
}

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0
  });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      if (res.ok) setFaqs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (item?: FAQ) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        question: item.question,
        answer: item.answer,
        display_order: item.display_order
      });
    } else {
      setEditingItem(null);
      setFormData({
        question: '',
        answer: '',
        display_order: faqs.length > 0 ? Math.max(...faqs.map(f => f.display_order)) + 1 : 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const url = editingItem ? `/api/faqs/${editingItem.id}` : '/api/faqs';
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
        fetchFaqs();
        handleCloseModal();
      } else {
        alert('Gagal menyimpan FAQ');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus FAQ ini?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchFaqs();
      } else {
        alert('Gagal menghapus FAQ');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  const moveOrder = async (id: number, currentOrder: number, direction: 'up' | 'down') => {
    const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    const token = localStorage.getItem('adminToken');

    const swapItem = faqs.find(f => f.display_order === targetOrder);

    try {
      await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ display_order: targetOrder })
      });

      if (swapItem) {
        await fetch(`/api/faqs/${swapItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ display_order: currentOrder })
        });
      }

      fetchFaqs();
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah urutan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kelola FAQ</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
        >
          <Plus size={20} /> Tambah FAQ
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
                <th className="p-4 font-medium text-gray-400 w-24 text-center">Urutan</th>
                <th className="p-4 font-medium text-gray-400">Pertanyaan</th>
                <th className="p-4 font-medium text-gray-400">Jawaban</th>
                <th className="p-4 font-medium text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((item, index) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <button
                        onClick={() => moveOrder(item.id, item.display_order, 'up')}
                        disabled={index === 0}
                        className="text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <span className="text-sm font-mono">{item.display_order}</span>
                      <button
                        onClick={() => moveOrder(item.id, item.display_order, 'down')}
                        disabled={index === faqs.length - 1}
                        className="text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 font-medium max-w-xs">{item.question}</td>
                  <td className="p-4 text-gray-400 max-w-sm truncate">{item.answer}</td>
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
              {faqs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada FAQ.</td>
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
            className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-md relative"
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit FAQ' : 'Tambah FAQ'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Pertanyaan</label>
                <input
                  type="text" required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Jawaban</label>
                <textarea
                  required rows={5}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Urutan Tampil</label>
                <input
                  type="number" required min="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors mt-4"
              >
                {editingItem ? 'Simpan Perubahan' : 'Tambah FAQ'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
