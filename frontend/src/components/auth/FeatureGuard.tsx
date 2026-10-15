import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';

interface FeatureGuardProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectRoute?: string;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({ 
  featureKey, 
  children, 
  fallback = null, 
  redirectRoute 
}) => {
  const features = useAuthStore((state) => state.features);
  
  if (!features.includes(featureKey)) {
    if (redirectRoute) {
      return <Navigate to={redirectRoute} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
