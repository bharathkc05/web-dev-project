import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { useCart } from '../hooks/useCart';

export const CartSidebar = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalCount } = useCart();

  return (
    <aside className="hidden lg:flex w-80 shrink-0 self-start sticky top-24 bg-white flex-col mb-8">
      {/* Cart Header */}
      <div className="p-6 border-b border-dashed border-neutral-200 bg-white flex justify-between items-end">
        <div>
          <h2 className="font-headline-xl text-xl text-on-surface font-extrabold tracking-tight">CART</h2>
          <p className="font-label-bold text-xs text-on-surface-variant mt-1 font-bold">
            {totalCount} {totalCount === 1 ? 'ITEM.' : 'ITEMS.'}
          </p>
        </div>
        {items.length > 0 && (
          <button 
            onClick={clearCart}
            className="text-tertiary font-label-bold text-xs hover:underline mb-1 font-bold"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Cart Items List */}
      <div className="p-6 flex flex-col gap-4 max-h-[350px] overflow-y-auto bg-white">
        {items.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-neutral-300">shopping_basket</span>
            <p className="font-bold text-sm">Your cart is empty</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={() => removeItem(item.id)}
            />
          ))
        )}
      </div>

      {/* Cart Footer / Summary */}
      {items.length > 0 && <CartSummary subtotal={subtotal} />}
      
      {/* Receipt zig-zag bottom edge decoration */}
      <div className="h-6 bg-white relative">
        <div 
          className="absolute left-0 right-0 bottom-0 h-6"
          style={{
            backgroundImage: 'linear-gradient(-45deg, #fcf9f8 12px, transparent 0), linear-gradient(45deg, #fcf9f8 12px, transparent 0)',
            backgroundSize: '24px 24px',
            backgroundPosition: 'left bottom'
          }}
        />
      </div>
    </aside>
  );
};
