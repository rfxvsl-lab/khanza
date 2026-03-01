import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Sparkles, Droplets, CheckCircle, ClipboardList, Wrench, Car, Loader2, Copy, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      start = start || timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [voucherStatus, setVoucherStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const { site_name } = useSettings();
  const [content, setContent] = useState({ title: '', description: '', hero_image: '' });
  const [loading, setLoading] = useState(true);
  const [voucherEnabled, setVoucherEnabled] = useState(true);

  // Voucher modal state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/content-home');
        const data = await res.json();
        if (res.ok) setContent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();

    // Check voucher enabled status
    const checkVoucher = async () => {
      try {
        const res = await fetch('/api/voucher-status');
        const data = await res.json();
        setVoucherEnabled(data.enabled);
      } catch (e) { /* default true */ }
    };
    checkVoucher();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setCanClose(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimVoucher = async (e: FormEvent) => {
    e.preventDefault();
    setVoucherStatus({ type: 'loading', message: 'Memproses...' });
    try {
      const res = await fetch('/api/claim-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setVoucherCode(data.code);
        setVoucherDiscount(data.discount);
        setCanClose(false);
        setCopied(false);
        setShowVoucherModal(true);
        setVoucherStatus({ type: 'idle', message: '' });
        setEmail('');
      } else {
        setVoucherStatus({ type: 'error', message: data.error || 'Gagal mengklaim voucher' });
      }
    } catch (err) {
      setVoucherStatus({ type: 'error', message: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-6">
        <div className="absolute inset-0 z-0">
          {content.hero_image && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-45"
              style={{ backgroundImage: `url(${content.hero_image})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/80" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-[2px] bg-red-500" />
                  <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Repaint Mobil Premium</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  {content.title.split(' ').map((word, i, arr) => {
                    if (i >= arr.length - 2) {
                      return <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">{word} </span>;
                    }
                    return word + ' ';
                  })}
                </h1>

                <p className="text-gray-400 text-lg max-w-lg mb-8 leading-relaxed">
                  {content.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/booking"
                    className="px-7 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 justify-center"
                  >
                    Buat Reservasi <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/service"
                    className="px-7 py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-semibold rounded-xl transition-all duration-300 text-center"
                  >
                    Jelajahi Layanan
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right: Stats */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {[
                { value: 500, suffix: '+', label: 'Mobil Dicat', color: 'from-red-500/10 to-red-900/5' },
                { value: 10, suffix: '+', label: 'Tahun Pengalaman', color: 'from-red-500/10 to-red-900/5' },
                { value: 100, suffix: '%', label: 'Tingkat Kepuasan', color: 'from-red-500/10 to-red-900/5' },
                { value: 5, suffix: ' Thn', label: 'Garansi Cat', color: 'from-red-500/10 to-red-900/5' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] backdrop-blur-sm"
                >
                  <p className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>


      </section>

      {/* Trust Strip */}
      <section className="border-y border-white/[0.04] py-6 mb-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { icon: <ShieldCheck size={20} />, text: 'Teknisi Bersertifikat' },
            { icon: <Sparkles size={20} />, text: 'Material Premium' },
            { icon: <Droplets size={20} />, text: 'Detailing Presisi' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-gray-500">
              <span className="text-red-500/60">{item.icon}</span>
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Mengapa Memilih Kami</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Keahlian Bertemu Teknologi</h2>
          <p className="text-gray-500 max-w-xl">Kami menggabungkan teknologi canggih dengan keahlian pengrajin untuk menghasilkan hasil yang tak tertandingi.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Sparkles size={28} />, title: 'Material Premium', desc: 'Kami hanya menggunakan cat dan clear coat kualitas tertinggi untuk hasil yang tahan lama dan sempurna.' },
            { icon: <ShieldCheck size={28} />, title: 'Teknisi Ahli', desc: 'Tim kami terdiri dari profesional bersertifikat dengan pengalaman gabungan puluhan tahun.' },
            { icon: <Droplets size={28} />, title: 'Detailing Presisi', desc: 'Setiap lekuk dan sudut diperhatikan dengan teliti, memastikan hasil yang sempurna tanpa cela.' }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1]"
            >
              <div className="absolute left-0 top-8 bottom-8 w-[2px] bg-gradient-to-b from-red-500 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-5 group-hover:bg-red-500/15 group-hover:scale-105 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process Timeline */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Proses Kami</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Cara Kerjanya</h2>
          <p className="text-gray-500 max-w-xl">Proses yang dirancang untuk kenyamanan Anda, dari reservasi hingga hasil yang memukau.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
          {[
            { step: '01', icon: <ClipboardList size={24} />, title: 'Konsultasi', desc: 'Diskusikan keinginan Anda dan dapatkan penawaran detail yang disesuaikan.' },
            { step: '02', icon: <Car size={24} />, title: 'Serah Terima', desc: 'Bawa kendaraan Anda ke fasilitas kami sesuai jadwal yang ditentukan.' },
            { step: '03', icon: <Wrench size={24} />, title: 'Pengerjaan', desc: 'Tim ahli kami bekerja dengan alat presisi dan material premium terbaik.' },
            { step: '04', icon: <CheckCircle size={24} />, title: 'Pengambilan', desc: 'Periksa dan ambil kendaraan Anda yang telah bertransformasi dengan indah.' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative group"
            >
              {idx < 3 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-[1px] bg-gradient-to-r from-white/[0.08] to-transparent" />
              )}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-red-500/40 text-2xl font-bold">{item.step}</span>
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Voucher Section - conditional on voucherEnabled */}
      {voucherEnabled && (
        <section className="max-w-5xl mx-auto px-6 w-full mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-[#0a0a0a] to-[#0a0a0a]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-red-500/5 rounded-full blur-[80px]" />

            <div className="relative z-10 p-10 md:p-16 border border-red-500/10 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold mb-5">
                    <Sparkles size={12} /> Penawaran Terbatas
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">Diskon Spesial untuk Cat Pertama Anda</h2>
                  <p className="text-gray-500 leading-relaxed">
                    Masukkan email Anda untuk mendapatkan voucher diskon eksklusif untuk layanan cat ulang pertama Anda.
                  </p>
                </div>

                <form onSubmit={handleClaimVoucher} className="flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email Anda"
                    className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={voucherStatus.type === 'loading'}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold transition-all disabled:opacity-50 hover:shadow-[0_0_25px_rgba(220,38,38,0.3)]"
                  >
                    {voucherStatus.type === 'loading' ? 'Memproses...' : 'Klaim Voucher Anda'}
                  </button>

                  {voucherStatus.type === 'error' && voucherStatus.message && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium p-3 rounded-lg text-center text-red-400 bg-red-500/10 border border-red-500/20"
                    >
                      {voucherStatus.message}
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Voucher Success Modal */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md text-center relative"
            >
              {/* Close button - only visible after copying */}
              {canClose && (
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}

              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Voucher Berhasil Diklaim!</h3>
              <p className="text-gray-400 mb-6">Anda mendapatkan diskon <span className="text-red-500 font-bold">{voucherDiscount}%</span></p>

              {/* Voucher Code Display */}
              <div className="bg-black/50 border border-red-500/30 rounded-xl p-5 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Kode Voucher Anda</p>
                <p className="text-3xl font-mono font-bold text-white tracking-widest">{voucherCode}</p>
              </div>

              {/* Copy Button */}
              <button
                onClick={copyToClipboard}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${copied
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
              >
                {copied ? (
                  <><Check size={18} /> Kode Berhasil Disalin!</>
                ) : (
                  <><Copy size={18} /> Salin Kode Voucher</>
                )}
              </button>

              {/* Warning */}
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                ⚠️ <strong>Penting:</strong> Simpan kode ini! Salin atau screenshot sebelum menutup. Kode ini hanya ditampilkan sekali dan digunakan saat pemesanan.
              </div>

              {!canClose && (
                <button
                  onClick={() => { setCanClose(true); }}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors underline"
                >
                  Saya Sudah Menyimpan Kode
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
