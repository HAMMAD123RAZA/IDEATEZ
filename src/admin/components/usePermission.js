// client/src/admin/hooks/usePermissions.js
import { useAuth } from '../AuthContext';

export const usePermissions = () => {
  const { hasPermission, currentUser, loadingPermissions } = useAuth();

  const checkMultiple = (permissions, requireAll = false) => {
    if (loadingPermissions) return false;
    
    return requireAll 
      ? permissions.every(p => hasPermission(p))
      : permissions.some(p => hasPermission(p));
  };

  const isAdmin = () => currentUser?.role?.id === 'admin';
  
  const canAccessModule = (module) => {
    const modulePermissions = {
      dashboard: 'dashboard_access_menu',
      messages: 'messages_access_menu',
      users: 'users_access_menu',
      roles: 'roles_access_menu',
      tasks: 'tasks_access_menu',
      applicants: 'applicants_access_menu'
    };
    
    return hasPermission(modulePermissions[module]);
  };

  return {
    hasPermission,
    checkMultiple,
    isAdmin,
    canAccessModule,
    loadingPermissions,
    currentUser
  };
};