import { create } from 'zustand';

interface UserState {
  name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  tenantIdentifier: string | null;
  tenantName: string | null;
  setUser: (data: Partial<UserState>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: null,
  email: null,
  role: null,
  status: null,
  tenantIdentifier: null,
  tenantName: null,
  setUser: (data) => set((state) => ({ ...state, ...data })),
  clearUser: () => set({
    name: null,
    email: null,
    role: null,
    status: null,
    tenantIdentifier: null,
    tenantName: null
  })
}));
