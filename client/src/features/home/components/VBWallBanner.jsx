import logo from '../../../assets/logo.png';

export const VBWallBanner = () => {
  return (
    <section className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 mb-12">
      <div
        className="w-full bg-[#6a3521] rounded-2xl overflow-hidden relative shadow-lg min-h-[200px] md:min-h-[300px] flex items-center justify-center border-4 border-transparent p-4 cursor-pointer hover:shadow-xl transition-shadow"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.1) 20px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,0,0,0.1) 40px)',
          backgroundSize: '40px 20px'
        }}
      >
        <div className="placeholder-box w-full max-w-4xl h-40 md:h-64 bg-transparent border-none text-white text-2xl md:text-5xl font-black uppercase tracking-tighter flex items-center justify-center gap-8 drop-shadow-xl">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#f6eddf] text-orange flex items-center justify-center text-sm md:text-xl shrink-0 p-6 shadow-inner">
            <img src={logo} alt="BK Logo Round" className="w-full h-full object-contain" />
          </div>
          <div className="text-left leading-none text-[#f6eddf]">
            EXPLORE THE<br />VB WALL
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-on-surface-variant mt-4 font-medium">
        <strong>Disclaimer :</strong> All images used are illustrative and strictly for representational purposes only
      </p>
    </section>
  );
};
