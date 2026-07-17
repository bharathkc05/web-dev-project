import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { MenuPage } from '../pages/Menu/MenuPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOrCustomerRoute } from './PublicOrCustomerRoute';

import { HomePage } from '../pages/Home/HomePage';
import CartPage from '../pages/Cart/CartPage';
import { ResetPasswordPage } from '../pages/Auth/ResetPasswordPage';

import { CustomerOrdersPage } from '../pages/Customer/CustomerOrdersPage';
import { CustomerOrderTrackPage } from '../pages/Customer/CustomerOrderTrackPage';
import { AccountLayout } from '../pages/Customer/AccountLayout';
import { CustomerAddressesPage } from '../pages/Customer/CustomerAddressesPage';
import { CustomerProfilePage } from '../pages/Customer/CustomerProfilePage';
import { CustomerCouponsPage } from '../pages/Customer/CustomerCouponsPage';
import { CustomerNotificationsPage } from '../pages/Customer/CustomerNotificationsPage';

import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

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
import { MarketingCampaigns } from '../pages/Admin/MarketingCampaigns';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicOrCustomerRoute>
        <AppLayout />
      </PublicOrCustomerRoute>
    ), // The common layout with Header/Footer
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
        path: 'reset-password/:token',
        element: <ResetPasswordPage />,
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
            path: 'coupons',
            element: <CustomerCouponsPage />
          },
          {
            path: 'profile',
            element: <CustomerProfilePage />
          },
          {
            path: 'notifications',
            element: <CustomerNotificationsPage />
          }
        ]
      },
      // Catch-all 404 route
      {
        path: '*',
        element: <NotFoundPage showPath={true} />,
      }
    ],
  },
  // Auth is handled via Modals, so no separate routes needed
  // Outlet specific protected routes
  {
    path: '/outlet/*',
    element: <Navigate to="/manager/dashboard" replace />,
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
      { path: 'marketing', element: <MarketingCampaigns /> },
      { path: '', element: <Navigate to="dashboard" replace /> }
    ]
  }
]);
