import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, MessageCircle, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import type { FaqItem } from '../types';
import Spinner from '../components/ui/Spinner';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
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
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Pusat Bantuan</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          Pertanyaan yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Sering Ditanyakan</span>
        </h1>
        <p className="text-gray-500 max-w-xl text-lg">
          Temukan jawaban untuk pertanyaan umum seputar layanan, proses, dan harga kami.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ List */}
        <div className="lg:col-span-2">
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/40 transition-colors"
            />
          </div>

          {loading ? (
            <Spinner size="lg" className="py-20" />
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <Search size={20} className="text-gray-600" />
              </div>
              <p className="text-gray-500">Tidak ada pertanyaan yang cocok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={clsx(
                    "border rounded-xl overflow-hidden transition-all duration-300",
                    openIndex === idx
                      ? "bg-white/[0.03] border-red-500/15"
                      : "bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.02]"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <span className={clsx(
                        "text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        openIndex === idx ? "bg-red-500/20 text-red-500" : "bg-white/[0.04] text-gray-600"
                      )}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-white text-sm font-medium">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={clsx(
                        "text-gray-500 transition-transform duration-300 shrink-0 ml-4",
                        openIndex === idx ? "rotate-180 text-red-500" : ""
                      )}
                      size={18}
                    />
                  </button>

                  <AnimatePresence>
                    {openIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pl-[4.25rem] text-gray-400 text-sm leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-950/20 to-transparent border border-red-500/10 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <MessageCircle size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Masih ada pertanyaan?</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Tidak menemukan jawaban yang Anda cari? Hubungi tim kami langsung.
            </p>
            <div className="space-y-3">
              <a href="tel:+6281234567890" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                <Phone size={14} className="text-red-500/70" />
                +62 812-3456-7890
              </a>
              <a href="mailto:hello@khanzarepaint.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                <Mail size={14} className="text-red-500/70" />
                hello@khanzarepaint.com
              </a>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Topik Populer</h3>
            <div className="flex flex-wrap gap-2">
              {['Harga', 'Garansi', 'Proses', 'Durasi', 'Material', 'Reservasi'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-500 text-xs font-medium hover:text-white hover:border-white/[0.1] transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
