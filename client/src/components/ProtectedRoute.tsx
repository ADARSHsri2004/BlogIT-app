import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from './Spinner';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />;
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return children;
};

export default ProtectedRoute;

