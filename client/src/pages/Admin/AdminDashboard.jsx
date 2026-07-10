import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { formatPrice } from '../../utils/formatPrice';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getPlatformAnalytics();
        setData(res.data || res);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-[#f0e6d8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange"></div>
      </div>
    );
  }

  const {
    totalUsers,
    totalRevenue,
    activeOutlets,
    masterCatalogueSize,
    topActivatedProducts,
  } = data;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-8 border border-[#f0e6d8]">
      <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider mb-2">Global Platform Overview</h2>
      
      {/* Stat Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#f5ebdc]/30 p-6 rounded-xl border border-[#e6d5c1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-[#502314] font-black uppercase text-[10px] tracking-widest">Total Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fas fa-chart-line text-green-700"></i>
            </div>
          </div>
          <p className="font-display text-3xl font-black text-black mt-4">{formatPrice(totalRevenue || 0)}</p>
        </div>

        <div className="bg-[#f5ebdc]/30 p-6 rounded-xl border border-[#e6d5c1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-[#502314] font-black uppercase text-[10px] tracking-widest">Registered Users</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-users text-blue-700"></i>
            </div>
          </div>
          <p className="font-display text-3xl font-black text-black mt-4">{totalUsers || 0}</p>
        </div>

        <div className="bg-[#f5ebdc]/30 p-6 rounded-xl border border-[#e6d5c1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-[#502314] font-black uppercase text-[10px] tracking-widest">Active Outlets</h3>
            <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
              <i className="fas fa-store text-orange"></i>
            </div>
          </div>
          <p className="font-display text-3xl font-black text-black mt-4">{activeOutlets || 0}</p>
        </div>

        <div className="bg-[#f5ebdc]/30 p-6 rounded-xl border border-[#e6d5c1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-[#502314] font-black uppercase text-[10px] tracking-widest">Master Catalogue</h3>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <i className="fas fa-layer-group text-purple-700"></i>
            </div>
          </div>
          <p className="font-display text-3xl font-black text-black mt-4">{masterCatalogueSize || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#f0e6d8] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#f0e6d8] bg-[#f5ebdc]/50">
            <h3 className="font-display font-black text-[#502314] uppercase text-sm tracking-widest">Quick Actions</h3>
          </div>
          <div className="p-5 space-y-4 flex-1 flex flex-col justify-center">
            <button 
              onClick={() => navigate('/admin/outlets', { state: { openAddModal: true } })}
              className="w-full bg-[#f5ebdc] hover:bg-[#e6d5c1] text-[#502314] py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 shadow-sm border border-[#e6d5c1]"
            >
              <i className="fas fa-plus"></i> Add New Outlet
            </button>
            <button 
              onClick={() => navigate('/admin/catalogue', { state: { openAddModal: true } })}
              className="w-full bg-[#f5ebdc] hover:bg-[#e6d5c1] text-[#502314] py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 shadow-sm border border-[#e6d5c1]"
            >
              <i className="fas fa-plus"></i> Add Master Product
            </button>
            <button 
              onClick={() => navigate('/admin/banners', { state: { openAddModal: true } })}
              className="w-full bg-[#f5ebdc] hover:bg-[#e6d5c1] text-[#502314] py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 shadow-sm border border-[#e6d5c1]"
            >
              <i className="fas fa-plus"></i> Add Hero Banner
            </button>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0e6d8] overflow-hidden">
          <div className="p-5 border-b border-[#f0e6d8] bg-[#f5ebdc]/50 flex justify-between items-center">
            <h3 className="font-display font-black text-[#502314] uppercase text-sm tracking-widest">Most Popular Products (Global)</h3>
            <button onClick={() => navigate('/admin/analytics')} className="text-xs font-bold text-orange hover:underline">View Full Analytics</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#f0e6d8] text-[10px] uppercase tracking-widest text-[#502314]/70 font-black">
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3 text-right">Activations (Outlets)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6d8]">
                {!topActivatedProducts || topActivatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="p-8 text-center text-black/50 font-bold">
                      No product data found.
                    </td>
                  </tr>
                ) : (
                  topActivatedProducts.slice(0, 5).map((prod, index) => (
                    <tr key={index} className="hover:bg-[#f5ebdc]/20 transition-colors">
                      <td className="px-5 py-4 text-xs font-bold text-black/80">{prod.name}</td>
                      <td className="px-5 py-4 text-xs font-black text-right text-black">{prod.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};
