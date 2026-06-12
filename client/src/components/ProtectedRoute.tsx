import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from './Spinner';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../utils/types';

const ProtectedRoute = ({
  children,
  roles,
  requireVerified = false
}: {
  children: ReactElement;
  roles?: UserRole[];
  requireVerified?: boolean;
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />;
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  if (requireVerified && !user.emailVerified) {
    return <Navigate to="/auth" replace state={{ from: location, reason: 'verify-email' }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/feed" replace />;
  }
  return children;
};

export default ProtectedRoute;

