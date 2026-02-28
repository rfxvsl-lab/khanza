import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Car, User, Mail, Phone, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, MapPin, Tag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import type { Service } from '../types';

const STEPS = ['Pribadi', 'Kendaraan', 'Jadwal', 'Konfirmasi'];

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

export default function Booking() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialService = queryParams.get('service') || '';
  const { site_name } = useSettings();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    make: '', model: '', year: '',
    service: initialService, date: '', time: '',
    voucher_code: ''
  });
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [voucherInfo, setVoucherInfo] = useState<{ valid: boolean; discount_percent: number; code: string } | null>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (res.ok) setServices(data);
      } catch (e) { console.error(e); }
    };
    fetchServices();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset voucher validation when code changes
    if (e.target.name === 'voucher_code') {
      setVoucherInfo(null);
    }
  };

  const validateVoucher = async () => {
    if (!formData.voucher_code.trim()) return;
    setVoucherChecking(true);
    try {
      const res = await fetch('/api/validate-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.voucher_code.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setVoucherInfo({ valid: true, discount_percent: data.discount_percent, code: data.code });
      } else {
        setVoucherInfo(null);
        setStatus({ type: 'error', message: data.error || 'Voucher tidak valid' });
        setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal memvalidasi voucher' });
    } finally {
      setVoucherChecking(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Memeriksa ketersediaan...' });
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: `${formData.date}T${formData.time}`,
          service: formData.service,
          vehicle_info: `${formData.year} ${formData.make} ${formData.model}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          voucher_code: voucherInfo?.valid ? formData.voucher_code.trim() : null
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Reservasi berhasil dikonfirmasi!' });
        setFormData({ name: '', email: '', phone: '', make: '', model: '', year: '', service: '', date: '', time: '', voucher_code: '' });
        setVoucherInfo(null);
      } else {
        setStatus({ type: 'error', message: data.error || 'Gagal membuat reservasi.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
  };

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, 3));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0));

  const getServiceName = (id: string) => {
    const svc = services.find(s => String(s.id) === id);
    return svc ? svc.title : `Layanan #${id}`;
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all";

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-[2px] bg-red-500" />
          <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Jadwalkan Kunjungan</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          Buat <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Reservasi</span>
        </h1>
        <p className="text-gray-500 max-w-xl text-lg">
          Jadwalkan layanan otomotif premium Anda. Tim ahli kami siap mentransformasi kendaraan Anda.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8"
          >
            {status.type === 'success' ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Reservasi Dikonfirmasi!</h2>
                <p className="text-gray-500 max-w-md mb-8">
                  Terima kasih telah memilih {site_name}. Kami akan menghubungi Anda untuk konfirmasi detail.
                </p>
                <button
                  onClick={() => { setStatus({ type: 'idle', message: '' }); setCurrentStep(0); }}
                  className="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold rounded-xl transition-all"
                >
                  Buat Reservasi Lagi
                </button>
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                  {STEPS.map((step, idx) => (
                    <div key={step} className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${idx === currentStep
                          ? 'bg-red-600 text-white'
                          : idx < currentStep
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-white/[0.04] text-gray-600'
                          }`}
                      >
                        {idx < currentStep ? '✓' : idx + 1}
                      </div>
                      <span className={`text-sm font-medium hidden sm:inline ${idx === currentStep ? 'text-white' : 'text-gray-600'
                        }`}>{step}</span>
                      {idx < 3 && <div className={`w-6 md:w-10 h-[1px] ${idx < currentStep ? 'bg-red-500/30' : 'bg-white/[0.06]'}`} />}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {/* Step 1: Personal */}
                    {currentStep === 0 && (
                      <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4">Data Pribadi</h3>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Nama Lengkap" className={`${inputClass} pl-12`} />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Alamat Email" className={`${inputClass} pl-12`} />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Nomor Telepon" className={`${inputClass} pl-12`} />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Vehicle */}
                    {currentStep === 1 && (
                      <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4">Kendaraan & Layanan</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" name="make" required value={formData.make} onChange={handleChange} placeholder="Merek (cth. Toyota)" className={inputClass} />
                          <input type="text" name="model" required value={formData.model} onChange={handleChange} placeholder="Model (cth. Avanza)" className={inputClass} />
                        </div>
                        <input type="text" name="year" value={formData.year} onChange={handleChange} placeholder="Tahun (cth. 2023)" className={inputClass} />
                        <div className="relative">
                          <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <select name="service" required value={formData.service} onChange={handleChange} className={`${inputClass} pl-12 appearance-none`}>
                            <option value="" disabled>Pilih Layanan</option>
                            {services.map(svc => (
                              <option key={svc.id} value={svc.id}>
                                {svc.title} — {formatRupiah(svc.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Schedule + Voucher */}
                    {currentStep === 2 && (
                      <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4">Jadwal & Voucher</h3>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input type="date" name="date" required value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className={`${inputClass} pl-12 [color-scheme:dark]`} />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input type="time" name="time" required value={formData.time} onChange={handleChange} className={`${inputClass} pl-12 [color-scheme:dark]`} />
                        </div>

                        {/* Voucher Input */}
                        <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Kode Voucher (Opsional)</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                              <input
                                type="text" name="voucher_code"
                                value={formData.voucher_code}
                                onChange={handleChange}
                                placeholder="Masukkan kode voucher"
                                className={`${inputClass} pl-12 uppercase`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={validateVoucher}
                              disabled={!formData.voucher_code.trim() || voucherChecking}
                              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-40 text-sm whitespace-nowrap"
                            >
                              {voucherChecking ? 'Cek...' : 'Validasi'}
                            </button>
                          </div>
                          {voucherInfo?.valid && (
                            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                              <CheckCircle2 size={16} />
                              Voucher valid! Diskon {voucherInfo.discount_percent}% akan diterapkan.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 3 && (
                      <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h3 className="text-lg font-bold text-white mb-6">Ringkasan Reservasi</h3>
                        <div className="space-y-3">
                          {[
                            { label: 'Nama', value: formData.name },
                            { label: 'Email', value: formData.email },
                            { label: 'Telepon', value: formData.phone },
                            { label: 'Kendaraan', value: `${formData.year} ${formData.make} ${formData.model}` },
                            { label: 'Layanan', value: getServiceName(formData.service) },
                            { label: 'Tanggal & Waktu', value: `${formData.date} pukul ${formData.time}` },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                              <span className="text-gray-500 text-sm">{item.label}</span>
                              <span className="text-white text-sm font-medium">{item.value || '—'}</span>
                            </div>
                          ))}
                          {voucherInfo?.valid && (
                            <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                              <span className="text-gray-500 text-sm">Voucher</span>
                              <span className="text-green-400 text-sm font-bold flex items-center gap-1.5">
                                <Tag size={14} />
                                {formData.voucher_code} (-{voucherInfo.discount_percent}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error */}
                  {status.type === 'error' && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mt-6">
                      <AlertCircle size={18} />
                      <p className="text-sm">{status.message}</p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 gap-3">
                    {currentStep > 0 ? (
                      <button type="button" onClick={prevStep} className="flex items-center gap-2 px-5 py-3 bg-white/[0.04] border border-white/[0.06] text-white font-medium rounded-xl hover:bg-white/[0.08] transition-all text-sm">
                        <ArrowLeft size={16} /> Kembali
                      </button>
                    ) : <div />}

                    {currentStep < 3 ? (
                      <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all text-sm">
                        Selanjutnya <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button type="submit" disabled={status.type === 'loading'} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 text-sm">
                        {status.type === 'loading' ? 'Memproses...' : 'Konfirmasi Reservasi'}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Jam Operasional</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between text-gray-500"><span>Sen — Jum</span><span className="text-white">08.00 — 18.00</span></li>
              <li className="flex justify-between text-gray-500"><span>Sabtu</span><span className="text-white">09.00 — 16.00</span></li>
              <li className="flex justify-between text-gray-500"><span>Minggu</span><span className="text-red-500">Tutup</span></li>
            </ul>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <Phone size={14} className="text-red-500/70 shrink-0" />
                +62 812-3456-7890
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <Mail size={14} className="text-red-500/70 shrink-0" />
                hello@khanzarepaint.com
              </li>
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <MapPin size={14} className="text-red-500/70 shrink-0 mt-0.5" />
                Jl. Otomotif No. 123, Jakarta Selatan
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-950/30 to-transparent border border-red-500/10 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Butuh bantuan memilih?</p>
            <p className="text-white font-semibold">Hubungi kami untuk konsultasi gratis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
