import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, action, children, className, bodyClassName }) => {
  return (
    <div className={cn("bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden", className)}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-5 w-5 text-slate-500" />}
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={cn("p-0", bodyClassName)}>
        {children}
      </div>
    </div>
  );
};
