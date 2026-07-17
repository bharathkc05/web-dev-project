import { ProductGrid } from '../../../features/products/components/ProductGrid';

export const MenuSection = ({ categoryName, products, onAddClick, hasCartItems }) => {
  return (
    <div className='product-listing'>
      <h2 className="font-headline-xl text-2xl text-on-surface mb-8 uppercase tracking-wide">{categoryName}</h2>
      {products.length === 0 ? (
        <div className="py-12 text-center text-on-surface-variant font-medium">
          No products available in this category.
        </div>
      ) : (
        <ProductGrid products={products} onAddClick={onAddClick} hasCartItems={hasCartItems} />
      )}
    </div>
  );
};


