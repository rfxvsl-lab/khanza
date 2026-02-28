import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Car, ArrowRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';

const links = [
  { name: 'Beranda', path: '/' },
  { name: 'Layanan', path: '/service' },
  { name: 'Reservasi', path: '/booking' },
  { name: 'Galeri', path: '/garage' },
  { name: 'Testimoni', path: '/testimoni' },
  { name: 'FAQ', path: '/faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { site_name, logo_url } = useSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={twMerge(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-black/60 backdrop-blur-2xl border-b border-white/[0.06] py-3'
            : 'bg-transparent py-5'
        )}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group relative">
            {logo_url ? (
              <img src={logo_url} alt={site_name} className="h-20 w-auto object-contain" />
            ) : (
              <img src="https://res.cloudinary.com/dxklmdbjv/image/upload/v1772290124/khanzarepaint/pednxb9bzhikvyxa4x7i.png" alt={site_name} className="h-20 w-auto object-contain" />
            )}
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className="relative px-4 py-2 text-sm font-medium transition-colors group"
                >
                  <span className={twMerge(
                    'relative z-10 transition-colors duration-300',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}>
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 rounded-lg bg-white/[0.06]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-dot"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/booking"
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Reservasi <ArrowRight size={14} />
            </NavLink>

            <button
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#0a0a0a] border-l border-white/[0.06] z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-lg font-bold text-white">{site_name}</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
                  aria-label="Tutup menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <NavLink
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        twMerge(
                          'flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all',
                          isActive
                            ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )
                      }
                    >
                      {link.name}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="p-4 border-t border-white/[0.06]">
                <NavLink
                  to="/booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl"
                >
                  Buat Reservasi <ArrowRight size={16} />
                </NavLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
