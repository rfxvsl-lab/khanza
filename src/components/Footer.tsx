import { useState, FormEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock, ArrowUp, Send, Shield, Award, CheckCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { site_name, logo_url, footer_text } = useSettings();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('success');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterStatus('idle'), 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-[#050505] border-t border-white/[0.04]">
      {/* Newsletter Bar */}
      <div className="border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Dapatkan Info Terbaru</h3>
              <p className="text-gray-500 text-sm">Terima promo eksklusif, update terbaru, dan tips otomotif langsung ke email Anda.</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full sm:flex-1 md:w-72 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {newsletterStatus === 'success' ? (
                  <><CheckCircle size={16} /> Berlangganan!</>
                ) : (
                  <><Send size={16} /> Langganan</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              {logo_url ? (
                <img src={logo_url} alt={site_name} className="h-16 w-auto object-contain" />
              ) : (
                <img src="https://res.cloudinary.com/dxklmdbjv/image/upload/v1772290124/khanzarepaint/pednxb9bzhikvyxa4x7i.png" alt={site_name} className="h-16 w-auto object-contain" />
              )}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              {footer_text}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Facebook size={18} />, label: 'Facebook' },
                { icon: <Instagram size={18} />, label: 'Instagram' },
                { icon: <Twitter size={18} />, label: 'Twitter' },
                { icon: <Youtube size={18} />, label: 'Youtube' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Tautan Cepat</h4>
            <ul className="space-y-3">
              {[
                { name: 'Layanan Kami', path: '/service' },
                { name: 'Buat Reservasi', path: '/booking' },
                { name: 'Lihat Galeri', path: '/garage' },
                { name: 'Testimoni', path: '/testimoni' },
                { name: 'FAQ', path: '/faq' },
              ].map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className="text-gray-500 hover:text-white text-sm transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-red-500 transition-colors" />
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Legal</h4>
            <ul className="space-y-3">
              {['Kebijakan Privasi', 'Syarat & Ketentuan', 'Kebijakan Refund', 'Kebijakan Cookie'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-red-500 transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-red-500/70 shrink-0 mt-0.5" />
                <span className="text-gray-500 text-sm leading-relaxed">Jl. Otomotif No. 123, Jakarta Selatan 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-red-500/70 shrink-0" />
                <a href="tel:+6281234567890" className="text-gray-500 hover:text-white text-sm transition-colors">+62 812-3456-7890</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-red-500/70 shrink-0" />
                <a href="mailto:hello@khanzarepaint.com" className="text-gray-500 hover:text-white text-sm transition-colors">hello@khanzarepaint.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-red-500/70 shrink-0 mt-0.5" />
                <div className="text-gray-500 text-sm leading-relaxed">
                  <p>Sen — Jum: 08.00 — 18.00</p>
                  <p>Sabtu: 09.00 — 16.00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: <Shield size={18} />, text: 'Garansi 5 Tahun' },
              { icon: <Award size={18} />, text: 'Teknisi Bersertifikat' },
              { icon: <CheckCircle size={18} />, text: 'Material Premium' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2.5 text-gray-600 text-xs font-medium uppercase tracking-wider">
                <span className="text-red-500/50">{badge.icon}</span>
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} {site_name}. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Privasi</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Ketentuan</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Peta Situs</a>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all"
              aria-label="Kembali ke atas"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
