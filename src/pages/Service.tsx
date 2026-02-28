import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Service as ServiceType } from '../types';
import Spinner from '../components/ui/Spinner';

const DynamicIcon = ({ name }: { name: string }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name] || LucideIcons.Sparkles;
  return <IconComponent size={32} className="text-red-500" />;
};

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

export default function Service() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (res.ok) setServices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-[2px] bg-red-500" />
          <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Yang Kami Tawarkan</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Layanan</span> Kami
        </h1>
        <p className="text-gray-500 max-w-xl text-lg">
          Temukan rangkaian layanan finishing otomotif premium kami. Setiap kendaraan kami perlakukan sebagai mahakarya.
        </p>
      </motion.div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-500"
            >
              {idx === 0 && (
                <div className="absolute top- right- z-0 px- py- rounded-full bg-red-00/0 border border-red-00/0 text-red-00 text-xs font-semibold">

                </div>
              )}

              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/15 group-hover:scale-105 transition-all duration-300">
                    <DynamicIcon name={service.icon_name} />
                  </div>
                  <span className="text-2xl font-bold text-white">{formatRupiah(service.price)}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors duration-300">{service.title}</h3>
                <p className="text-gray-500 mb-6 leading-relaxed text-sm">{service.description}</p>

                <ul className="space-y-2 mb-8">
                  {['Material premium termasuk', 'Teknisi khusus', 'Kualitas terjamin'].map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-gray-400 text-sm">
                      <LucideIcons.Check size={14} className="text-red-500/70 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/booking?service=${service.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-red-600 hover:border-red-600 text-white font-semibold text-sm transition-all duration-300 group-hover:bg-red-600 group-hover:border-red-600"
                >
                  Pesan Layanan Ini <LucideIcons.ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
