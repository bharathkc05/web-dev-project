import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';

export const MarketingCampaigns = () => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    targetGroup: 'FRESH_USERS',
    code: '',
    type: 'FLAT',
    value: 0,
    minOrderValue: 0,
    maxDiscount: '',
    usageLimit: 1,
    expiryDays: 7
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateCode = () => {
    const prefix = formData.targetGroup === 'FRESH_USERS' ? 'WELCOME' : 
                   formData.targetGroup === 'DORMANT_30_DAYS' ? 'MISSYOU' : 
                   formData.targetGroup === 'LOYAL_5_PLUS_ORDERS' ? 'VIP' : 'TREAT';
    const num = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({ ...prev, code: `${prefix}${num}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(formData.expiryDays));

      const payload = {
        targetGroup: formData.targetGroup,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        minOrderValue: Number(formData.minOrderValue),
        usageLimit: Number(formData.usageLimit),
        expiryDate: expiryDate.toISOString(),
      };

      if (formData.maxDiscount && Number(formData.maxDiscount) > 0) {
        payload.maxDiscount = Number(formData.maxDiscount);
      }

      const res = await api.post('/products/campaigns', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg(`Campaign launched! Emails sent to ${res.data.data.usersTargeted} users.`);
      setFormData({
        targetGroup: 'FRESH_USERS',
        code: '',
        type: 'FLAT',
        value: 0,
        minOrderValue: 0,
        maxDiscount: '',
        usageLimit: 1,
        expiryDays: 7
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-black uppercase text-black tracking-wide">Targeted Campaigns</h2>
          <p className="text-sm font-bold text-on-surface-variant mt-1">Send personalized coupons to specific user groups via Email.</p>
        </div>
      </div>

      <div className="p-8 overflow-y-auto">
        {successMsg && (
          <div className="mb-6 p-4 bg-[#e6f4ea] text-[#137333] rounded-xl border border-[#137333]/20 font-bold flex items-center">
            <i className="fas fa-check-circle mr-3 text-xl"></i>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-primary/10 text-primary rounded-xl border border-primary/20 font-bold flex items-center">
            <i className="fas fa-exclamation-circle mr-3 text-xl"></i>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
          
          <div className="bg-surface-container rounded-xl p-6 border border-surface-container-highest">
            <h3 className="font-display font-black text-lg mb-4 uppercase text-black"><i className="fas fa-users text-orange mr-2"></i> 1. Select Audience</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.targetGroup === 'FRESH_USERS' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white hover:border-primary/50'}`}>
                <input type="radio" name="targetGroup" value="FRESH_USERS" checked={formData.targetGroup === 'FRESH_USERS'} onChange={handleChange} className="sr-only" />
                <div className="font-black text-black uppercase mb-1"><i className="fas fa-seedling text-green-500 mr-2"></i>Fresh Users</div>
                <div className="text-xs font-bold text-on-surface-variant">Users who signed up but never placed an order.</div>
              </label>

              <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.targetGroup === 'DORMANT_30_DAYS' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white hover:border-primary/50'}`}>
                <input type="radio" name="targetGroup" value="DORMANT_30_DAYS" checked={formData.targetGroup === 'DORMANT_30_DAYS'} onChange={handleChange} className="sr-only" />
                <div className="font-black text-black uppercase mb-1"><i className="fas fa-moon text-indigo-500 mr-2"></i>Dormant &gt; 30 Days</div>
                <div className="text-xs font-bold text-on-surface-variant">Users whose last order was over 30 days ago.</div>
              </label>

              <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.targetGroup === 'LOYAL_5_PLUS_ORDERS' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white hover:border-primary/50'}`}>
                <input type="radio" name="targetGroup" value="LOYAL_5_PLUS_ORDERS" checked={formData.targetGroup === 'LOYAL_5_PLUS_ORDERS'} onChange={handleChange} className="sr-only" />
                <div className="font-black text-black uppercase mb-1"><i className="fas fa-crown text-yellow-500 mr-2"></i>Loyal VIPs</div>
                <div className="text-xs font-bold text-on-surface-variant">Users who have placed 5 or more orders.</div>
              </label>

              <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.targetGroup === 'ALL' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white hover:border-primary/50'}`}>
                <input type="radio" name="targetGroup" value="ALL" checked={formData.targetGroup === 'ALL'} onChange={handleChange} className="sr-only" />
                <div className="font-black text-black uppercase mb-1"><i className="fas fa-bullhorn text-blue-500 mr-2"></i>All Customers</div>
                <div className="text-xs font-bold text-on-surface-variant">Blast to everyone. Use with caution!</div>
              </label>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-6 border border-surface-container-highest">
            <h3 className="font-display font-black text-lg mb-4 uppercase text-black"><i className="fas fa-ticket-alt text-orange mr-2"></i> 2. Configure Coupon</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-on-surface-variant tracking-wider mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. MISSYOU50" className="flex-1 w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase transition-colors" />
                  <button type="button" onClick={generateCode} className="bg-neutral-200 hover:bg-neutral-300 text-black px-4 py-3 rounded-lg font-bold transition-colors">
                    <i className="fas fa-magic"></i>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-on-surface-variant tracking-wider mb-2">Discount Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer">
                  <option value="PERCENT">Percentage Off (%)</option>
                  <option value="FLAT">Flat Amount Off (₹)</option>
                  <option value="BOGO">Buy 1 Get 1 Free</option>
                </select>
              </div>

              {formData.type !== 'BOGO' && (
                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant tracking-wider mb-2">
                    {formData.type === 'PERCENT' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                  </label>
                  <input type="number" name="value" value={formData.value} onChange={handleChange} required min="1" className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                </div>
              )}

              {formData.type === 'PERCENT' && (
                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant tracking-wider mb-2">Max Discount (₹) <span className="text-neutral-400 font-normal lowercase">(Optional)</span></label>
                  <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} min="0" placeholder="No limit" className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-on-surface-variant tracking-wider mb-2">Minimum Order Value (₹)</label>
                <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} required min="0" className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-on-surface-variant tracking-wider mb-2">Valid For (Days)</label>
                <input type="number" name="expiryDays" value={formData.expiryDays} onChange={handleChange} required min="1" className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-on-surface-variant tracking-wider mb-2">Usage Limit (Per User)</label>
                <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} required min="1" className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
                isSubmitting ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark hover:-translate-y-1 hover:shadow-lg shadow-primary/30'
              }`}
            >
              {isSubmitting ? (
                <span><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</span>
              ) : (
                <span><i className="fas fa-paper-plane mr-2"></i> Launch Campaign</span>
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};
