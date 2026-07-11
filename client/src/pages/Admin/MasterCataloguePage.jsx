import { useState, useEffect } from 'react';
import { MasterProductFormModal } from '../../features/products/components/MasterProductFormModal';
import { productService } from '../../features/products/services/product.service';

import { adminService } from './services/admin.service';
import { ProductGrid } from '../../features/products/components/ProductGrid';
import { useLocation } from 'react-router-dom';

export const MasterCataloguePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [quickTabs, setQuickTabs] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const location = useLocation();

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, quickTabsRes] = await Promise.all([
        productService.getAllMasterProducts(),
        adminService.getCategories(),
        adminService.getQuickTabs()
      ]);
      setProducts(productsRes.data || productsRes);
      setCategories(categoriesRes.data || []);
      setQuickTabs(quickTabsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllMasterProducts();
      setProducts(data.data || data); // Adjust based on your API wrapper
    } catch (error) {
      console.error('Failed to fetch master products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await productService.updateMasterProduct(editingProduct._id, formData);
      } else {
        await productService.createMasterProduct(formData);
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save master product', error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'retire' : 're-activate';
    if (window.confirm(`Are you sure you want to ${action} this master product?`)) {
      try {
        await productService.toggleMasterProductStatus(id);
        fetchProducts();
      } catch (error) {
        console.error(`Failed to ${action} master product`, error);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Master Catalogue</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-wide text-xs hover:bg-orange/90 transition-colors shadow-sm"
        >
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading catalogue...</div>
      ) : (
        <>
          <ProductGrid 
            products={products}
            fullWidth={true}
            renderStatusBadge={(product) => (
              <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.isActive ? 'Active' : 'Retired'}
              </span>
            )}
            renderCustomAction={(product) => (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="bg-white text-primary border border-primary px-4 py-1.5 rounded-full font-bold text-xs hover:bg-primary hover:text-white transition-colors duration-200 shadow-sm flex items-center gap-1 uppercase"
                >
                  <i className="fas fa-edit mr-1"></i> Edit
                </button>
                <button 
                  onClick={() => handleToggleStatus(product._id, product.isActive)}
                  className={`bg-white w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm border ${
                    product.isActive 
                      ? 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white' 
                      : 'text-green-500 border-green-500 hover:bg-green-500 hover:text-white'
                  }`}
                  title={product.isActive ? "Retire Product" : "Re-activate Product"}
                >
                  <i className={`fas ${product.isActive ? 'fa-ban' : 'fa-check'} text-xs`}></i>
                </button>
              </div>
            )}
          />
          {products.length === 0 && (
            <div className="py-10 text-center text-gray-500 bg-white rounded-lg shadow-sm border border-neutral-100 mt-6">
              No products in the master catalogue yet.
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <MasterProductFormModal
          product={editingProduct}
          categories={categories}
          quickTabs={quickTabs}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
