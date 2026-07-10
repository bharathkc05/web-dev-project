import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { CategoryNav } from './components/CategoryNav';
import { api } from '../../utils/api';
import { MenuSection } from './components/MenuSection';
import { CartSidebar } from '../../features/cart/components/CartSidebar';
import { productService } from '../../features/products/services/product.service';
import { useCartStore } from '../../store/cartStore';
import { useOutletStore } from '../../store/outletStore';

export const MenuPage = () => {
  const location = useLocation();
  const tabFromState = location.state?.tabId;

  const [activeQuickTabId, setActiveQuickTabId] = useState('');
  const [products, setProducts] = useState([]);
  const [quickTabs, setQuickTabs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const { selectedOutlet } = useOutletStore();
  
  const hasItems = items.length > 0;
  
  useEffect(() => {
    const fetchQuickTabs = async () => {
      try {
        const response = await api.get('/quicktabs');
        const res = response.data;
        if (res.data?.length > 0) {
          setQuickTabs(res.data);
          setActiveQuickTabId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch quicktabs', err);
      }
    };
    fetchQuickTabs();
  }, []);

  // Sync tab from routing state
  useEffect(() => {
    if (tabFromState && quickTabs.some(t => t._id === tabFromState)) {
      setActiveQuickTabId(tabFromState);
    }
  }, [tabFromState, quickTabs]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedOutlet) {
        setProducts([]);
        return;
      }
      
      try {
        setLoading(true);
        // We fetch up to 500 products for simplicity, or could implement infinite scroll later
        const res = await productService.getProducts({ outletId: selectedOutlet._id, isAvailable: true, limit: 500 });
        // The API returns { success: true, data: { items: [...], pageInfo: {...} } }
        setProducts(res.data?.items || res.items || []);
      } catch (error) {
        console.error('Failed to fetch outlet products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [selectedOutlet]);

  const activeQuickTab = quickTabs.find(tab => tab._id === activeQuickTabId);
  const activeQuickTabName = activeQuickTab?.name || '';
  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (activeQuickTabId) {
        return product.quickTab === activeQuickTabId || product.quickTab?._id === activeQuickTabId;
      }
      return false;
    });
  }, [products, activeQuickTabId]);

  return (
    <div className="pt-10 pb-10 w-full max-w-[1400px] mx-auto px-4 md:px-8">
      {!selectedOutlet ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-neutral-100">
          <i className="fas fa-store text-6xl text-neutral-300 mb-6"></i>
          <h2 className="text-2xl font-black text-on-surface mb-2">Select an Outlet</h2>
          <p className="text-on-surface-variant max-w-md text-center">
            Please choose an outlet from the header dropdown to view the menu and start ordering.
          </p>
        </div>
      ) : (
        <>
          <CategoryNav
            categories={quickTabs.map(t => ({ id: t._id, name: t.name, image: t.imageUrl }))}
            activeCategory={activeQuickTabId}
            onCategoryChange={setActiveQuickTabId}
          />
          
          <div className="flex w-full relative gap-12 items-start justify-between mt-4">
            {/* Main Content Area */}
            <main className="w-full lg:w-[65%] shrink-0 min-w-0">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <MenuSection
                  categoryName={activeQuickTabName}
                  products={filteredProducts}
                  onAddClick={addItem}
                  hasCartItems={hasItems}
                />
              ) : (
                <div className="py-20 text-center text-on-surface-variant bg-white rounded-xl shadow-sm border border-neutral-100 mt-8">
                  No products available in this category for {selectedOutlet.name}.
                </div>
              )}
            </main>
            
            {/* Sticky Cart Sidebar or Spacer */}
            {hasItems ? (
              <CartSidebar />
            ) : (
              <div className="hidden lg:block w-80 shrink-0" />
            )}
          </div>
        </>
      )}
    </div>
  );
};
