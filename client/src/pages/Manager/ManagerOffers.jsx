import { useState, useEffect } from 'react';
import { productService } from '../../features/products/services/product.service';

export const ManagerOffers = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    code: '',
    type: 'FLAT',
    value: '',
    minOrderValue: '0',
    expiryDate: '',
    usageLimit: '100',
  });

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getOffers();
      setOffers(data.data || []); // the backend wraps it in data since I used ApiResponse.ok
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      code: '',
      type: 'FLAT',
      value: '',
      minOrderValue: '0',
      expiryDate: '',
      usageLimit: '100',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await productService.createOffer({
        ...formData,
        value: Number(formData.value),
        minOrderValue: Number(formData.minOrderValue),
        usageLimit: Number(formData.usageLimit),
      });
      handleCloseModal();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      alert(error.message || 'Failed to save offer');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Coupon & Offer Management</h2>
        <button 
          onClick={handleOpenModal}
          className="bg-orange hover:bg-[#d95a20] text-white px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Create Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl shadow-sm border border-surface-container-high">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-tag text-2xl text-on-surface-variant"></i>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-1">No Active Offers</h3>
            <p className="text-sm text-on-surface-variant">You haven't created any promotional offers yet.</p>
          </div>
        ) : (
          offers.map((offer) => {
            const isExpired = new Date(offer.expiryDate) < new Date();
            const isExhausted = offer.usedCount >= offer.usageLimit;
            const isActive = !isExpired && !isExhausted;

            return (
              <div key={offer._id} className={`relative bg-white rounded-2xl shadow-sm border border-surface-container-high overflow-hidden transition-all ${isActive ? 'hover:shadow-md hover:border-primary/30' : 'opacity-75'}`}>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-green-100 text-green-800' : 
                    isExpired ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {isActive ? 'Active' : isExpired ? 'Expired' : 'Exhausted'}
                  </span>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Coupon Code</p>
                    <h3 className="text-2xl font-black text-primary tracking-wider">{offer.code}</h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant font-medium">Discount</span>
                      <span className="font-bold text-on-surface">
                        {offer.type === 'PERCENT' ? `${offer.value}% OFF` : 
                         offer.type === 'FLAT' ? `$${offer.value.toFixed(2)} OFF` : 
                         'Buy 1 Get 1 Free'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant font-medium">Min Order</span>
                      <span className="font-bold text-on-surface">${offer.minOrderValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant font-medium">Usage</span>
                      <span className="font-bold text-on-surface">{offer.usedCount} / {offer.usageLimit}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Usage Limit</span>
                      <span className="font-bold text-on-surface">{Math.round((offer.usedCount / offer.usageLimit) * 100)}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${isExhausted ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${Math.min((offer.usedCount / offer.usageLimit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest px-6 py-3 border-t border-surface-container-high text-xs text-on-surface-variant font-medium flex items-center justify-between">
                  <span>Expires: {new Date(offer.expiryDate).toLocaleDateString()}</span>
                  {offer.maxDiscount && offer.type === 'PERCENT' && (
                    <span>Max: ${offer.maxDiscount}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">Create Promotional Offer</h3>
              <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Coupon Code</label>
                  <input type="text" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold uppercase tracking-wider" placeholder="e.g. SAVE20" />
                  <p className="text-xs text-on-surface-variant mt-2 font-bold">Codes must be unique per outlet.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Discount Type</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold">
                      <option value="FLAT">Flat Amount ($)</option>
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="BOGO">Buy 1 Get 1 Free</option>
                    </select>
                  </div>
                  {formData.type !== 'BOGO' && (
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Discount Value</label>
                      <input type="number" step="0.01" required value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder={formData.type === 'PERCENT' ? '20' : '5.00'} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Min Order Value ($)</label>
                    <input type="number" step="0.01" required value={formData.minOrderValue} onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Total Usage Limit</label>
                    <input type="number" required value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder="100" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Expiry Date</label>
                  <input type="date" required value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" />
                </div>
                
                <div className="pt-6 border-t border-neutral-100 flex gap-4 mt-8">
                  <button type="button" onClick={handleCloseModal} className="flex-1 px-6 py-3 rounded-lg border border-neutral-200 text-black font-bold uppercase tracking-wide text-xs hover:bg-neutral-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-orange hover:bg-[#d95a20] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-xs transition-colors shadow-sm flex justify-center items-center">
                    Create Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
