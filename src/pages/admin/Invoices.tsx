import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2, Plus, Trash2, X, FileText, Printer, Tag } from 'lucide-react';

interface InvoiceItem {
    name: string;
    price: number;
}

interface Booking {
    id: number;
    name: string;
    email: string;
    phone: string;
    vehicle_info: string;
    scheduled_at: string;
    service_title: string;
    voucher_code: string | null;
    voucher_discount?: number;
    service_id: number;
}

interface Service {
    id: number;
    title: string;
    price: string;
}

interface Invoice {
    id: number;
    booking_id: number;
    items: string;
    voucher_code: string | null;
    discount_percent: number;
    subtotal: number;
    total: number;
    payment_status: 'LUNAS' | 'DP';
    dp_amount: number;
    remaining_amount: number;
    created_at: string;
    client_name?: string;
    client_email?: string;
    service_title?: string;
}

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function AdminInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
    const [previewBooking, setPreviewBooking] = useState<Booking | null>(null);
    const [services, setServices] = useState<Service[]>([]);

    // Default logo from DB
    const [storeLogo, setStoreLogo] = useState('');

    // Form state
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [items, setItems] = useState<InvoiceItem[]>([{ name: '', price: 0 }]);
    const [voucherCode, setVoucherCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState<'LUNAS' | 'DP'>('LUNAS');
    const [dpAmount, setDpAmount] = useState(0);

    const token = localStorage.getItem('adminToken');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, bookRes, svcRes] = await Promise.all([
                fetch('/api/admin/invoices', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/services')
            ]);
            const invData = await invRes.json();
            const bookData = await bookRes.json();
            const svcData = await svcRes.json();
            if (invRes.ok) setInvoices(invData);
            if (bookRes.ok) setBookings(bookData);
            if (svcRes.ok) setServices(svcData);

            // Fetch Settings for Logo
            const setRes = await fetch('/api/settings');
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

    useEffect(() => { fetchData(); }, []);

    const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;
    const remainingAmount = paymentStatus === 'DP' ? total - dpAmount : 0;

    const handleSelectBooking = (bookingId: number) => {
        setSelectedBookingId(bookingId);
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            let initialPrice = 0;
            const matchedService = services.find(s => s.id === booking.service_id || s.title === booking.service_title);
            if (matchedService) {
                initialPrice = parseFloat(matchedService.price);
            }
            setItems([{ name: booking.service_title || 'Layanan', price: initialPrice }]);
            if (booking.voucher_code) {
                setVoucherCode(booking.voucher_code);
                setDiscountPercent(booking.voucher_discount || 0);
            } else {
                setVoucherCode('');
                setDiscountPercent(0);
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    booking_id: selectedBookingId,
                    items,
                    voucher_code: voucherCode || null,
                    discount_percent: discountPercent,
                    subtotal,
                    total,
                    payment_status: paymentStatus,
                    dp_amount: paymentStatus === 'DP' ? dpAmount : 0,
                    remaining_amount: remainingAmount
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
                resetForm();
            } else {
                alert('Gagal membuat invoice');
            }
        } catch (err) {
            alert('Terjadi kesalahan');
        }
    };

    const resetForm = () => {
        setSelectedBookingId(null);
        setItems([{ name: '', price: 0 }]);
        setVoucherCode('');
        setDiscountPercent(0);
        setPaymentStatus('LUNAS');
        setDpAmount(0);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus invoice ini?')) return;
        try {
            await fetch(`/api/admin/invoices/${id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (err) { alert('Gagal menghapus'); }
    };

    const openPreview = async (inv: Invoice) => {
        const booking = bookings.find(b => b.id === inv.booking_id);
        setPreviewBooking(booking || null);
        setPreviewInvoice(inv);
    };

    const printInvoice = () => {
        const printContent = document.getElementById('invoice-print');
        if (!printContent) return;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;
        w.document.write(`<html><head><title>Invoice #${previewInvoice?.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { padding: 40px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #dc2626; padding-bottom: 20px; }
        .header-logo { max-height: 50px; }
        .inv-title { font-size: 28px; font-weight: bold; color: #dc2626; margin-top: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-block h4 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 4px; letter-spacing: 1px; }
        .info-block p { font-size: 14px; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
        .status-lunas { background: #dcfce7; color: #166534; }
        .status-dp { background: #fef08a; color: #854d0e; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #555; }
        td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
        .totals { width: 300px; margin-left: auto; text-align: right; }
        .totals-row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
        .totals-row.grand { font-size: 18px; font-weight: bold; color: #dc2626; border-top: 2px solid #dc2626; padding-top: 8px; margin-top: 8px; }
        .totals-row.remaining { font-size: 16px; font-weight: bold; color: #111; border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 8px; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px; }
      </style></head><body>`);
        w.document.write(printContent.innerHTML);
        w.document.write('</body></html>');
        w.document.close();
        w.focus();

        // Timeout ensures the logo image renders before printing
        setTimeout(() => {
            w.print();
            w.close();
        }, 500);
    };

    const inputClass = "w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Kelola Invoice</h1>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                    <Plus size={20} /> Buat Invoice
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
                                <th className="p-4 font-medium text-gray-400">ID</th>
                                <th className="p-4 font-medium text-gray-400">Klien</th>
                                <th className="p-4 font-medium text-gray-400">Subtotal</th>
                                <th className="p-4 font-medium text-gray-400">Diskon</th>
                                <th className="p-4 font-medium text-gray-400">Total</th>
                                <th className="p-4 font-medium text-gray-400">Status</th>
                                <th className="p-4 font-medium text-gray-400">Tanggal</th>
                                <th className="p-4 font-medium text-gray-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-red-500">INV-{String(inv.id).padStart(4, '0')}</td>
                                    <td className="p-4 font-medium">{inv.client_name || '-'}</td>
                                    <td className="p-4 text-gray-400">{formatRupiah(inv.subtotal)}</td>
                                    <td className="p-4">
                                        {inv.discount_percent > 0 ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                                                -{inv.discount_percent}%
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 font-bold text-white">{formatRupiah(inv.total)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inv.payment_status === 'LUNAS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                            {inv.payment_status || 'LUNAS'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button onClick={() => openPreview(inv)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                            <Printer size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(inv.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Belum ada invoice.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Invoice Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
                    >
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Buat Invoice Baru</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Select Booking */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Pilih Reservasi</label>
                                <select
                                    required
                                    value={selectedBookingId || ''}
                                    onChange={(e) => handleSelectBooking(parseInt(e.target.value))}
                                    className={`${inputClass} appearance-none`}
                                >
                                    <option value="" disabled>Pilih reservasi...</option>
                                    {bookings.map(b => (
                                        <option key={b.id} value={b.id}>
                                            #{b.id} - {b.name || 'Tanpa Nama'} - {b.service_title || 'Layanan'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Items */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Item Layanan</label>
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text" required placeholder="Pilih layanan atau ketik manual..."
                                                value={item.name}
                                                list={`services-list-${idx}`}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    const val = e.target.value;
                                                    newItems[idx].name = val;

                                                    // Auto-fill price if matched
                                                    const matchedService = services.find(s => s.title === val);
                                                    if (matchedService && !newItems[idx].price) {
                                                        newItems[idx].price = parseFloat(matchedService.price);
                                                    }

                                                    setItems(newItems);
                                                }}
                                                className={`${inputClass} w-full`}
                                            />
                                            <datalist id={`services-list-${idx}`}>
                                                {services.map(svc => (
                                                    <option key={svc.id} value={svc.title} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <input
                                            type="number" required placeholder="Harga" min="0"
                                            value={item.price || ''}
                                            onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[idx].price = parseInt(e.target.value) || 0;
                                                setItems(newItems);
                                            }}
                                            className={`${inputClass} w-36`}
                                        />
                                        {items.length > 1 && (
                                            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))}
                                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setItems([...items, { name: '', price: 0 }])}
                                    className="text-sm text-red-400 hover:text-red-300 mt-1">
                                    + Tambah Item
                                </button>
                            </div>

                            {/* Voucher auto-detect */}
                            {voucherCode && (
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                                    <Tag size={14} /> Voucher terdeteksi: <strong>{voucherCode}</strong> (-{discountPercent}%)
                                </div>
                            )}

                            {/* Status Pembayaran */}
                            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Status Pembayaran</label>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => {
                                            setPaymentStatus(e.target.value as 'LUNAS' | 'DP');
                                            if (e.target.value === 'LUNAS') setDpAmount(0);
                                        }}
                                        className={`${inputClass} appearance-none`}
                                    >
                                        <option value="LUNAS">LUNAS</option>
                                        <option value="DP">DP (Down Payment)</option>
                                    </select>
                                </div>
                                {paymentStatus === 'DP' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Nominal DP</label>
                                        <input
                                            type="number" required min="0" max={total}
                                            value={dpAmount || ''}
                                            onChange={(e) => setDpAmount(parseInt(e.target.value) || 0)}
                                            className={`${inputClass}`}
                                            placeholder="Rp..."
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">{formatRupiah(subtotal)}</span>
                                </div>
                                {discountPercent > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-400">Diskon ({discountPercent}%)</span>
                                        <span className="text-green-400">-{formatRupiah(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
                                    <span>Total Tagihan</span>
                                    <span className="text-red-500">{formatRupiah(total)}</span>
                                </div>
                                {paymentStatus === 'DP' && (
                                    <>
                                        <div className="flex justify-between text-sm text-yellow-500 pt-2">
                                            <span>Dibayar (DP)</span>
                                            <span>{formatRupiah(dpAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-md font-bold text-white pt-1">
                                            <span>Sisa Tagihan</span>
                                            <span>{formatRupiah(remainingAmount)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
                                Buat Invoice
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Print Preview Modal */}
            {previewInvoice && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white text-black p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                    >
                        <div className="flex justify-between mb-4">
                            <button onClick={printInvoice} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-red-700">
                                <Printer size={16} /> Cetak Invoice
                            </button>
                            <button onClick={() => { setPreviewInvoice(null); setPreviewBooking(null); }} className="p-2 text-gray-400 hover:text-black rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div id="invoice-print">
                            <div className="header">
                                <div>
                                    {storeLogo ? (
                                        <img src={storeLogo} alt="Logo" className="header-logo" />
                                    ) : (
                                        <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#111' }}>Khanza Repaint</div>
                                    )}
                                    <div className="inv-title">INVOICE</div>
                                    <p style={{ fontSize: '14px', color: '#666' }}>INV-{String(previewInvoice.id).padStart(4, '0')}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className={`status-badge ${previewInvoice.payment_status === 'LUNAS' ? 'status-lunas' : 'status-dp'}`}>
                                        {previewInvoice.payment_status || 'LUNAS'}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#888' }}>
                                        Terbit: {previewInvoice.created_at ? new Date(previewInvoice.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-block">
                                    <h4>Klien</h4>
                                    <p style={{ fontWeight: 'bold' }}>{previewBooking?.name || previewInvoice.client_name || '-'}</p>
                                    <p>{previewBooking?.email || previewInvoice.client_email || ''}</p>
                                    <p>{previewBooking?.phone || ''}</p>
                                </div>
                                <div className="info-block">
                                    <h4>Kendaraan</h4>
                                    <p>{previewBooking?.vehicle_info || '-'}</p>
                                    <h4 style={{ marginTop: '8px' }}>Jadwal</h4>
                                    <p>{previewBooking?.scheduled_at ? new Date(previewBooking.scheduled_at).toLocaleDateString('id-ID') : '-'}</p>
                                </div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Layanan</th>
                                        <th style={{ textAlign: 'right' }}>Harga</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        try {
                                            const parsed: InvoiceItem[] = JSON.parse(previewInvoice.items);
                                            return parsed.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.name}</td>
                                                    <td style={{ textAlign: 'right' }}>{formatRupiah(item.price)}</td>
                                                </tr>
                                            ));
                                        } catch {
                                            return <tr><td colSpan={2}>-</td></tr>;
                                        }
                                    })()}
                                </tbody>
                            </table>

                            <div className="totals">
                                <div className="totals-row">
                                    <span>Subtotal:</span>
                                    <span>{formatRupiah(previewInvoice.subtotal)}</span>
                                </div>
                                {previewInvoice.discount_percent > 0 && (
                                    <div className="totals-row" style={{ color: '#16a34a' }}>
                                        <span>Diskon Voucher (-{previewInvoice.discount_percent}%):</span>
                                        <span>-{formatRupiah(previewInvoice.subtotal * previewInvoice.discount_percent / 100)}</span>
                                    </div>
                                )}
                                <div className="totals-row grand">
                                    <span>Total Tagihan:</span>
                                    <span>{formatRupiah(previewInvoice.total)}</span>
                                </div>

                                {previewInvoice.payment_status === 'DP' && (
                                    <>
                                        <div className="totals-row">
                                            <span>Telah Dibayar (DP):</span>
                                            <span>{formatRupiah(previewInvoice.dp_amount || 0)}</span>
                                        </div>
                                        <div className="totals-row remaining">
                                            <span>Sisa Pembayaran:</span>
                                            <span>{formatRupiah(previewInvoice.remaining_amount || 0)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="footer">
                                <p>Terima kasih telah mempercayakan kendaraan Anda kepada Khanza Repaint</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
