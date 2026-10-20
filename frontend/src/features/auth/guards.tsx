import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from './auth-context';

export const DEFAULT_AUTHENTICATED_ROUTE = '/report';

/** Only signed-in staff may see these routes; others are sent to sign in and brought back after. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Sign-in / register pages redirect away once the user is already signed in. */
export function GuestOnly() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? DEFAULT_AUTHENTICATED_ROUTE} replace />;
  }
  return <Outlet />;
}
