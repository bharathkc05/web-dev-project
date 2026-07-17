import { HeroBanner } from '../../features/products/components/HeroBanner';
import { HomeMenuSection } from '../../features/home/components/HomeMenuSection';
import { VBWallBanner } from '../../features/home/components/VBWallBanner';

export const HomePage = () => {
  return (
    <>
      <HeroBanner />
      <HomeMenuSection />
      <VBWallBanner />
    </>
  );
};
