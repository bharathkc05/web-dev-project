import { useCartStore } from '../../../store/cartStore';

export const ProductCard = ({ product, customAction, statusBadge }) => {
  const id = product.id || product._id;
  const image = product.image || product.imageUrl;
  const price = product.price || product.basePrice;
  const { name, isVeg, isNew, isSpicy, description } = product;
  
  const cartItem = useCartStore((state) => state.items.find(item => item.id === id));
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0px_4px_20px_rgba(80,45,22,0.06)] border border-neutral-100 flex flex-row md:flex-col relative hover:shadow-[0px_8px_24px_rgba(80,45,22,0.1)] transition-shadow duration-300 md:aspect-[4/5] overflow-hidden">
      
      {/* NEW Diagonal Corner Ribbon (top-left) */}
      {isNew && (
        <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden rounded-tl-xl pointer-events-none z-10">
          <div className="bg-[#f2a900] text-white text-[9px] font-black uppercase text-center py-1 absolute top-3 -left-5 w-20 -rotate-45 tracking-wider shadow-sm">
            NEW
          </div>
        </div>
      )}

      {/* Spicy Chili Icon (top-right) */}
      {isSpicy && (
        <div className="absolute top-3 right-3 text-xl z-10 drop-shadow-sm">
          🌶️
        </div>
      )}

      {/* Image Block: Flush with edges on desktop */}
      <div className="relative w-28 h-28 shrink-0 md:w-full md:h-auto md:aspect-video flex items-center justify-center bg-white md:bg-transparent overflow-hidden border-r border-neutral-50 md:border-none">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-on-surface-variant font-label-bold text-xs">[IMAGE]</span>
        )}
        {statusBadge && (
          <div className="absolute top-2 right-2 z-20">
            {statusBadge}
          </div>
        )}
      </div>

      {/* Content Block: flex flex-col to fill space with padding */}
      <div className="flex-1 flex flex-col justify-between p-3 lg:p-4">
        <div>
          {/* Title and Veg/Non-veg label */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-headline-lg text-sm md:text-base lg:text-lg text-on-surface font-black leading-snug line-clamp-2 break-words">
              {name}
            </h3>
            <span className={`inline-flex shrink-0 items-center justify-center border w-4 h-4 p-0.5 mt-0.5 ${isVeg ? 'border-green-600' : 'border-red-800'}`}>
              <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-800'}`} />
            </span>
          </div>

          <p className="font-body-sm text-[10px] md:text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price & Actions Row */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm md:text-base lg:text-lg font-black text-on-surface">
            ₹ {price}/-
          </span>
          
          {customAction ? (
            customAction
          ) : quantity > 0 ? (
            <div className="flex items-center border border-outline-variant rounded-full bg-white h-8 px-1 shadow-sm font-bold text-xs md:text-sm shrink-0">
              <button 
                onClick={() => updateQuantity(id, -1)} 
                className="w-7 md:w-8 text-on-surface-variant hover:text-primary transition-colors text-sm"
              >
                -
              </button>
              <span className="w-5 md:w-6 text-center text-on-surface text-xs font-extrabold">
                {quantity}
              </span>
              <button 
                onClick={() => updateQuantity(id, 1)} 
                className="w-7 md:w-8 text-on-surface-variant hover:text-primary transition-colors text-sm"
              >
                +
              </button>
            </div>
          ) : (
            <button 
              onClick={() => addItem(product)}
              className="bg-white text-[#502314] border border-[#502314] px-5 py-1 md:px-6 md:py-1.5 rounded-full font-extrabold text-xs hover:bg-[#502314] hover:text-white transition-colors duration-200 shadow-sm flex items-center gap-1 font-label uppercase"
            >
              <span>ADD</span>
              <span className="text-sm font-extrabold leading-none">+</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
