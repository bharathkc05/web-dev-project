import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../../../utils/api';
import hero1 from '../../../assets/hero1.jpg';
import hero2 from '../../../assets/hero2.jpg';
import hero3 from '../../../assets/hero3.jpg';
import logo from '../../../assets/logo.png';

const slides = [hero1, hero2, hero3];

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get('/banners');
        const res = response.data;
        if (res.data?.length > 0) {
          setBanners(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch banners', err);
      }
    };
    fetchBanners();
  }, []);

  const activeSlides = banners.length > 0 ? banners.map(b => b.imageUrl) : slides;
  
  // Custom title handling if banners have title
  const currentTitle = banners.length > 0 ? banners[currentSlide]?.title : null;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  return (
    <section className="relative w-full overflow-hidden bg-brown text-white h-[300px] md:h-[450px] lg:h-[550px]">
      {/* Slides */}
      <div 
        className="absolute inset-0 w-full h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeSlides.map((slide, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 relative bg-black">
            <img src={slide} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
        ))}
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 flex flex-col items-start space-y-4 text-left p-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none text-[#f6eddf] drop-shadow-lg">
              {currentTitle ? (
                <span>{currentTitle}</span>
              ) : (
                <>
                  Flame-Grilled <br />
                  <span className="text-orange">Perfection</span>
                </>
              )}
            </h1>
            <p className="text-sm md:text-base text-white font-medium drop-shadow-md max-w-md">
              {currentTitle ? 'Experience our latest deals and fresh ingredients prepared just for you.' : 'Experience the legendary Whopper, made with 100% flame-grilled patties and freshly cut veggies.'}
            </p>
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors uppercase tracking-wide">
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar / Indicators */}
      <div className="absolute bottom-0 w-full bg-black/40 text-xs py-2 px-4 flex justify-between items-center backdrop-blur-sm z-20">
        <span>*T&amp;C APPLY</span>
        <div className="flex items-center space-x-2">
          {activeSlides.map((_, idx) => (
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
          <img src={logo} alt="BK Logo" className="w-6 h-6 object-contain" />
        </div>
      </div>
    </section>
  );
};
