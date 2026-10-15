import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { LogOut, User, Bell, Search, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { TenantSelector } from './TenantSelector';

const roleMap: Record<string, string> = {
  'ROLE_PLATFORM_ADMIN': 'Platform Admin',
  'ROLE_PLATFORM_TECH': 'Platform Tech',
  'ROLE_CUSTOMER_ADMIN': 'Customer Admin',
  'ROLE_CUSTOMER_TECH': 'Customer Tech',
  'ROLE_CUSTOMER_READONLY': 'Read-Only',
};

export const Header = () => {
  const { email, role, logout } = useAuthStore();
  const { name } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPath = location.pathname.substring(1);
  const title = currentPath.split('/')[0].charAt(0).toUpperCase() + currentPath.split('/')[0].slice(1);
  const displayRole = role ? (roleMap[role] || role) : 'User';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center space-x-6 flex-1">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{title || 'Dashboard'}</h2>
        
        <div className="hidden md:flex relative max-w-md w-full ml-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search devices, tickets, alerts..."
          />
        </div>
        <div className="hidden md:block ml-4">
          <TenantSelector />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 ml-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors hidden sm:block">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-700 leading-tight">{name || email}</span>
            <span className="text-xs text-slate-500 mt-0.5">{displayRole}</span>
          </div>
          <Link to="/profile" className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 hover:bg-blue-100 transition-colors">
            <User className="h-5 w-5 text-blue-600" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 ml-1"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
