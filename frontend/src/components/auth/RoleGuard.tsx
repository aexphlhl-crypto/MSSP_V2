import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectRoute?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  roles, 
  children, 
  fallback = null,
  redirectRoute 
}) => {
  const role = useAuthStore((state) => state.role);
  
  if (!role || !roles.includes(role)) {
    if (redirectRoute) {
      return <Navigate to={redirectRoute} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
