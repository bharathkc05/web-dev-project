export const CarouselButton = ({ direction, onClick, className }) => {
  const isLeft = direction === 'left';
  return (
    <button
      onClick={onClick}
      className={`hidden md:flex absolute z-10 w-10 h-10 bg-white shadow-md rounded-full items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors focus:outline-none ${
        isLeft ? 'left-0 -translate-y-1/2 top-[72px]' : 'right-0 -translate-y-1/2 top-[72px]'
      } ${className || ''}`}
    >
      <i className={`fas fa-chevron-${isLeft ? 'left' : 'right'}`}></i>
    </button>
  );
};
