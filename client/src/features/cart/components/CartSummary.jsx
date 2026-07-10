import { useNavigate } from 'react-router-dom';

export const CartSummary = ({ subtotal }) => {
  const navigate = useNavigate();
  return (
    <div className="p-6 border-t border-dashed border-neutral-200 bg-white mt-auto">
      <div className="flex justify-between items-center mb-1">
        <span className="font-body-md text-sm text-on-surface font-extrabold">Subtotal</span>
        <span className="font-headline-lg text-base text-on-surface font-black">₹ {subtotal.toFixed(2)}/-</span>
      </div>
      <p className="font-label-sm text-[11px] text-on-surface-variant mb-6 font-bold">Extra charges may apply</p>
      <button 
        onClick={() => navigate('/cart')}
        className="w-full bg-[#502314] hover:bg-[#3d1a0e] text-white font-headline-lg text-base font-extrabold py-4 transition-colors tracking-widest uppercase"
      >
        CHECKOUT
      </button>
    </div>
  );
};
