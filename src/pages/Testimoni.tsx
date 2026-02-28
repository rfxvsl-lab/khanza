import { motion } from 'motion/react';
import { Star, Quote, Upload, Loader2, CheckCircle2, Camera } from 'lucide-react';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useSettings } from '../context/SettingsContext';
import type { Testimonial, Service } from '../types';
import Spinner from '../components/ui/Spinner';

export default function Testimoni() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { site_name } = useSettings();

  // Form state
  const [formData, setFormData] = useState({ name: '', review: '', rating: 5, service_ordered: '' });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchTestimonials();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (res.ok) setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (res.ok) setTestimonials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSubmitMessage('Ukuran foto maksimal 2MB');
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
        return;
      }
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('review', formData.review);
    fd.append('rating', String(formData.rating));
    fd.append('service_ordered', formData.service_ordered);
    if (profilePhoto) fd.append('profile_photo', profilePhoto);

    try {
      const res = await fetch('/api/testimonials/submit', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Testimoni berhasil dikirim! Menunggu persetujuan admin.');
        setFormData({ name: '', review: '', rating: 5, service_ordered: '' });
        setProfilePhoto(null);
        setPhotoPreview('');
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Gagal mengirim testimoni');
      }
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage('Terjadi kesalahan. Coba lagi.');
    }
  };

  const featured = testimonials[0];
  const rest = testimonials.slice(1);

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
          <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Kata Pelanggan</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Testimoni</span> Pelanggan
        </h1>
        <p className="text-gray-500 max-w-xl text-lg">
          Jangan hanya percaya kata kami. Dengarkan apa yang dikatakan pelanggan puas kami tentang pengalaman mereka bersama {site_name}.
        </p>
      </motion.div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : (
        <div className="space-y-6">
          {/* Featured Testimonial */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl bg-gradient-to-br from-red-950/20 via-white/[0.02] to-transparent border border-red-500/10 p-8 md:p-12"
            >
              <Quote className="absolute top-8 right-8 text-red-500/10 w-20 h-20" />

              <div className="flex gap-1 mb-6">
                {[...Array(featured.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-red-500 text-red-500" />
                ))}
              </div>

              <p className="text-white text-xl md:text-2xl leading-relaxed mb-8 max-w-3xl font-light italic">
                "{featured.review}"
              </p>

              <div className="flex items-center gap-4">
                {featured.profile_photo ? (
                  <img src={featured.profile_photo} alt={featured.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xl">
                    {featured.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-white font-bold text-lg">{featured.name}</h4>
                  {featured.service_ordered && (
                    <p className="text-red-500/70 text-sm">{featured.service_ordered}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <span className="text-gray-500 text-sm">Pelanggan Terverifikasi</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rest */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rest.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7 group hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500"
              >
                <Quote className="absolute top-6 right-6 text-white/[0.03] w-12 h-12 group-hover:text-red-500/10 transition-colors duration-500" />

                <div className="flex gap-1 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-red-500 text-red-500" />
                  ))}
                </div>

                <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                  "{testimonial.review}"
                </p>

                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.04]">
                  {testimonial.profile_photo ? (
                    <img src={testimonial.profile_photo} alt={testimonial.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-red-700/10 flex items-center justify-center text-red-500 font-bold text-sm border border-red-500/10">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
                    {testimonial.service_ordered ? (
                      <p className="text-gray-600 text-xs">{testimonial.service_ordered}</p>
                    ) : (
                      <p className="text-gray-600 text-xs">Pelanggan Terverifikasi</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* User Testimonial Submission Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-[2px] bg-red-500" />
          <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Bagikan Pengalaman Anda</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Tulis Testimoni</h2>

        {submitStatus === 'success' ? (
          <div className="bg-white/[0.02] border border-green-500/20 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Terima Kasih!</h3>
            <p className="text-gray-400 mb-6">{submitMessage}</p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium rounded-xl transition-all"
            >
              Tulis Testimoni Lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nama Anda *</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama"
                  className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all"
                />
              </div>

              {/* Service Ordered */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Layanan yang Dipesan *</label>
                <select
                  required
                  value={formData.service_ordered}
                  onChange={(e) => setFormData({ ...formData, service_ordered: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Pilih layanan</option>
                  {services.map(svc => (
                    <option key={svc.id} value={svc.title}>{svc.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Rating *</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={`transition-colors ${star <= (hoverRating || formData.rating)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Ulasan Anda *</label>
              <textarea
                required rows={4}
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                placeholder="Ceritakan pengalaman Anda..."
                className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Foto Profil (Maks 2MB)</label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => { setProfilePhoto(null); setPhotoPreview(''); }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-gray-400 cursor-pointer hover:border-red-500/30 transition-colors">
                    <Camera size={18} />
                    <span className="text-sm">Upload Foto</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {submitStatus === 'error' && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {submitMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 flex items-center gap-2 justify-center"
            >
              {submitStatus === 'loading' ? (
                <><Loader2 size={18} className="animate-spin" /> Mengirim...</>
              ) : (
                'Kirim Testimoni'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
