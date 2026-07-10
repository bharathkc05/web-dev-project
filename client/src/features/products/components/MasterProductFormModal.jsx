import { useState, useEffect } from 'react';
export const MasterProductFormModal = ({ product, categories = [], quickTabs = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quickTab: '',
    isVeg: false,
    basePrice: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        quickTab: product.quickTab || '',
        isVeg: product.isVeg || false,
        basePrice: product.basePrice,
        isActive: product.isActive ?? true,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    if (formData.quickTab) {
      data.append('quickTab', formData.quickTab);
    }
    data.append('isVeg', formData.isVeg);
    data.append('basePrice', formData.basePrice);
    data.append('isActive', formData.isActive);
    if (imageFile) {
      data.append('image', imageFile);
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">
            {product ? 'Edit Master Product' : 'Add Master Product'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Product Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quickTab" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Quick Tab (Optional)</label>
                <select
                  id="quickTab"
                  name="quickTab"
                  value={formData.quickTab}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
                >
                  <option value="">None</option>
                  {quickTabs.map(q => (
                    <option key={q._id} value={q._id}>{q.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="basePrice" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Base Price (₹)</label>
                <input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  min="0"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isVeg"
                  checked={formData.isVeg}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-orange focus:ring-orange"
                />
                <span className="text-sm font-bold text-black/70 group-hover:text-black">Is Vegetarian</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-orange focus:ring-orange"
                />
                <span className="text-sm font-bold text-black/70 group-hover:text-black">Is Active</span>
              </label>
            </div>

            <div>
              <label htmlFor="image" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Product Image</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-surface-container file:text-black hover:file:bg-neutral-200 cursor-pointer"
              />
              {product?.imageUrl && !imageFile && (
                <div className="mt-2 text-xs font-bold text-orange">Current image will be kept if no new file is selected.</div>
              )}
            </div>

            <div className="pt-6 border-t border-neutral-100 flex gap-4 mt-8">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg border border-neutral-200 text-black font-bold uppercase tracking-wide text-xs hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-orange hover:bg-[#d95a20] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-xs transition-colors shadow-sm flex justify-center items-center"
              >
                {product ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
