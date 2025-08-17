
// client/src/admin/PrivateRoute.js

import { useAuth } from './PrivateContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.roleId !== 'admin') {
    return <Navigate to="/login" state={{ error: 'Access restricted to admins only' }} replace />;
  }

  return <Outlet />;
}