import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md"
            >
                <div className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-4">
                    404
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">Halaman Tidak Ditemukan</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Halaman yang Anda cari tidak ada atau telah dipindahkan.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                    >
                        <Home size={16} /> Ke Beranda
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.04] border border-white/[0.06] text-white font-semibold rounded-xl hover:bg-white/[0.08] transition-all"
                    >
                        <ArrowLeft size={16} /> Kembali
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
