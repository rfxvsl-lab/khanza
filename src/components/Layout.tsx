import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './Navbar';
import Footer from './Footer';
import MouseGlow from './MouseGlow';
import FloatingBlobs from './FloatingBlobs';
import ErrorBoundary from './ErrorBoundary';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 selection:text-red-200 overflow-x-hidden">
      <MouseGlow />
      <FloatingBlobs />
      <Navbar />
      <ErrorBoundary>
        <main className="relative z-10 pt-24 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
