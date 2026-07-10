export const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const { id, name, price, quantity } = item;

  return (
    <div className="bg-white p-4 flex flex-col gap-2 border-b border-dashed border-neutral-100 last:border-0">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-body-md text-sm text-on-surface font-extrabold leading-tight max-w-[150px]">
          {name}
        </h4>
        {/* Quantity selector */}
        <div className="flex items-center border border-outline-variant rounded-full bg-white h-8 px-1 font-bold text-xs shrink-0 shadow-sm">
          <button 
            onClick={() => onQuantityChange(id, -1)}
            className="w-6 h-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors text-sm"
          >
            -
          </button>
          <span className="w-5 text-center font-extrabold">{quantity}</span>
          <button 
            onClick={() => onQuantityChange(id, 1)}
            className="w-6 h-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors text-sm"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <button 
          onClick={onRemove}
          className="font-label-sm text-[12px] text-tertiary underline hover:text-primary transition-colors font-bold"
        >
          Customise
        </button>
        <span className="font-body-md text-sm font-extrabold text-on-surface">
          ₹ {(price * quantity).toFixed(2)}/-
        </span>
      </div>
    </div>
  );
};
