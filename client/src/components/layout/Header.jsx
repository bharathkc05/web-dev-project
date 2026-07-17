import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../features/cart/hooks/useCart';
import { useUIStore } from '../../store/uiStore';
import { useOutletStore } from '../../store/outletStore';
import { outletService } from '../../features/outlets/services/outlet.service';
import logo from '../../assets/logo.png';

export const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const { totalCount, clearCart } = useCart();
  const { openAuthModal, orderMode, toggleOrderMode } = useUIStore();
  const { selectedOutlet, setSelectedOutlet } = useOutletStore();


  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const [isOutletOpen, setIsOutletOpen] = useState(false);
  const outletRef = useRef(null);
  const [outlets, setOutlets] = useState([]);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [locatingOutlet, setLocatingOutlet] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'OUTLET_MANAGER';
  const isCustomer = !isAdmin && !isManager;

  // Fetch outlets on mount
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        setLoadingOutlets(true);
        const res = await outletService.getActiveOutlets();
        setOutlets(res.data || res);
      } catch (error) {
        console.error('Failed to fetch outlets:', error);
      } finally {
        setLoadingOutlets(false);
      }
    };
    fetchOutlets();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (outletRef.current && !outletRef.current.contains(event.target)) {
        setIsOutletOpen(false);
      }
    };

    if (isProfileOpen || isOutletOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isOutletOpen]);



  const handleOutletSelect = (outlet) => {
    if (selectedOutlet?._id !== outlet._id) {
      // Prompt logic? The user said "When changing the outlet clear the cart", so we clear the cart automatically.
      clearCart();
      setSelectedOutlet(outlet);
    }
    setIsOutletOpen(false);
  };

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocatingOutlet(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await outletService.getNearestOutlet(latitude, longitude);
          if (res.data) {
            handleOutletSelect(res.data);
          }
        } catch (error) {
          console.error('Failed to find nearest outlet:', error);
          alert(error?.response?.data?.message || 'No nearby outlets found');
        } finally {
          setLocatingOutlet(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location. Please check your browser permissions.');
        setLocatingOutlet(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <header className="bg-surface-container-lowest sticky top-0 z-50 shadow-sm border-b border-surface-container-high">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Side: Logo & Toggles */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link className="flex-shrink-0 relative z-50 bg-white rounded-full flex items-center justify-center w-20 h-20 -mb-4 translate-y-2" to="/">
              <img src={logo} alt="Velvet Bites Logo" className="w-[68px] h-[68px] object-contain" />
            </Link>
            {/* Delivery / Dine-in Toggle */}
            {isCustomer && (
              <div
                className="hidden lg:flex items-center space-x-3 text-sm font-bold uppercase tracking-wide cursor-pointer"
                onClick={toggleOrderMode}
              >
                <span className={`transition-colors duration-200 ${orderMode === 'delivery' ? 'text-primary' : 'text-on-surface-variant'}`}>Delivery</span>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in pointer-events-none">
                  <div
                    className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none transition-all duration-300 z-10 ${orderMode === 'takeaway' ? 'translate-x-6 border-primary' : 'translate-x-0 border-primary'
                      }`}
                  />
                  <div
                    className="block overflow-hidden h-6 rounded-full bg-primary transition-colors duration-200"
                  />
                </div>
                <span className={`transition-colors duration-200 ${orderMode === 'takeaway' ? 'text-primary' : 'text-on-surface-variant'}`}>Dine-in/Takeaway</span>
              </div>
            )}

            {/* Location Selector Dropdown */}
            {isCustomer && (
              <div className="relative hidden lg:flex items-center" ref={outletRef}>
                <div
                  className="flex items-center bg-surface-container px-4 py-2 rounded-full cursor-pointer hover:bg-surface-container-high transition-colors"
                  onClick={() => setIsOutletOpen(!isOutletOpen)}
                >
                  <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                  <span className="text-sm font-semibold truncate max-w-[200px] select-none">
                    {selectedOutlet ? selectedOutlet.name : 'Choose Outlet'}
                  </span>
                  <i className={`fas fa-chevron-down ml-2 text-xs transition-transform duration-200 ${isOutletOpen ? 'rotate-180' : ''}`}></i>
                </div>

                {isOutletOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-surface-container-high py-2 z-50">
                    <div className="px-4 py-2 border-b border-surface-container-high mb-2 flex justify-between items-center">
                      <p className="text-sm font-bold text-on-surface">Available Outlets</p>
                    </div>

                    <div className="px-4 pb-2 border-b border-surface-container-high mb-2">
                      <button
                        onClick={handleFindNearest}
                        disabled={locatingOutlet}
                        className="w-full flex items-center justify-center space-x-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                      >
                        {locatingOutlet ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-location-arrow"></i>
                        )}
                        <span>{locatingOutlet ? 'Locating...' : 'Find Nearest Outlet'}</span>
                      </button>
                    </div>

                    {loadingOutlets ? (
                      <div className="px-4 py-3 text-sm text-gray-500">Loading outlets...</div>
                    ) : outlets.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No active outlets found</div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        {outlets.map(outlet => (
                          <div
                            key={outlet._id}
                            className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-surface-container transition-colors flex items-center justify-between ${selectedOutlet?._id === outlet._id ? 'bg-orange/10 text-primary font-bold' : 'text-on-surface'}`}
                            onClick={() => handleOutletSelect(outlet)}
                          >
                            <span className="truncate">{outlet.name}</span>
                            {selectedOutlet?._id === outlet._id && (
                              <i className="fas fa-check text-primary"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isManager && (
              <div className="hidden lg:flex items-center bg-surface-container px-4 py-2 rounded-full">
                <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                <span className="text-sm font-semibold truncate max-w-[200px] select-none">
                  {outlets.find(o => o._id === user?.outletId)?.name || 'Assigned Outlet'}
                </span>
              </div>
            )}
          </div>
          {/* Right Side: Navigation & Actions */}
          <div className="flex items-center space-x-6 text-sm font-bold text-on-surface-variant uppercase tracking-wide">
            {isCustomer && (
              <>
                <Link className="hidden xl:flex items-center hover:text-primary transition-colors" to="/menu">
                  <i className="fas fa-store mr-2"></i> Menu
                </Link>
              </>
            )}

            {isAuthenticated ? (
              isCustomer && (
                <Link
                  to="/account/profile"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  title="My Account"
                >
                  <i className="fas fa-user text-lg"></i>
                </Link>
              )
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center hover:text-primary transition-colors focus:outline-none"
              >
                <i className="fas fa-user mr-2"></i> Login
              </button>
            )}

            {isCustomer && (
              <Link className="flex items-center hover:text-primary transition-colors relative" to="/cart">
                <i className="fas fa-shopping-cart text-xl mr-1"></i>
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {totalCount}
                  </span>
                )}
                <span className="ml-2">Cart</span>
              </Link>
            )}
            <button className="text-xl hover:text-primary transition-colors focus:outline-none">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
