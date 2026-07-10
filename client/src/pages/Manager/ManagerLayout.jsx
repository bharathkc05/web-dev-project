import { NavLink, Outlet } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { AuthModal } from '../../features/auth/components/AuthModal';
import { useAuth } from '../../hooks/useAuth';

export const ManagerLayout = () => {
  const { logout } = useAuth();
  
  const tabs = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: 'fa-chart-pie' },
    { name: 'Inventory', path: '/manager/inventory', icon: 'fa-box-open' },
    { name: 'Offers', path: '/manager/offers', icon: 'fa-tags' },
    { name: 'Orders', path: '/manager/orders', icon: 'fa-receipt' },
  ];

  return (
    <div className="min-h-screen bg-[#f5ebdc] flex flex-col">
      <Header />
      
      {/* Secondary Navigation for Manager */}
      <div className="bg-white shadow-sm border-b border-[#e6d5c1] sticky top-[72px] lg:top-[88px] z-40">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center w-full overflow-x-auto hide-scrollbar">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  to={tab.path}
                  className={({ isActive }) =>
                    `flex items-center py-4 px-1 border-b-[3px] font-bold text-sm tracking-wide whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-orange text-orange'
                        : 'border-transparent text-black/60 hover:text-black hover:border-black/20'
                    }`
                  }
                >
                  <i className={`fas ${tab.icon} mr-2 text-lg`}></i>
                  {tab.name}
                </NavLink>
              ))}
            </div>

            <button 
              onClick={logout}
              className="ml-auto flex items-center py-4 px-1 font-bold text-sm tracking-wide whitespace-nowrap text-primary hover:text-primary-dark transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-2 text-lg"></i>
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <AuthModal />
    </div>
  );
};
