import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-hot-toast';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', order: 0, isActive: true });
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateCategory(editingId, formData);
        toast.success('Category updated');
      } else {
        await adminService.createCategory(formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setFormData({ name: category.name, description: category.description, order: category.order, isActive: category.isActive });
      setEditingId(category._id);
    } else {
      setFormData({ name: '', description: '', order: 0, isActive: true });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Categories</h2>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide mt-2">Manage product categories for the catalogue</p>
        </div>
        <button onClick={() => openModal()} className="bg-orange text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-wide text-xs hover:bg-orange/90 transition-colors shadow-sm">
          <i className="fas fa-plus mr-2"></i> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-surface-container-high text-on-surface-variant text-sm font-bold uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4 font-bold text-on-surface">{category.name}</td>
                  <td className="p-4 text-on-surface-variant">{category.description || '-'}</td>
                  <td className="p-4 text-on-surface-variant">{category.order}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {category.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openModal(category)} className="p-2 text-primary hover:bg-primary-container rounded-lg transition-colors">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(category._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant">No categories found.</td>
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
              <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">{editingId ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" placeholder="e.g. BURGERS" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description</label>
                  <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" />
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
                    Save Category
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
