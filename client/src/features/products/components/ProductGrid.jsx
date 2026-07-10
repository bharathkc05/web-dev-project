import { ProductCard } from './ProductCard';

export const ProductGrid = ({ products, onAddClick, renderCustomAction, renderStatusBadge, fullWidth = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,270px)] justify-center sm:justify-evenly gap-y-6 gap-x-2 md:gap-x-4 lg:gap-x-6 items-stretch">
      {products.map((product) => (
        <div key={product.id || product._id} className="w-full sm:w-[270px] shrink-0">
          <ProductCard
            product={product}
            onAddClick={onAddClick}
            customAction={renderCustomAction ? renderCustomAction(product) : undefined}
            statusBadge={renderStatusBadge ? renderStatusBadge(product) : undefined}
          />
        </div>
      ))}
    </div>
  );
};
