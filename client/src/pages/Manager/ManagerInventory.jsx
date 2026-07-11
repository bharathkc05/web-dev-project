import { useState, useEffect, useMemo, useRef } from 'react';
import { productService } from '../../features/products/services/product.service';

import { api } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { ActivateProductModal } from '../../features/products/components/ActivateProductModal';
import { ProductGrid } from '../../features/products/components/ProductGrid';

const FilterDropdown = ({ label, icon, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <div 
        className="flex items-center bg-surface-container px-4 py-2 rounded-full cursor-pointer hover:bg-surface-container-high transition-colors shadow-sm border border-surface-container-high"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon && <i className={`${icon} text-primary mr-2`}></i>}
        <div className="flex flex-col mr-2">
           <span className="text-[10px] font-bold text-on-surface-variant uppercase leading-none mb-0.5">{label}</span>
           <span className="text-sm font-semibold truncate max-w-[150px] select-none leading-none">
             {selectedOption.label}
           </span>
        </div>
        <i className={`fas fa-chevron-down ml-2 text-xs transition-transform duration-200 text-on-surface-variant ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-container-high py-2 z-50">
          <div className="px-4 py-2 border-b border-surface-container-high mb-2">
            <p className="text-sm font-bold text-on-surface">Select {label}</p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {options.map(opt => (
              <div 
                key={opt.value}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-surface-container transition-colors flex items-center justify-between ${value === opt.value ? 'bg-orange/10 text-primary font-bold' : 'text-on-surface'}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && (
                  <i className="fas fa-check text-primary"></i>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ManagerInventory = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'catalogue'
  
  const [myProducts, setMyProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMasterProduct, setSelectedMasterProduct] = useState(null);
  
  const [editingProduct, setEditingProduct] = useState(null); // For inline edits in the future
  
  // Filter States
  const [filterVeg, setFilterVeg] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterQuickTab, setFilterQuickTab] = useState('all');

  const [categories, setCategories] = useState([]);
  const [quickTabs, setQuickTabs] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, qtRes] = await Promise.all([
          api.get('/categories'),
          api.get('/quicktabs')
        ]);
        setCategories(catRes.data?.data || catRes.data || []);
        setQuickTabs(qtRes.data?.data || qtRes.data || []);
      } catch (err) {
        console.error('Failed to fetch filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const allKnownProducts = useMemo(() => [...myProducts, ...availableProducts], [myProducts, availableProducts]);
  const uniqueCategoryIds = useMemo(() => [...new Set(allKnownProducts.map(p => p.category).filter(Boolean))], [allKnownProducts]);
  const uniqueQuickTabIds = useMemo(() => [...new Set(allKnownProducts.map(p => p.quickTab).filter(Boolean))], [allKnownProducts]);

  const uniqueCategories = useMemo(() => {
    return uniqueCategoryIds.map(id => {
      const cat = categories.find(c => c._id === id);
      return { label: cat ? cat.name : id, value: id };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [uniqueCategoryIds, categories]);

  const uniqueQuickTabs = useMemo(() => {
    return uniqueQuickTabIds.map(id => {
      const qt = quickTabs.find(t => t._id === id);
      return { label: qt ? qt.name : id, value: id };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [uniqueQuickTabIds, quickTabs]);

  const applyFilters = (products) => {
    return products.filter((p) => {
      if (filterVeg === 'veg' && !p.isVeg) return false;
      if (filterVeg === 'non-veg' && p.isVeg) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (filterQuickTab !== 'all' && p.quickTab !== filterQuickTab) return false;
      return true;
    });
  };

  const filteredMyProducts = useMemo(() => applyFilters(myProducts), [myProducts, filterVeg, filterCategory, filterQuickTab]);
  const filteredAvailableProducts = useMemo(() => applyFilters(availableProducts), [availableProducts, filterVeg, filterCategory, filterQuickTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'menu') {
        const data = await productService.getProducts({ outletId: user?.outletId, limit: 100 });
        setMyProducts(data.data?.items || data.items || []);
      } else {
        const data = await productService.getAvailableMasterProducts();
        setAvailableProducts(data.data || data); // Wrapper might return data.data
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.outletId) {
      fetchData();
    }
  }, [user, activeTab]);

  const handleOpenActivateModal = (masterProduct) => {
    setSelectedMasterProduct(masterProduct);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMasterProduct(null);
    setEditingProduct(null);
  };

  const handleActivateSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await productService.updateOutletProduct(editingProduct._id, formData);
      } else {
        await productService.activateProduct({
          masterProductId: selectedMasterProduct._id,
          ...formData,
        });
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error activating product:', error);
      const backendMessage = error.response?.data?.message || '';
      const validationErrors = error.response?.data?.errors;
      let errorMessage = backendMessage || error.message || 'Failed to activate product';
      
      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          const details = validationErrors.map(err => `${err.field}: ${err.message}`).join('\n');
          errorMessage += `\n\nDetails:\n${details}`;
        } else {
          const details = Object.entries(validationErrors)
            .map(([key, msg]) => `${key}: ${msg}`)
            .join('\n');
          errorMessage += `\n\nDetails:\n${details}`;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleActivateAll = async () => {
    if (!window.confirm('Are you sure you want to add ALL available catalogue products to your menu? They will be added with their default base prices.')) return;
    try {
      setIsLoading(true);
      const res = await productService.activateAllProducts();
      alert(res.message || 'All products added successfully');
      fetchData();
    } catch (error) {
      console.error('Error activating all products:', error);
      alert(error.response?.data?.message || error.message || 'Failed to activate all products');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(error.message || 'Failed to delete product');
      }
    }
  };

  const toggleAvailability = async (product) => {
    try {
      await productService.updateOutletProduct(product._id, { isAvailable: !product.isAvailable });
      fetchData();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert(error.response?.data?.message || error.message || 'Failed to toggle availability');
    }
  };

  const handleEditOutletProduct = (product) => {
    setEditingProduct(product);
    setSelectedMasterProduct({
      name: product.name,
      imageUrl: product.imageUrl,
      basePrice: product.price, // Using their current price as base
    });
    setIsModalOpen(true);
  };

  if (!user?.outletId) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center max-w-2xl mx-auto mt-10">
        <i className="fas fa-store-slash text-6xl text-neutral-300 mb-6"></i>
        <h2 className="text-2xl font-black text-on-surface mb-3">No Outlet Assigned</h2>
        <p className="text-on-surface-variant text-lg">
          You are not currently assigned to an outlet. Please contact an Administrator to assign your account to an outlet before managing inventory.
        </p>
      </div>
    );
  }

  if (isLoading && myProducts.length === 0 && availableProducts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Inventory Management</h2>
        <div className="flex items-center gap-4">
          {activeTab === 'catalogue' && availableProducts.length > 0 && (
            <button
              onClick={handleActivateAll}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
            >
              <i className="fas fa-layer-group"></i> ADD ALL PRODUCTS
            </button>
          )}
          <div className="flex bg-[#f5ebdc] rounded-lg p-1 border border-[#e6d5c1]">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-6 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors ${
                activeTab === 'menu' ? 'bg-white text-[#502314] shadow-sm' : 'text-black/60 hover:text-black'
              }`}
            >
              My Menu
            </button>
            <button
              onClick={() => setActiveTab('catalogue')}
              className={`px-6 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors ${
                activeTab === 'catalogue' ? 'bg-white text-[#502314] shadow-sm' : 'text-black/60 hover:text-black'
              }`}
            >
              Add from Catalogue
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-sm items-center">
        <FilterDropdown 
          label="Dietary"
          icon="fas fa-leaf"
          value={filterVeg}
          onChange={setFilterVeg}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Veg Only', value: 'veg' },
            { label: 'Non-Veg Only', value: 'non-veg' }
          ]}
        />
        
        <FilterDropdown 
          label="Category"
          icon="fas fa-layer-group"
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { label: 'All Categories', value: 'all' },
            ...uniqueCategories
          ]}
        />

        <FilterDropdown 
          label="Quick Tab"
          icon="fas fa-tags"
          value={filterQuickTab}
          onChange={setFilterQuickTab}
          options={[
            { label: 'All Tabs', value: 'all' },
            ...uniqueQuickTabs
          ]}
        />
        
        {(filterVeg !== 'all' || filterCategory !== 'all' || filterQuickTab !== 'all') && (
          <div className="flex items-center ml-auto">
            <button 
              onClick={() => { setFilterVeg('all'); setFilterCategory('all'); setFilterQuickTab('all'); }}
              className="text-sm font-bold text-primary hover:text-white transition-colors h-[38px] px-4 flex items-center justify-center rounded-full bg-red-50 hover:bg-primary shadow-sm border border-red-100 hover:border-primary"
            >
              <i className="fas fa-times mr-2"></i> Clear Filters
            </button>
          </div>
        )}
      </div>

      {activeTab === 'menu' && (
        <>
          <ProductGrid 
            products={filteredMyProducts}
            fullWidth={true}
            renderStatusBadge={(product) => (
              <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.isAvailable ? 'Available' : 'Out of Stock'}
              </span>
            )}
            renderCustomAction={(product) => (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditOutletProduct(product)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none shadow-sm"
                  title="Edit Product"
                >
                  <i className="fas fa-edit text-xs"></i>
                </button>
                <button 
                  onClick={() => toggleAvailability(product)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors focus:outline-none shadow-sm ${
                    product.isAvailable ? 'bg-white border-green-600 text-green-600 hover:bg-green-600 hover:text-white' : 'bg-white border-neutral-400 text-neutral-400 hover:bg-neutral-400 hover:text-white'
                  }`}
                  title={product.isAvailable ? 'Available (Click to disable)' : 'Out of Stock (Click to enable)'}
                >
                  <i className={`fas ${product.isAvailable ? 'fa-check' : 'fa-times'} text-xs`}></i>
                </button>
                <button 
                  onClick={() => handleDelete(product._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors focus:outline-none shadow-sm"
                  title="Delete Product"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            )}
          />
            {myProducts.length === 0 ? (
              <div className="col-span-full p-8 text-center text-on-surface-variant bg-white rounded-2xl shadow-sm border border-surface-container-high mt-6">
                You haven't added any products to your menu yet. Switch to the Catalogue tab to add some!
              </div>
            ) : filteredMyProducts.length === 0 ? (
              <div className="col-span-full p-8 text-center text-on-surface-variant bg-white rounded-2xl shadow-sm border border-surface-container-high mt-6">
                No products match your current filters.
              </div>
            ) : null}
        </>
      )}

      {activeTab === 'catalogue' && (
        <>
          <ProductGrid 
            products={filteredAvailableProducts}
            fullWidth={true}
            renderCustomAction={(product) => (
              <button 
                onClick={() => handleOpenActivateModal(product)}
                className="bg-[#502314] text-white border border-[#502314] px-5 py-1 md:px-6 md:py-1.5 rounded-full font-extrabold text-xs hover:bg-white hover:text-[#502314] transition-colors duration-200 shadow-sm flex items-center gap-1 font-label uppercase whitespace-nowrap"
              >
                <span>ADD TO MENU</span>
                <span className="text-sm font-extrabold leading-none">+</span>
              </button>
            )}
          />
          {availableProducts.length === 0 ? (
            <div className="col-span-full p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container-high mt-6">
              No new products available in the master catalogue.
            </div>
          ) : filteredAvailableProducts.length === 0 ? (
            <div className="col-span-full p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container-high mt-6">
              No available products match your current filters.
            </div>
          ) : null}
        </>
      )}

      {isModalOpen && selectedMasterProduct && (
        <ActivateProductModal
          masterProduct={selectedMasterProduct}
          existingData={editingProduct}
          onClose={handleCloseModal}
          onSave={handleActivateSubmit}
        />
      )}
    </div>
  );
};
