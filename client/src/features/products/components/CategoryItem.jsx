export const CategoryItem = ({ name, image, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`menu-tabs__item_wrapper u_cursor_pointer shrink-0 border-b-4 -mb-[2px] transition-all duration-150 z-10 ${
        isActive ? 'border-primary' : 'border-transparent'
      }`}
    >
      <div 
        role="presentation"
        className={`u_list_style_none menu-tabs__item flex flex-col items-center w-24 md:w-28 gap-2 focus:outline-none cursor-pointer group pt-2 pb-2 ${
          isActive ? 'menu-tabs__item_active menu-tabs__name-active' : ''
        }`}
      >
        <div className={`menu-tabs__image w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-neutral-100 group-hover:shadow-md transition-all duration-200 ${
          isActive ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}>
          {image ? (
            <img src={image} alt={name} className="menu-tabs__img w-full h-full object-contain p-2" />
          ) : (
            <div className="w-full h-full bg-neutral-200" />
          )}
        </div>
        <p className={`menu-tabs__name menu-tabs__name-ellipsis font-label-sm text-[10px] md:text-[11px] text-center uppercase font-bold tracking-tight mt-1 leading-tight max-w-[90px] md:max-w-[110px] break-words transition-colors ${
          isActive 
            ? 'text-primary font-extrabold' 
            : 'text-on-surface-variant group-hover:text-primary'
        }`}>
          {name}
        </p>
      </div>
    </div>
  );
};
