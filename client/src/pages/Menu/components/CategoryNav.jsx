import { useRef } from 'react';
import { CategoryItem } from '../../../features/products/components/CategoryItem';

export const CategoryNav = ({ categories, activeCategory, onCategoryChange }) => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="product-page__menu w-full mb-8 z-30 py-4">
      {/* Breadcrumbs */}
      <div className="text-[10px] md:text-xs text-on-surface-variant font-bold uppercase mb-4 tracking-wider px-2">
        Home
        <span className="mx-2 material-symbols-outlined text-[14px]">&gt;</span>
        <span className="text-on-surface font-extrabold">MENU</span>
      </div>

      <div className="menu-tabs flex items-start gap-2 md:gap-4 w-full">
        {/* Left Arrow */}
        <button
          onClick={() => handleScroll('left')}
          className="w-8 h-8 md:w-10 md:h-10 bg-white shadow-md rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none border border-neutral-100 mt-6 md:mt-7 shrink-0 cursor-pointer"
        >
          <i className="fa-solid fa-chevron-left text-xs md:text-sm"></i>
        </button>

        {/* Categories container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-4 flex-1 scroll-smooth border-b-2 border-[#502314] pb-0"
        >
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              name={category.name}
              image={category.image}
              isActive={category.id === activeCategory}
              onClick={() => onCategoryChange(category.id)}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => handleScroll('right')}
          className="w-8 h-8 md:w-10 md:h-10 bg-white shadow-md rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none border border-neutral-100 mt-6 md:mt-7 shrink-0 cursor-pointer"
        >
          <i className="fa-solid fa-chevron-right text-xs md:text-sm"></i>
        </button>
      </div>
    </div>
  );
};
