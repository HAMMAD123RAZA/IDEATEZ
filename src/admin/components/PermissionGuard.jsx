
// FILE: client/src/admin/components/PermissionGuard.jsx
import React from 'react';
import { useAuth } from '../AuthContext';
import PropTypes from 'prop-types';

/**
 * A component that guards its children, rendering them only if the current user
 * has the required permission(s). If permissions are not met, it renders nothing.
 *
 * It can check for a single required permission or if the user has any
 * permission from a given list.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to render if permissions are met.
 * @param {string} [props.permission] - A single permission string to check for.
 * @param {string[]} [props.any] - An array of permission strings. The guard passes if the user has at least one.
 */
const PermissionGuard = ({ children, permission, any: anyOf }) => {
  const { hasPermission, hasAnyPermission, loading } = useAuth();
  
  if (loading) {
    // Render nothing while permissions are being checked
    return null; 
  }

  let isAllowed = false;
  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (anyOf && Array.isArray(anyOf)) {
    isAllowed = hasAnyPermission(anyOf);
  } else {
    // No permission prop provided, default to deny access for safety.
    console.warn("PermissionGuard used without a 'permission' or 'any' prop.");
    isAllowed = false;
  }

  if (isAllowed) {
    return <>{children}</>;
  }
  
  // If not allowed, render nothing.
  return null;
};

PermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  permission: PropTypes.string,
  any: PropTypes.arrayOf(PropTypes.string),
};


export default PermissionGuard;