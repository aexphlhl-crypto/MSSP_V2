import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { api } from '../../api/axios';
import { Building2, ChevronDown, Check } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
}

export const TenantSelector = () => {
  const { role } = useAuthStore();
  const { currentTenant, setTenant } = useTenantStore();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load tenants for PLATFORM_ADMIN
    if (role !== 'ROLE_PLATFORM_ADMIN') return;

    let isMounted = true;
    
    const loadTenants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/auth/tenants');
        const fetchedTenants: Tenant[] = response.data;
        
        if (isMounted) {
          setTenants(fetchedTenants);
          
          // Verify current tenant is still valid
          if (currentTenant) {
            const isValid = fetchedTenants.some(t => t.id === currentTenant.id);
            if (!isValid) {
              setTenant(null);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load tenants');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTenants();

    return () => { isMounted = false; };
  }, [role, currentTenant, setTenant]);

  if (role !== 'ROLE_PLATFORM_ADMIN') {
    return null;
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
          currentTenant 
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span className="truncate max-w-[150px]">
          {currentTenant ? currentTenant.name : 'Select Tenant'}
        </span>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-slate-200 z-50 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              Switch Tenant
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">Loading tenants...</div>
              ) : error ? (
                <div className="px-4 py-3 text-sm text-red-500 text-center">{error}</div>
              ) : tenants.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">No tenants available</div>
              ) : (
                <ul className="py-1">
                  {tenants.map(tenant => (
                    <li key={tenant.id}>
                      <button
                        onClick={() => {
                          setTenant(tenant);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="truncate">{tenant.name}</span>
                        {currentTenant?.id === tenant.id && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {currentTenant && (
              <div className="border-t border-slate-100 p-1">
                <button
                  onClick={() => {
                    setTenant(null);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded font-medium"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
