import { useState, useEffect } from 'react';
import { Loader2, Trash2, Mail } from 'lucide-react';

interface Subscriber {
    id: number;
    email: string;
    subscribed_at: string;
}

export default function AdminNewsletters() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/newsletters', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setSubscribers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubscribers(); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus subscriber ini?')) return;
        const token = localStorage.getItem('adminToken');
        try {
            await fetch(`/api/admin/newsletters/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchSubscribers();
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Langganan Newsletter</h1>
                <span className="text-sm text-gray-400">{subscribers.length} subscriber</span>
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
                                <th className="p-4 font-medium text-gray-400">#</th>
                                <th className="p-4 font-medium text-gray-400">Email</th>
                                <th className="p-4 font-medium text-gray-400">Tanggal</th>
                                <th className="p-4 font-medium text-gray-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub, idx) => (
                                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-gray-500">{idx + 1}</td>
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <Mail size={16} className="text-red-500/60" />
                                        {sub.email}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada subscriber.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
