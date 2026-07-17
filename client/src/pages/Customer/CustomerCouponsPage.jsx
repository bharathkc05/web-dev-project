import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useOutletStore } from '../../store/outletStore';
import { useAuth } from '../../hooks/useAuth';

export const CustomerCouponsPage = () => {
  const { selectedOutlet } = useOutletStore();
  const { token } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!selectedOutlet?._id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await api.get(`/products/outlets/${selectedOutlet._id}/offers/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCoupons(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch coupons', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
  }, [selectedOutlet, token]);

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-2xl font-black text-black uppercase mb-8 tracking-wider">MY COUPONS</h2>
      
      {!selectedOutlet ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <h2 className="font-display text-lg font-black mb-1">Select an Outlet</h2>
          <p className="text-on-surface-variant mb-6 text-sm">Please select a store location first to view available coupons.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20 bg-white rounded-xl shadow-sm">
          <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-ticket-alt text-2xl text-neutral-400"></i>
          </div>
          <h2 className="font-display text-lg font-black mb-1">No coupons right now</h2>
          <p className="text-on-surface-variant text-sm">Check back later for exciting offers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map(coupon => (
            <div key={coupon._id} className="relative bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-neutral-100">
              {coupon.isPersonalized && (
                <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-black uppercase px-2 py-1 rounded-br-lg tracking-wider z-10 shadow-sm">
                  <i className="fas fa-star mr-1"></i> For You
                </div>
              )}
              <div className="bg-orange/10 p-6 flex flex-col justify-center items-center md:w-1/3 border-b md:border-b-0 md:border-r border-dashed border-orange/30">
                <span className="text-3xl font-display font-black text-orange">
                  {coupon.type === 'PERCENT' ? `${coupon.value}%` : 
                   coupon.type === 'FLAT' ? `₹${coupon.value}` : 'BOGO'}
                </span>
                <span className="text-xs font-black uppercase text-orange tracking-widest mt-1">OFF</span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block border-2 border-primary border-dashed rounded-lg px-3 py-1 mb-3">
                    <span className="font-display font-black text-primary tracking-widest text-lg uppercase">{coupon.code}</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface-variant mb-1">
                    {coupon.type === 'BOGO' 
                      ? 'Buy 1 Get 1 Free on select items' 
                      : `Get ${coupon.type === 'PERCENT' ? `${coupon.value}%` : `₹${coupon.value}`} off on your order`}
                  </p>
                  {coupon.minOrderValue > 0 && (
                    <p className="text-xs font-bold text-neutral-400 mb-4">Valid on orders above ₹{coupon.minOrderValue}</p>
                  )}
                </div>
                <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                  Valid till: {new Date(coupon.expiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
