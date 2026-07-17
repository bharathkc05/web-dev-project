import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export const AdminSidebar = () => {
  const { logout } = useAuth();
  
  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { to: '/admin/outlets', label: 'Outlets', icon: 'fas fa-store' },
    { to: '/admin/users', label: 'Users', icon: 'fas fa-users' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { to: '/admin/catalogue', label: 'Products', icon: 'fas fa-hamburger' },
    { to: '/admin/categories', label: 'Categories', icon: 'fas fa-tags' },
    { to: '/admin/quicktabs', label: 'Quick Tabs', icon: 'fas fa-bolt' },
    { to: '/admin/banners', label: 'Banners', icon: 'fas fa-images' },
    { to: '/admin/audit', label: 'Audit Log', icon: 'fas fa-history' },
    { to: '/admin/marketing', label: 'Marketing', icon: 'fas fa-bullhorn' },
  ];

  return (
    <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-8 flex flex-col">
        <h2 className="font-display font-black text-xl text-black uppercase tracking-wide">Admin Portal</h2>
        <p className="text-black font-bold text-sm mt-1 tracking-wide">Management Console</p>
      </div>

      <nav className="flex flex-col gap-4 mt-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
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
                <i className={`${link.icon} w-6 text-center mr-4 text-lg ${isActive ? 'text-white' : 'text-orange'}`}></i>
                {link.label}
              </>
            )}
          </NavLink>
        ))}

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="flex items-center px-6 py-5 rounded-xl shadow-sm transition-colors font-bold text-sm tracking-wide bg-white text-primary hover:bg-primary/10 mt-8"
        >
          <i className="fas fa-sign-out-alt w-6 text-center mr-4 text-lg"></i>
          Logout
        </button>
      </nav>
    </div>
  );
};
