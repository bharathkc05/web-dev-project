import { HeroBanner } from '../../features/products/components/HeroBanner';
import { MenuSection } from '../../features/products/components/MenuSection';
import { BKWallBanner } from '../../features/products/components/BKWallBanner';

export const HomePage = () => {
  return (
    <>
      <HeroBanner />
      <MenuSection />
      <BKWallBanner />
    </>
  );
};
