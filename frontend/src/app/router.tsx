/* eslint-disable react-refresh/only-export-components -- route config module, not hot-reloaded as a component */
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageLoader } from '@/components/ui/Spinner';
import { GuestOnly, RequireAuth } from '@/features/auth/guards';
import NotFoundPage, { RouteErrorPage } from '@/pages/NotFoundPage';

// Each page is its own chunk, so visitors scanning a QR code only download the visitor form.
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const StaffReportPage = lazy(() => import('@/features/reports/pages/StaffReportPage'));
const VisitorReportPage = lazy(() => import('@/features/reports/pages/VisitorReportPage'));
const ReportSubmittedPage = lazy(() => import('@/features/reports/pages/ReportSubmittedPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const FeedbackPage = lazy(() => import('@/features/feedback/pages/FeedbackPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const EditProfilePage = lazy(() => import('@/features/profile/pages/EditProfilePage'));

const page = (element: ReactNode) => <Suspense fallback={<PageLoader />}>{element}</Suspense>;

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: page(<HomePage />) },

      // Authentication (only when signed out)
      {
        element: <GuestOnly />,
        children: [
          { path: '/login', element: page(<LoginPage />) },
          { path: '/register', element: page(<RegisterPage />) },
          { path: '/reset-password', element: page(<ResetPasswordPage />) },
        ],
      },

      // Visitors (no account)
      {
        element: <PublicLayout />,
        children: [
          { path: '/visitor/report', element: page(<VisitorReportPage />) },
          {
            path: '/visitor/report/submitted',
            element: page(<ReportSubmittedPage audience="visitor" />),
          },
        ],
      },

      // Staff (signed in)
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/report', element: page(<StaffReportPage />) },
              {
                path: '/report/submitted',
                element: page(<ReportSubmittedPage audience="staff" />),
              },
              { path: '/dashboard', element: page(<DashboardPage />) },
              { path: '/feedback', element: page(<FeedbackPage />) },
              { path: '/profile', element: page(<ProfilePage />) },
              { path: '/profile/edit', element: page(<EditProfilePage />) },
            ],
          },
        ],
      },

      // Old URLs (bookmarks, printed QR codes) keep working.
      {
        element: <Outlet />,
        children: [
          { path: '/form-visitor', element: <Navigate to="/visitor/report" replace /> },
          { path: '/alert-visitor', element: <Navigate to="/visitor/report/submitted" replace /> },
          { path: '/form-staff', element: <Navigate to="/report" replace /> },
          { path: '/alert-staff', element: <Navigate to="/report/submitted" replace /> },
          { path: '/edit-profile', element: <Navigate to="/profile/edit" replace /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
