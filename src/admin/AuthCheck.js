// FILE: client/src/admin/AuthCheck.jsx
import { useAuth } from './PrivateContext';
import { Navigate } from 'react-router-dom';

export default function AuthCheck({ children }) {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}