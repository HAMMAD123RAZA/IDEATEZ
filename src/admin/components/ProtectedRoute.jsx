// client/src/admin/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ 
  children, 
  permission, 
  redirectTo = '/admin/dashboard',
  requireAll = false 
}) => {
  const { hasPermission, loadingPermissions, currentUser } = useAuth();

  // Show loading while checking permissions
  if (loadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // No user logged in
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check permissions
  if (permission) {
    const hasRequiredPermissions = Array.isArray(permission)
      ? (requireAll 
          ? permission.every(p => hasPermission(p))
          : permission.some(p => hasPermission(p)))
      : hasPermission(permission);

    if (!hasRequiredPermissions) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;