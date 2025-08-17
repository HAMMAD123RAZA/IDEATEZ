// client/src/admin/components/PermissionGate.jsx
import { useAuth } from '../AuthContext';

const PermissionGate = ({ 
  permission, 
  children, 
  fallback = null,
  requireAll = false,
  showLoading = false 
}) => {
  const { hasPermission, loadingPermissions } = useAuth();

  // Show loading state if permissions are still loading
  if (loadingPermissions && showLoading) {
    return <div className="animate-pulse bg-gray-700/30 rounded h-8 w-full"></div>;
  }

  if (loadingPermissions) return null;

  // Handle multiple permissions
  if (Array.isArray(permission)) {
    const hasRequiredPermissions = requireAll 
      ? permission.every(p => hasPermission(p))
      : permission.some(p => hasPermission(p));
    
    return hasRequiredPermissions ? children : fallback;
  }

  // Handle single permission
  return hasPermission(permission) ? children : fallback;
};

export default PermissionGate;
