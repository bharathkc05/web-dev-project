import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { MenuPage } from '../pages/Menu/MenuPage';
import { ProtectedRoute } from './ProtectedRoute';

import { HomePage } from '../pages/Home/HomePage';
import CartPage from '../pages/Cart/CartPage';

import { CustomerOrdersPage } from '../pages/Customer/CustomerOrdersPage';
import { CustomerOrderTrackPage } from '../pages/Customer/CustomerOrderTrackPage';
import { AccountLayout } from '../pages/Customer/AccountLayout';
import { CustomerAddressesPage } from '../pages/Customer/CustomerAddressesPage';
import { CustomerProfilePage } from '../pages/Customer/CustomerProfilePage';

// Temporary placeholders for missing pages to prevent crashes
const CheckoutPage = () => <div className="p-8"><h1>Checkout Page</h1></div>;
const OutletDashboard = () => <div className="p-8"><h1>Outlet Dashboard</h1></div>;
import { MasterCataloguePage } from '../pages/Admin/MasterCataloguePage';
import { CategoriesPage } from '../pages/Admin/CategoriesPage';
import { QuickTabsPage } from '../pages/Admin/QuickTabsPage';
import { BannersPage } from '../pages/Admin/BannersPage';
import { OutletsPage } from '../pages/Admin/OutletsPage';
import { AnalyticsPage } from '../pages/Admin/AnalyticsPage';
import { UsersPage } from '../pages/Admin/UsersPage';
import { AuditLogPage } from '../pages/Admin/AuditLogPage';
import { AdminDashboard } from '../pages/Admin/AdminDashboard';

import { ManagerLayout } from '../pages/Manager/ManagerLayout';
import { ManagerDashboard } from '../pages/Manager/ManagerDashboard';
import { ManagerInventory } from '../pages/Manager/ManagerInventory';
import { ManagerOffers } from '../pages/Manager/ManagerOffers';
import { ManagerOrders } from '../pages/Manager/ManagerOrders';
import { AdminLayout } from '../pages/Admin/AdminLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />, // The common layout with Header/Footer
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: 'menu',
        element: <MenuPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: <Navigate to="/account/orders" replace />
      },
      {
        path: 'profile',
        element: <Navigate to="/account/profile" replace />
      },
      {
        path: 'account',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="orders" replace />
          },
          {
            path: 'orders',
            element: <CustomerOrdersPage />
          },
          {
            path: 'orders/:id/track',
            element: <CustomerOrderTrackPage />
          },
          {
            path: 'addresses',
            element: <CustomerAddressesPage />
          },
          {
            path: 'profile',
            element: <CustomerProfilePage />
          }
        ]
      },
    ],
  },
  // Auth is handled via Modals, so no separate routes needed
  // Outlet specific protected routes
  {
    path: '/outlet/*',
    element: (
      <ProtectedRoute allowedRoles={['OUTLET_MANAGER', 'ADMIN']}>
        {/* OutletLayout could go here */}
        <OutletDashboard />
      </ProtectedRoute>
    ),
  },
  // Manager specific protected routes
  {
    path: '/manager',
    element: (
      <ProtectedRoute allowedRoles={['OUTLET_MANAGER', 'ADMIN']}>
        <ManagerLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <ManagerDashboard /> },
      { path: 'inventory', element: <ManagerInventory /> },
      { path: 'offers', element: <ManagerOffers /> },
      { path: 'orders', element: <ManagerOrders /> },
      { path: '', element: <Navigate to="dashboard" replace /> }
    ]
  },
  // Admin specific protected routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'catalogue', element: <MasterCataloguePage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'quicktabs', element: <QuickTabsPage /> },
      { path: 'banners', element: <BannersPage /> },
      { path: 'master-catalogue', element: <Navigate to="../catalogue" replace /> },
      { path: 'outlets', element: <OutletsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'audit', element: <AuditLogPage /> },
      { path: '', element: <Navigate to="dashboard" replace /> }
    ]
  },
  // Catch-all for 404
  {
    path: '*',
    element: <div className="p-8"><h1>404 Not Found</h1></div>,
  },
]);
