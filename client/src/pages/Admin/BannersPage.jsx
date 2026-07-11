import { useState, useEffect } from 'react';
import { adminService } from './services/admin.service';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

export const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', linkUrl: '', order: 0, isActive: true });
  const [editingId, setEditingId] = useState(null);
  const location = useLocation();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBanners();
      setBanners(res.data);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (location.state?.openAddModal) {
      openModal();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateBanner(editingId, formData);
        toast.success('Banner updated');
      } else {
        await adminService.createBanner(formData);
        toast.success('Banner created');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await adminService.deleteBanner(id);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setFormData({ title: banner.title, imageUrl: banner.imageUrl, linkUrl: banner.linkUrl || '', order: banner.order, isActive: banner.isActive });
      setEditingId(banner._id);
    } else {
      setFormData({ title: '', imageUrl: '', linkUrl: '', order: 0, isActive: true });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Hero Banners</h2>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide mt-2">Manage marketing banners for the homepage</p>
        </div>
        <button onClick={() => openModal()} className="bg-orange text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-wide text-xs hover:bg-orange/90 transition-colors shadow-sm">
          <i className="fas fa-plus mr-2"></i> Add Banner
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-surface-container-high text-on-surface-variant text-sm font-bold uppercase tracking-wider">
                <th className="p-4 w-32">Image</th>
                <th className="p-4">Title</th>
                <th className="p-4">Link URL</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner._id} className="border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4">
                    <img src={banner.imageUrl} alt={banner.title} className="w-24 h-12 object-cover rounded-lg border border-neutral-200" />
                  </td>
                  <td className="p-4 font-bold text-on-surface">{banner.title}</td>
                  <td className="p-4 text-on-surface-variant text-sm">{banner.linkUrl || '-'}</td>
                  <td className="p-4 text-on-surface-variant">{banner.order}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openModal(banner)} className="p-2 text-primary hover:bg-primary-container rounded-lg transition-colors">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(banner._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">No banners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">{editingId ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder="e.g. Summer Mega Sale" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Image URL</label>
                  <input type="url" required value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Link URL (Optional)</label>
                  <input type="text" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder="/menu/burgers" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Sort Order</label>
                  <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" />
                </div>
                
                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded text-orange focus:ring-orange" />
                    <span className="text-sm font-bold text-black/70 group-hover:text-black">Active</span>
                  </label>
                </div>
                
                <div className="pt-6 border-t border-neutral-100 flex gap-4 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-lg border border-neutral-200 text-black font-bold uppercase tracking-wide text-xs hover:bg-neutral-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-orange hover:bg-[#d95a20] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-xs transition-colors shadow-sm flex justify-center items-center">
                    Save Banner
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
