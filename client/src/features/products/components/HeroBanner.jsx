import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import logo from '../../../assets/logo.png';

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
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
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-neutral-900 h-[300px] md:h-[450px] lg:h-[550px] flex items-center justify-center animate-pulse">
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
      <section className="relative w-full overflow-hidden bg-neutral-900 h-[300px] md:h-[450px] lg:h-[550px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <img src={logo} alt="Velvet Bites" className="w-20 h-20 object-contain opacity-40" />
          <p className="text-sm tracking-widest uppercase">No active offers right now</p>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentSlide];

  // ── Banners from server ────────────────────────────────────────────────────
  return (
    <section className="relative w-full overflow-hidden bg-brown text-white h-[300px] md:h-[450px] lg:h-[550px]">
      {/* Slides */}
      <div
        className="absolute inset-0 w-full h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner, idx) => (
          <div key={banner._id ?? idx} className="w-full h-full flex-shrink-0 relative bg-black">
            <img
              src={banner.imageUrl}
              alt={banner.title ?? `Banner ${idx + 1}`}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
        ))}
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 flex flex-col items-start space-y-4 text-left p-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none text-[#f6eddf] drop-shadow-lg">
              {currentBanner.title ? (
                <span>{currentBanner.title}</span>
              ) : (
                <>
                  Flame-Grilled <br />
                  <span className="text-orange">Perfection</span>
                </>
              )}
            </h1>
            <p className="text-sm md:text-base text-white font-medium drop-shadow-md max-w-md">
              {currentBanner.subtitle ?? 'Experience our latest deals and fresh ingredients prepared just for you.'}
            </p>
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors uppercase tracking-wide">
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar / dot indicators */}
      <div className="absolute bottom-0 w-full bg-black/40 text-xs py-2 px-4 flex justify-between items-center backdrop-blur-sm z-20">
        <span>*T&amp;C APPLY</span>
        <div className="flex items-center space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/50'
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
