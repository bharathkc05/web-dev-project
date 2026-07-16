import { HeroBanner } from '../../features/products/components/HeroBanner';
import { HomeMenuSection } from '../../features/home/components/HomeMenuSection';
import { BKWallBanner } from '../../features/home/components/BKWallBanner';

export const HomePage = () => {
  return (
    <>
      <HeroBanner />
      <HomeMenuSection />
      <BKWallBanner />
    </>
  );
};
