import { useState, useEffect } from 'react';
import { adminService } from '../../features/admin/services/admin.service';
import { toast } from 'react-hot-toast';

export const QuickTabsPage = () => {
  const [quickTabs, setQuickTabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', imageUrl: '', order: 0, isActive: true });
  const [editingId, setEditingId] = useState(null);

  const fetchQuickTabs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getQuickTabs();
      setQuickTabs(res.data);
    } catch (error) {
      toast.error('Failed to fetch quick tabs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickTabs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateQuickTab(editingId, formData);
        toast.success('Quick Tab updated');
      } else {
        await adminService.createQuickTab(formData);
        toast.success('Quick Tab created');
      }
      setIsModalOpen(false);
      fetchQuickTabs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quick tab?')) return;
    try {
      await adminService.deleteQuickTab(id);
      toast.success('Quick Tab deleted');
      fetchQuickTabs();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openModal = (tab = null) => {
    if (tab) {
      setFormData({ name: tab.name, imageUrl: tab.imageUrl || '', order: tab.order, isActive: tab.isActive });
      setEditingId(tab._id);
    } else {
      setFormData({ name: '', imageUrl: '', order: 0, isActive: true });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Quick Tabs</h2>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide mt-2">Manage menu navigation tabs for the frontend</p>
        </div>
        <button onClick={() => openModal()} className="bg-orange text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-wide text-xs hover:bg-orange/90 transition-colors shadow-sm">
          <i className="fas fa-plus mr-2"></i> Add Quick Tab
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-surface-container-high text-on-surface-variant text-sm font-bold uppercase tracking-wider">
                <th className="p-4 w-20">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quickTabs.map((tab) => (
                <tr key={tab._id} className="border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4">
                    {tab.imageUrl ? (
                      <img src={tab.imageUrl} alt={tab.name} className="w-10 h-10 object-contain rounded-md bg-neutral-50 border border-neutral-100" />
                    ) : (
                      <div className="w-10 h-10 bg-surface-container rounded-md flex items-center justify-center text-on-surface-variant">
                        <i className="fas fa-image text-xs"></i>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-on-surface">{tab.name}</td>
                  <td className="p-4 text-on-surface-variant">{tab.order}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tab.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tab.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openModal(tab)} className="p-2 text-primary hover:bg-primary-container rounded-lg transition-colors">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(tab._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {quickTabs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant">No quick tabs found.</td>
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
              <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">{editingId ? 'Edit Quick Tab' : 'Add Quick Tab'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder="e.g. WHOPPER DELUXE" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Image URL (Optional)</label>
                  <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder="https://..." />
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
                    Save Quick Tab
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
