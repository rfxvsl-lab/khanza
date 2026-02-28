import { useState, useEffect } from 'react';
import { Loader2, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

interface Voucher {
    id: number;
    code: string;
    discount_percent: number;
    email_claimed: string;
    is_used: boolean | number;
}

export default function AdminVouchers() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [enabled, setEnabled] = useState(true);
    const [defaultDiscount, setDefaultDiscount] = useState(30);
    const [saving, setSaving] = useState(false);

    const fetchVouchers = async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/vouchers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setVouchers(data.vouchers || []);
                setEnabled(data.enabled);
                setDefaultDiscount(data.default_discount || 30);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVouchers(); }, []);

    const toggleEnabled = async () => {
        const token = localStorage.getItem('adminToken');
        setSaving(true);
        try {
            await fetch('/api/admin/voucher-toggle', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ enabled: !enabled })
            });
            setEnabled(!enabled);
        } catch (err) {
            alert('Gagal mengubah pengaturan');
        } finally {
            setSaving(false);
        }
    };

    const saveDiscount = async () => {
        const token = localStorage.getItem('adminToken');
        setSaving(true);
        try {
            await fetch('/api/admin/voucher-discount', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ discount: defaultDiscount })
            });
            alert('Diskon default disimpan');
        } catch (err) {
            alert('Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus voucher ini?')) return;
        const token = localStorage.getItem('adminToken');
        try {
            await fetch(`/api/admin/vouchers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchVouchers();
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Kelola Voucher</h1>
            </div>

            {/* Settings Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Pengaturan Voucher</h2>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Toggle */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">Status Fitur Voucher</span>
                        <button
                            onClick={toggleEnabled}
                            disabled={saving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${enabled
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}
                        >
                            {enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            {enabled ? 'Aktif' : 'Nonaktif'}
                        </button>
                    </div>

                    {/* Default Discount */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Diskon Default (%)</span>
                        <input
                            type="number" min="1" max="100"
                            value={defaultDiscount}
                            onChange={(e) => setDefaultDiscount(parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-center focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                        />
                        <button
                            onClick={saveDiscount}
                            disabled={saving}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            </div>

            {/* Voucher list */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-red-500" size={48} />
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 font-medium text-gray-400">Kode</th>
                                <th className="p-4 font-medium text-gray-400">Diskon</th>
                                <th className="p-4 font-medium text-gray-400">Email</th>
                                <th className="p-4 font-medium text-gray-400">Status</th>
                                <th className="p-4 font-medium text-gray-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.map((v) => (
                                <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono font-bold flex items-center gap-2">
                                        <Tag size={14} className="text-red-500/60" />
                                        {v.code}
                                    </td>
                                    <td className="p-4 text-white">{v.discount_percent}%</td>
                                    <td className="p-4 text-gray-400">{v.email_claimed}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${v.is_used
                                                ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            }`}>
                                            {v.is_used ? 'Terpakai' : 'Aktif'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(v.id)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {vouchers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada voucher.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
