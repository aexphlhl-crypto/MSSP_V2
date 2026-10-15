import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Server, 
  Shield, 
  Save, 
  Activity, 
  CreditCard,
  Settings,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Database,
  FileText,
  BarChart3
} from 'lucide-react';
import clsx from 'clsx';
import { FeatureGuard } from '../auth/FeatureGuard';
import { RoleGuard } from '../auth/RoleGuard';

type NavItem = {
  name: string;
  path: string;
  icon: any;
  feature?: string;
  roles?: string[];
};

type NavGroup = {
  label: string;
  feature?: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: '',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Operations',
    feature: 'TICKETING', 
    items: [
      { name: 'Tickets', path: '/tickets', icon: Ticket, feature: 'TICKETING' },
      { name: 'Sites', path: '/sites', icon: Server, feature: 'MONITORING_BASIC' },
      { name: 'Devices', path: '/devices', icon: Server, feature: 'MONITORING_BASIC' },
      { name: 'Alerts', path: '/alerts', icon: Activity, feature: 'MONITORING_ALERTS' },
      { name: 'SLA Commitments', path: '/sla', icon: ShieldCheck, feature: 'TICKETING' },
    ]
  },
  {
    label: 'Security',
    feature: 'SECURITY_BASIC',
    items: [
      { name: 'Security Overview', path: '/security', icon: Shield, feature: 'SECURITY_BASIC' },
      { name: 'Security Events', path: '/security/events', icon: ShieldAlert, feature: 'SECURITY_ALERTS' },
      { name: 'Vulnerabilities', path: '/security/vulnerabilities', icon: AlertTriangle, feature: 'SECURITY_VULNERABILITY' },
      { name: 'Endpoints', path: '/security/endpoints', icon: ShieldCheck, feature: 'SECURITY_ENDPOINT' },
    ]
  },
  {
    label: 'Backup',
    feature: 'BACKUP_BASIC',
    items: [
      { name: 'Backup Overview', path: '/backup', icon: Save, feature: 'BACKUP_BASIC' },
      { name: 'Backup Jobs', path: '/backup/jobs', icon: Activity, feature: 'BACKUP_JOBS' },
      { name: 'Repositories', path: '/backup/repositories', icon: Database, feature: 'BACKUP_JOBS' },
      { name: 'Backup Alerts', path: '/backup/alerts', icon: AlertTriangle, feature: 'BACKUP_ALERTS' },
    ]
  },
  {
    label: 'System',
    items: [
      { name: 'Billing', path: '/billing', icon: CreditCard, feature: 'BILLING' },
      { name: 'Contracts', path: '/contracts', icon: FileText, roles: ['ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN'] },
      { name: 'Plan Usage', path: '/usage', icon: BarChart3, roles: ['ROLE_PLATFORM_ADMIN', 'ROLE_PLATFORM_TECH', 'ROLE_CUSTOMER_ADMIN'] },
      { name: 'Providers', path: '/settings/providers', icon: Settings, roles: ['ROLE_PLATFORM_ADMIN'] },
      { name: 'Settings', path: '/settings', icon: Settings, roles: ['ROLE_PLATFORM_ADMIN', 'ROLE_CUSTOMER_ADMIN'] },
    ]
  }
];

export const Sidebar = () => {
  return (
    <aside className="w-[260px] bg-[#1e293b] text-slate-300 flex flex-col h-full shrink-0 shadow-xl z-20 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50 bg-[#0f172a]/50 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Server className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-wide">MSP Portal</span>
        </div>
      </div>
      
      <nav className="flex-1 py-5 px-3 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => {
          const groupContent = (
            <div key={idx} className="space-y-1.5">
              {group.label && (
                <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                let navLink = (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/security' || item.path === '/backup'}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-blue-600/10 text-blue-400'
                          : 'hover:bg-slate-800/80 hover:text-white text-slate-400'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center">
                          <item.icon
                            className={clsx(
                              "mr-3 flex-shrink-0 h-[18px] w-[18px] transition-colors",
                              isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4 text-blue-500 opacity-80" />}
                      </>
                    )}
                  </NavLink>
                );

                if (item.feature) {
                  navLink = <FeatureGuard key={`feat-${item.name}`} featureKey={item.feature}>{navLink}</FeatureGuard>;
                }
                if (item.roles) {
                  navLink = <RoleGuard key={`role-${item.name}`} roles={item.roles}>{navLink}</RoleGuard>;
                }
                return <React.Fragment key={item.name}>{navLink}</React.Fragment>;
              })}
            </div>
          );

          if (group.feature) {
             return (
               <FeatureGuard key={`group-${idx}`} featureKey={group.feature}>
                 {groupContent}
               </FeatureGuard>
             );
          }
          return groupContent;
        })}
      </nav>
    </aside>
  );
};
