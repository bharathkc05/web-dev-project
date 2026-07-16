import React from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AccountLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getBreadcrumbName = () => {
    if (location.pathname.includes('/orders')) return 'RECENT ORDERS';
    if (location.pathname.includes('/addresses')) return 'SAVED ADDRESSESS';
    if (location.pathname.includes('/profile')) return 'PROFILE SETTINGS';
    return 'ACCOUNT';
  };

  const navItems = [
    { path: '/account/orders', icon: 'fas fa-history', label: 'Recent Orders' },
    { path: '/account/addresses', icon: 'fas fa-map-marker-alt', label: 'Saved Addresses' },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#f5ebdc' }}>
      <div 
        className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-10"
      >
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-[11px] font-bold tracking-wider">
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-orange mx-2 text-[8px]"></i>
          <span className="text-on-surface-variant">Account</span>
          <i className="fas fa-chevron-right text-orange mx-2 text-[8px]"></i>
          <span className="text-black font-black uppercase">{getBreadcrumbName()}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Sidebar */}
          <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-sm px-6 py-8 flex items-center gap-6">
              <div className="flex flex-col w-full">
                <Link to="/account/profile" state={{ edit: true }} className="flex items-center gap-2 group cursor-pointer w-max">
                  <h3 className="font-display font-black text-xl text-black uppercase tracking-wide group-hover:text-primary transition-colors">{user?.name || 'Guest'}</h3>
                  <i className="fas fa-chevron-right text-orange text-xs"></i>
                </Link>
                <p className="text-black font-bold text-sm mt-1 tracking-wide">
                  {user?.email} {user?.phone && `| ${user.phone}`}
                </p>
              </div>
            </div>

      
            {/* Navigation Menu */}
            <nav className="flex flex-col gap-4 mt-2">
              {navItems.map((item, index) => (
                <NavLink 
                  key={index}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-6 py-5 rounded-xl shadow-sm transition-colors font-bold text-sm tracking-wide ${
                      isActive 
                        ? 'bg-orange text-white' 
                        : 'bg-white text-black hover:bg-neutral-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <i className={`${item.icon} w-6 text-center mr-4 text-lg ${isActive ? 'text-white' : 'text-orange'}`}></i>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}

              <div 
                onClick={logout}
                className="flex items-center px-6 py-5 rounded-xl shadow-sm bg-white text-primary hover:bg-neutral-50 cursor-pointer font-bold text-sm tracking-wide transition-colors mt-4"
              >
                <i className="fas fa-sign-out-alt w-6 text-center mr-4 text-lg text-primary"></i>
                Logout
              </div>
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 lg:pl-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
