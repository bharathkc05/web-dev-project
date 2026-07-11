import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../features/cart/hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { useOutletStore } from '../../store/outletStore';
import { authService } from '../../features/auth/services/auth.service';
import { useAuthStore } from '../../store/authStore';

const CartPage = () => {
  const { items, updateQuantity, clearCart, subtotal } = useCart();
  const { isAuthenticated, user, token, refreshToken } = useAuth();
  const { setAuth } = useAuthStore();
  const { openAuthModal, orderMode } = useUIStore();
  const { selectedOutlet } = useOutletStore();

  const [orderType, setOrderType] = useState('takeaway'); // 'restaurant' or 'takeaway'
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', zipCode: '' });

  // Load addresses if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.savedAddresses) {
      setAddresses(user.savedAddresses);
      const defaultAddr = user.savedAddresses.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      else if (user.savedAddresses.length > 0) setSelectedAddressId(user.savedAddresses[0]._id);
    }
  }, [isAuthenticated, user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const updatedAddresses = await authService.addAddress(newAddress);
      setAddresses(updatedAddresses);
      setAuth({ ...user, savedAddresses: updatedAddresses }, token, refreshToken);
      setIsAddingAddress(false);
      setNewAddress({ label: '', street: '', city: '', state: '', zipCode: '' });
      setSelectedAddressId(updatedAddresses[updatedAddresses.length - 1]._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add address');
    }
  };
  
  // Sync orderType if global orderMode is delivery
  useEffect(() => {
    if (orderMode === 'delivery') {
      setOrderType('delivery');
    } else if (orderType === 'delivery') {
      setOrderType('takeaway'); // Default to takeaway if switching back from delivery
    }
  }, [orderMode]);

  const [donateCharity, setDonateCharity] = useState(false);

  // Calculate totals
  const tax = subtotal * 0.05; // 5% tax mock
  const discount = 0; // Hook up to offers if needed
  const charityAmount = donateCharity ? 2 : 0;
  const totalPayable = subtotal + tax - discount + charityAmount;

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      <div 
        className="mx-auto select-none outline-none"
        style={{ 
          width: '85%', 
          margin: '0 auto', 
          padding: '2rem 0px',
          fontSize: '62.5%', 
          boxSizing: 'inherit',
          WebkitTapHighlightColor: 'transparent',
          '--closeImage': 'url(https://cdn.yellowmessenger.com/files/images/close.png)'
        }}
      >
        
        {/* Breadcrumb */}
        <div className="mb-10 flex items-center text-xs font-bold text-on-surface-variant tracking-wider uppercase">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2 material-symbols-outlined text-[14px]">&gt;</span>
          <span className="text-on-surface font-black">CART</span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-neutral-100 flex flex-col items-center">
            <h2 className="font-headline-xl text-2xl font-black mb-2">Your cart is empty</h2>
            <p className="text-on-surface-variant mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-orange transition-colors shadow-md">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Panel */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Order Type Section */}
              {orderMode !== 'delivery' && (
                <div className="mb-8">
                  <h3 className="font-headline-lg text-[22px] font-black text-on-surface mb-4 uppercase">What is your Order Type</h3>
                  <div className="flex bg-white rounded-full p-1 border border-neutral-200 inline-flex shadow-sm">
                    <button 
                      onClick={() => setOrderType('restaurant')}
                      className={`px-8 py-2.5 rounded-full text-[13px] font-extrabold uppercase tracking-wide transition-all ${
                        orderType === 'restaurant' 
                          ? 'bg-[#703b29] text-white shadow-md' 
                          : 'text-neutral-400 hover:text-on-surface'
                      }`}
                    >
                      Restaurant
                    </button>
                    <button 
                      onClick={() => setOrderType('takeaway')}
                      className={`px-8 py-2.5 rounded-full text-[13px] font-extrabold uppercase tracking-wide transition-all ${
                        orderType === 'takeaway' 
                          ? 'bg-[#703b29] text-white shadow-md' 
                          : 'text-neutral-400 hover:text-on-surface'
                      }`}
                    >
                      Takeaway
                    </button>
                  </div>
                </div>
              )}

              {/* Personal Details Section */}
              {!isAuthenticated && (
                <div className="mb-8">
                  <h3 className="font-headline-lg text-[22px] font-black text-on-surface mb-4 uppercase">Personal Details</h3>
                  <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-on-surface font-extrabold text-[15px] uppercase tracking-wider mb-4 sm:mb-0">
                      To place your order now, log in to your account.
                    </p>
                    <button 
                      onClick={() => openAuthModal('login')}
                      className="bg-[#703b29] hover:bg-[#5a2e20] text-white px-8 py-3.5 rounded-full font-extrabold text-sm uppercase tracking-wider shadow-sm transition-colors w-full sm:w-auto"
                    >
                      Login to Place Order
                    </button>
                  </div>
                </div>
              )}

              {/* Location Details (Restaurant vs Address) */}
              {orderMode === 'delivery' ? (
                <div className="mb-8">
                  <h3 className="font-headline-lg text-[22px] font-black text-on-surface mb-4 uppercase">Delivery Address</h3>
                  <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-neutral-100">
                    <div className="flex flex-col gap-4 w-full">
                      {!isAuthenticated ? (
                        <p className="text-[15px] font-bold text-on-surface">Please log in to manage your addresses.</p>
                      ) : addresses.length === 0 && !isAddingAddress ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-on-surface-variant mb-4">You have no saved delivery addresses.</p>
                          <button onClick={() => setIsAddingAddress(true)} className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm">Add New Address</button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Address List */}
                          {!isAddingAddress && addresses.map(addr => (
                            <div 
                              key={addr._id} 
                              onClick={() => setSelectedAddressId(addr._id)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-on-surface uppercase text-xs tracking-wider">{addr.label}</span>
                                {selectedAddressId === addr._id && <i className="fas fa-check-circle text-primary text-lg"></i>}
                              </div>
                              <p className="text-sm text-on-surface-variant">{addr.street}</p>
                              <p className="text-sm text-on-surface-variant">{addr.city}, {addr.state} {addr.zipCode}</p>
                            </div>
                          ))}

                          {/* Add Address Button */}
                          {!isAddingAddress && addresses.length < 2 && (
                            <button onClick={() => setIsAddingAddress(true)} className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 font-bold hover:border-primary hover:text-primary transition-colors text-sm flex items-center justify-center">
                              <i className="fas fa-plus mr-2"></i> Add Another Address
                            </button>
                          )}
                          {!isAddingAddress && addresses.length >= 2 && (
                            <p className="text-xs text-neutral-400 text-center">You have reached the maximum of 2 saved addresses.</p>
                          )}

                          {/* Add Address Form */}
                          {isAddingAddress && (
                            <form onSubmit={handleAddAddress} className="bg-surface-container p-5 rounded-xl space-y-4">
                              <h4 className="font-bold text-on-surface">Add New Address</h4>
                              <div className="grid grid-cols-1 gap-3">
                                <input required type="text" placeholder="Label (e.g. Home, Work)" className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} />
                                <input required type="text" placeholder="Street Address" className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                                <div className="grid grid-cols-2 gap-3">
                                  <input required type="text" placeholder="City" className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                  <input required type="text" placeholder="State" className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                                </div>
                                <input required type="text" placeholder="Zip Code (6 digits)" pattern="\d{6}" className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} />
                              </div>
                              <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 px-4 py-2 rounded-lg font-bold text-sm text-neutral-500 hover:bg-neutral-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">Save Address</button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h3 className="font-headline-lg text-[22px] font-black text-on-surface mb-4 uppercase">Restaurant</h3>
                  <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-neutral-100">
                    <div className="shrink-0 mt-0.5">
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wide">Restaurant</p>
                      <p className="text-[15px] font-bold text-on-surface leading-snug">
                        {selectedOutlet ? (selectedOutlet.address || 'Address not available') : 'No outlet selected. Please select a restaurant to continue.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Place Order (Development Mock) */}
              <div className="mb-8">
                <button
                  onClick={async () => {
                    if (!isAuthenticated) {
                      openAuthModal('login');
                      return;
                    }
                    if (!selectedOutlet) {
                      alert('Please select an outlet first.');
                      return;
                    }
                    if (items.length === 0) {
                      alert('Your cart is empty! Please add some items before placing an order.');
                      return;
                    }
                    
                    let finalAddress = null;
                    if (orderMode === 'delivery') {
                      if (!selectedAddressId) {
                        alert('Please select a delivery address or add a new one.');
                        return;
                      }
                      const addr = addresses.find(a => a._id === selectedAddressId);
                      if (addr) {
                        finalAddress = {
                          street: addr.street,
                          city: addr.city,
                          state: addr.state,
                          pincode: addr.zipCode || '000000'
                        };
                      }
                    } else {
                      finalAddress = {
                        street: selectedOutlet.address || 'Takeaway/Dine-In',
                        city: 'Store',
                        state: 'Location',
                        pincode: '000000'
                      };
                    }

                    try {
                      // Import API dynamically or use fetch if api isn't imported
                      // Assuming fetch works if we don't have api at top level
                      const { api } = await import('../../utils/api');
                      
                      // Bypass backend Cart logic by passing items directly to the order endpoint
                      const payload = {
                        address: finalAddress,
                        paymentMode: 'COD',
                        instructions: orderMode === 'delivery' ? 'Deliver to door' : 'Self pickup/Dine-in',
                        mockItems: items.map(item => ({
                          productId: item.id || item._id,
                          qty: item.quantity,
                          outletId: selectedOutlet._id
                        }))
                      };
                      
                      const res = await api.post('/orders', payload);
                      alert('Order placed successfully! Order ID: ' + res.data.data._id);
                      clearCart();
                    } catch (error) {
                      console.error(error);
                      alert(error.response?.data?.message || 'Failed to place order');
                    }
                  }}
                  className="w-full bg-white hover:bg-neutral-50 transition-colors rounded-xl shadow-sm border border-neutral-100 p-6 flex justify-center cursor-pointer"
                >
                  <h3 className="font-headline-lg text-2xl font-black text-[#703b29] uppercase tracking-widest py-1">Place Order</h3>
                </button>
              </div>

            </div>

            {/* Right Panel - Cart Summary */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <h3 className="font-headline-lg text-[26px] font-black text-on-surface mb-4 uppercase tracking-wide">Your Cart</h3>
              
              <div className="bg-white shadow-sm flex flex-col p-6 rounded-sm">
                
                {/* Cart Items List */}
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 pb-6 border-b border-neutral-100 last:border-0 last:pb-0">
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col flex-1">
                          <p className="font-black text-[15px] text-on-surface leading-snug mb-1">{item.name}</p>
                          <p className="text-[12px] text-on-surface-variant font-semibold mb-2 line-clamp-2">
                            {item.description || 'Medium Fry + Large Coca-Cola + ' + item.name}
                          </p>

                        </div>
                        
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="flex items-center border border-[#703b29] rounded-full h-8 px-2 font-bold text-sm text-[#703b29]">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-full flex items-center justify-center transition-colors text-lg"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-black">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-full flex items-center justify-center transition-colors text-lg"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-black text-[15px] text-on-surface mt-1">
                            ₹{(item.price * item.quantity).toFixed(2)}/-
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                <div className="relative mt-2">
                  <input 
                    type="text" 
                    placeholder="Special Instructions for your meal (optional)..."
                    className="w-full bg-[#f6f6f6] text-[13px] font-bold text-on-surface-variant rounded-md py-3 pl-10 pr-4 focus:outline-none"
                  />
                </div>

                {/* Charity Wrapper */}
                <div className="flex justify-between items-start gap-4 mt-8">
                  <label className="flex items-start gap-3 cursor-pointer group flex-1">
                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={donateCharity}
                        onChange={(e) => setDonateCharity(e.target.checked)}
                      />
                      <div className="w-4 h-4 border-2 border-[#703b29] rounded-sm bg-white peer-checked:bg-[#703b29] peer-checked:border-[#703b29] transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[12px] opacity-0 peer-checked:opacity-100 font-bold">
                          check
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-on-surface leading-snug">
                        (Optional) Donate Re. 2 towards education of an underprivileged girl
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 font-bold">
                        In association with <span className="text-blue-700 underline font-bold">Room to Read</span>
                      </p>
                    </div>
                  </label>
                  <span className="font-black text-[15px] text-on-surface shrink-0">₹2</span>
                </div>

                <div className="w-full h-px bg-neutral-200 my-4"></div>

                {/* Order Payment Summary */}
                <ul className="flex flex-col gap-3">
                  <li className="flex justify-between items-center text-[13px]">
                    <span className="text-on-surface-variant font-bold">Order Total</span>
                    <span className="text-on-surface font-extrabold text-[14px]">₹{subtotal.toFixed(2)}</span>
                  </li>
                  {discount > 0 && (
                    <li className="flex justify-between items-center text-[13px]">
                      <span className="text-on-surface-variant font-bold">Discount</span>
                      <span className="text-green-600 font-extrabold text-[14px]">- ₹{discount.toFixed(2)}</span>
                    </li>
                  )}
                  <li className="flex justify-between items-center text-[13px]">
                    <span className="text-on-surface-variant font-bold flex items-center gap-1">
                      Taxes and Charges
                      <span className="material-symbols-outlined text-[14px] text-neutral-300">info</span>
                    </span>
                    <span className="text-on-surface font-extrabold text-[14px]">₹{tax.toFixed(2)}</span>
                  </li>
                </ul>
                
                <div className="w-full h-px bg-neutral-200 mt-4 mb-4"></div>
                
                <div className="flex justify-between items-center pb-2">
                  <p className="font-black text-on-surface uppercase tracking-wider text-[15px]">TOTAL PAYABLE</p>
                  <p className="font-black text-lg text-on-surface">₹{totalPayable.toFixed(2)}</p>
                </div>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
