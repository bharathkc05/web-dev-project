import { useState, useEffect } from 'react';
import { formatPrice } from '../../../utils/formatPrice';

export const ActivateProductModal = ({ masterProduct, existingData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    price: 0,
    isAvailable: true,
  });

  useEffect(() => {
    if (existingData) {
      setFormData({
        price: existingData.price,
        isAvailable: existingData.isAvailable ?? true,
      });
    } else if (masterProduct) {
      setFormData({
        price: masterProduct.basePrice || 0,
        isAvailable: true,
      });
    }
  }, [existingData, masterProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      price: Number(formData.price),
      isAvailable: formData.isAvailable,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">{existingData ? 'Edit Product Pricing' : 'Add to Menu'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          <div className="flex items-center gap-6 mb-8 p-6 bg-surface-container rounded-xl border border-neutral-200">
            <div className="w-20 h-20 rounded-lg bg-white overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
              {masterProduct.imageUrl ? (
                <img src={masterProduct.imageUrl} alt={masterProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400 uppercase">No Img</div>
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-black uppercase">{masterProduct.name}</h3>
              {!existingData && (
                <p className="text-xs font-bold text-orange mt-2 uppercase tracking-wider">Suggested Price: {formatPrice(masterProduct.basePrice)}</p>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Your Price (₹)</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-orange focus:ring-orange"
                />
                <span className="text-sm font-bold text-black/70 group-hover:text-black">Available to customers</span>
              </label>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex gap-4 mt-8">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg border border-neutral-200 text-black font-bold uppercase tracking-wide text-xs hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-orange hover:bg-[#d95a20] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-xs transition-colors shadow-sm flex justify-center items-center"
              >
                {existingData ? 'Save Changes' : 'Activate Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
