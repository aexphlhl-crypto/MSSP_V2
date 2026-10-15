import { create } from 'zustand';
import { useTenantStore } from './tenantStore';

interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  tenantId: string | null;
  features: string[];
  setAuth: (token: string, email: string, role: string, tenantId: string) => void;
  setFeatures: (features: string[]) => void;
  logout: () => void;
  hasRole: (allowedRoles: string[]) => boolean;
  hasEntitlement: (feature: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  email: localStorage.getItem('email'),
  role: localStorage.getItem('role'),
  tenantId: localStorage.getItem('tenantId'),
  features: JSON.parse(localStorage.getItem('features') || '[]'),
  setAuth: (token, email, role, tenantId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
    localStorage.setItem('tenantId', tenantId);
    set({ token, email, role, tenantId });
  },
  setFeatures: (features) => {
    localStorage.setItem('features', JSON.stringify(features));
    set({ features });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('features');
    set({ token: null, email: null, role: null, tenantId: null, features: [] });
    useTenantStore.getState().clearTenant();
  },
  hasRole: (allowedRoles) => {
    const role = get().role;
    return role ? allowedRoles.includes(role) : false;
  },
  hasEntitlement: (feature) => {
    return get().features.includes(feature);
  },
}));
