import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/user.service';

export const CustomerAddressesPage = () => {
  const { user, token, refreshToken } = useAuth();
  const { setAuth } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', zipCode: '' });

  useEffect(() => {
    if (user?.savedAddresses) {
      setAddresses(user.savedAddresses);
    }
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const updatedAddresses = await userService.addAddress(newAddress);
      setAddresses(updatedAddresses);
      setAuth({ ...user, savedAddresses: updatedAddresses }, token, refreshToken);
      setIsAddingAddress(false);
      setNewAddress({ label: '', street: '', city: '', state: '', zipCode: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const updatedAddresses = await userService.deleteAddress(addressId);
      setAddresses(updatedAddresses);
      setAuth({ ...user, savedAddresses: updatedAddresses }, token, refreshToken);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const updatedAddresses = await userService.setDefaultAddress(addressId);
      setAddresses(updatedAddresses);
      setAuth({ ...user, savedAddresses: updatedAddresses }, token, refreshToken);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set default address');
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-2xl font-black text-black uppercase mb-8 tracking-wider">SAVED ADDRESSES</h2>
      
      {isAddingAddress ? (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <form onSubmit={handleAddAddress} className="space-y-4">
            <h4 className="font-bold text-black uppercase tracking-wide text-sm mb-4">Add New Delivery Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="Label (e.g. Home, Work)" className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm md:col-span-2 bg-[#fcf9f8]" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} />
              <input required type="text" placeholder="Street Address" className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm md:col-span-2 bg-[#fcf9f8]" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
              <input required type="text" placeholder="City" className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8]" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
              <input required type="text" placeholder="State" className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8]" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
              <input required type="text" placeholder="Zip Code (6 digits)" pattern="\d{6}" className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm md:col-span-2 bg-[#fcf9f8]" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 px-4 py-3 rounded-lg font-bold uppercase tracking-wide text-sm text-neutral-500 bg-[#f0eded] hover:bg-neutral-200 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wide text-sm hover:bg-orange/90 transition-colors shadow-sm">Save Address</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4 flex flex-col">
          {addresses.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <p className="text-on-surface-variant font-bold text-sm">No saved addresses</p>
            </div>
          ) : (
            addresses.map(addr => (
              <div key={addr._id} className="bg-white rounded-xl p-5 shadow-sm relative group flex justify-between items-start">
                <div className="flex gap-3">
                  <i className="fas fa-map-marker-alt text-neutral-400 mt-1 text-sm"></i>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-black text-sm tracking-wide">{addr.label}</h3>
                      {addr.isDefault && (
                        <span className="bg-orange text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-lg">
                      {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                  </div>
                </div>
                
                <div className="relative group/menu cursor-pointer px-2">
                  <i className="fas fa-ellipsis-v text-orange"></i>
                  <div className="absolute right-0 top-6 bg-white border border-neutral-100 shadow-md rounded-lg py-2 w-32 hidden group-hover/menu:block z-10">
                    {!addr.isDefault && (
                      <div 
                        onClick={() => handleSetDefault(addr._id)}
                        className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-black transition-colors"
                      >
                        Set Default
                      </div>
                    )}
                    <div 
                      onClick={() => handleDelete(addr._id)}
                      className="px-4 py-2 text-xs font-bold text-primary hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {!isAddingAddress && addresses.length < 2 && (
            <div 
              onClick={() => setIsAddingAddress(true)}
              className="bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:bg-neutral-50 transition-colors flex items-center"
            >
              <i className="fas fa-plus text-orange mr-3 font-bold"></i>
              <span className="font-black text-black text-sm tracking-wide">Add Address</span>
            </div>
          )}
          
          {addresses.length >= 2 && (
            <div className="text-center pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Limit of 2 saved addresses reached.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
