import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import logo from '../../../assets/logo.png';

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get('/banners');
        const res = response.data;
        if (res.data?.length > 0) {
          setBanners(res.data);
        }
      } catch (err) {
        // silently fail — empty state will render
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length > 0 && currentSlide === banners.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 700); // matches the duration-700 in CSS
      return () => clearTimeout(timer);
    }
  }, [currentSlide, banners.length]);

  useEffect(() => {
    if (!isTransitioning && currentSlide === 0) {
      const timer = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentSlide]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-neutral-900 aspect-[16/9] md:aspect-[24/5] flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-4 text-white/30">
          <img src={logo} alt="Velvet Bites" className="w-16 h-16 object-contain opacity-30" />
          <span className="text-sm tracking-widest uppercase">Loading offers…</span>
        </div>
      </section>
    );
  }

  // ── No banners from server ─────────────────────────────────────────────────
  if (banners.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-neutral-900 aspect-[16/9] md:aspect-[24/5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <img src={logo} alt="Velvet Bites" className="w-20 h-20 object-contain opacity-40" />
          <p className="text-sm tracking-widest uppercase">No active offers right now</p>
        </div>
      </section>
    );
  }

  const extendedBanners = banners.length > 0 ? [...banners, banners[0]] : [];

  // ── Banners from server ────────────────────────────────────────────────────
  return (
    <section className="relative w-full overflow-hidden bg-brown text-white aspect-[16/9] md:aspect-[24/5]">
      {/* Slides */}
      <div
        className={`absolute inset-0 w-full h-full flex ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {extendedBanners.map((banner, idx) => (
          <div key={`${banner._id ?? idx}-${idx}`} className="w-full h-full flex-shrink-0 relative bg-black">
            <img
              src={banner.imageUrl}
              alt={banner.title ?? `Banner ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Bottom bar / dot indicators */}
      <div className="absolute bottom-0 w-full bg-black/40 text-xs py-2 px-4 flex justify-between items-center backdrop-blur-sm z-20">
        <span>*T&amp;C APPLY</span>
        <div className="flex items-center space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsTransitioning(true);
                setCurrentSlide(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                (currentSlide === idx || (currentSlide === banners.length && idx === 0)) ? 'w-6 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center font-bold">
          <span className="mr-2">Limited Time Only</span>
          <img src={logo} alt="Velvet Bites Logo" className="w-6 h-6 object-contain" />
        </div>
      </div>
    </section>
  );
};
