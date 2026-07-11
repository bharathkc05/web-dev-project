import { useState, useEffect } from 'react';
import { adminService } from './services/admin.service';
import { useLocation } from 'react-router-dom';

export const OutletsPage = () => {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    storeTiming: '',
    latitude: '',
    longitude: '',
    availableServices: ['Takeaway', 'Dine-in', 'Delivery']
  });
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const fetchOutlets = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOutlets();
      setOutlets(data.data?.items || data.items || []);
    } catch (error) {
      console.error('Failed to fetch outlets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsAddModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this outlet?')) {
      try {
        await adminService.approveOutlet(id);
        fetchOutlets();
      } catch (error) {
        console.error('Failed to approve outlet', error);
        alert(error.response?.data?.message || 'Failed to approve outlet');
      }
    }
  };

  const handleSuspend = async (id) => {
    if (window.confirm('Are you sure you want to suspend this outlet?')) {
      try {
        await adminService.suspendOutlet(id);
        fetchOutlets();
      } catch (error) {
        console.error('Failed to suspend outlet', error);
        alert(error.response?.data?.message || 'Failed to suspend outlet');
      }
    }
  };

  const handleAddOutlet = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      await adminService.createOutlet(payload);
      
      setIsAddModalOpen(false);
      setFormData({
        name: '', address: '', storeTiming: '', latitude: '', longitude: '',
        availableServices: ['Takeaway', 'Dine-in', 'Delivery']
      });
      fetchOutlets();
    } catch (error) {
      console.error('Failed to add outlet', error);
      alert(error.response?.data?.message || 'Failed to add outlet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleServiceChange = (service) => {
    setFormData(prev => {
      const services = prev.availableServices.includes(service)
        ? prev.availableServices.filter(s => s !== service)
        : [...prev.availableServices, service];
      return { ...prev, availableServices: services };
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Manage Outlets</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-wide text-xs hover:bg-orange/90 transition-colors shadow-sm flex items-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>Add Outlet</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading outlets...</div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-lowest border-b border-surface-container-high text-on-surface-variant font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Outlet Name</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Active Products</th>
                  <th className="px-6 py-4 text-center">Catalogue Coverage</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {outlets.map((outlet) => {
                  const coveragePercent = outlet.totalMasterProducts > 0 
                    ? Math.round((outlet.totalActivatedCount / outlet.totalMasterProducts) * 100) 
                    : 0;

                  return (
                    <tr key={outlet._id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface">
                        {outlet.name}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant max-w-xs truncate" title={outlet.address}>
                        {outlet.address}
                      </td>
                      <td className="px-6 py-4">
                        {outlet.isApproved ? (
                          outlet.isActive ? (
                            <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-800 uppercase tracking-wider">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-800 uppercase tracking-wider">Suspended</span>
                          )
                        ) : (
                          <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-orange/10 text-orange uppercase tracking-wider">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-on-surface">
                        {outlet.activeProductsCount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-on-surface-variant mb-1">
                            {outlet.totalActivatedCount} / {outlet.totalMasterProducts}
                          </span>
                          <div className="w-full bg-surface-container-high rounded-full h-1.5 max-w-[80px]">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${coveragePercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!outlet.isApproved ? (
                            <button
                              onClick={() => handleApprove(outlet._id)}
                              className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-green-200 hover:border-green-600"
                            >
                              <i className="fas fa-check mr-1"></i> Approve
                            </button>
                          ) : outlet.isActive ? (
                            <button
                              onClick={() => handleSuspend(outlet._id)}
                              className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-200 hover:border-red-500"
                            >
                              <i className="fas fa-ban mr-1"></i> Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove(outlet._id)}
                              className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-green-200 hover:border-green-600"
                            >
                              <i className="fas fa-undo mr-1"></i> Unsuspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {outlets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                      No outlets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Outlet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">Add New Outlet</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <form id="add-outlet-form" onSubmit={handleAddOutlet} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Outlet Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
                    placeholder="e.g., Kapali Mall, Bangalore"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Address</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold min-h-[80px]"
                    placeholder="Full street address..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Store Timings</label>
                  <input
                    type="text"
                    required
                    value={formData.storeTiming}
                    onChange={(e) => setFormData({...formData, storeTiming: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
                    placeholder="e.g., 10:00 AM - 11:59 PM"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
                      placeholder="e.g., 12.9782"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
                      placeholder="e.g., 77.5756"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Available Services</label>
                  <div className="flex space-x-6">
                    {['Takeaway', 'Dine-in', 'Delivery'].map(service => (
                      <label key={service} className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.availableServices.includes(service)}
                          onChange={() => handleServiceChange(service)}
                          className="w-4 h-4 rounded text-orange focus:ring-orange"
                        />
                        <span className="text-sm font-bold text-black/70 group-hover:text-black">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-neutral-100 flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-neutral-200 text-black font-bold uppercase tracking-wide text-xs hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="add-outlet-form"
                    disabled={submitting}
                    className="flex-1 bg-orange hover:bg-[#d95a20] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-xs transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
                  >
                    {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Add Outlet'}
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
