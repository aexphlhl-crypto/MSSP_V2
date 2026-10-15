import { create } from 'zustand';

interface Tenant {
  id: string;
  name: string;
}

interface TenantState {
  currentTenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenant: (() => {
    try {
      const stored = localStorage.getItem('selectedTenant');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  setTenant: (tenant) => {
    if (tenant) {
      localStorage.setItem('selectedTenant', JSON.stringify(tenant));
    } else {
      localStorage.removeItem('selectedTenant');
    }
    set({ currentTenant: tenant });
  },
  clearTenant: () => {
    localStorage.removeItem('selectedTenant');
    set({ currentTenant: null });
  },
}));
