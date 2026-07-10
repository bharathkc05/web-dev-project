import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthModal } from '../../features/auth/components/AuthModal';

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface select-none">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
};
