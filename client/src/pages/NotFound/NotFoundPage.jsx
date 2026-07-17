import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

export const NotFoundPage = ({ 
  title = 'Page Not Found', 
  message = "The page you're looking for doesn't exist or is currently under construction.",
  showPath = false 
}) => {
  const location = useLocation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-transparent">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface-container-lowest border-4 border-surface-container text-orange flex items-center justify-center mb-8 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-orange/10 animate-pulse"></div>
        <img src={logo} alt="Logo" className="w-20 h-20 md:w-40 md:h-40 object-contain drop-shadow-sm z-10" />
      </div>
      
      <h1 className="font-display text-4xl md:text-6xl font-black text-black uppercase tracking-tighter mb-4 drop-shadow-sm">
        {title}
      </h1>
      
      <p className="text-on-surface-variant font-medium max-w-lg mx-auto mb-2 text-sm md:text-base">
        {message}
      </p>
      
      {showPath && (
        <p className="text-xs text-on-surface-variant/70 font-mono bg-surface-container px-3 py-1 rounded-md mb-8 inline-block">
          {location.pathname}
        </p>
      )}

      <div className="mt-8">
        <Link 
          to="/" 
          className="bg-orange hover:bg-[#d95a20] text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-md transition-all hover:-translate-y-1 flex items-center justify-center gap-3 active:translate-y-0"
        >
          <i className="fas fa-home text-lg"></i> Return to Homepage
        </Link>
      </div>
    </div>
  );
};
