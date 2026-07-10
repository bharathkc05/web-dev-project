import { Outlet } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { AuthModal } from '../../features/auth/components/AuthModal';
import { AdminSidebar } from '../../components/layout/AdminSidebar';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5ebdc' }}>
      <Header />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 flex flex-col lg:flex-row gap-10">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </main>
      <AuthModal />
    </div>
  );
};
