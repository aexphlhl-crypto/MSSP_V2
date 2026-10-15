import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  status = 'default',
  className 
}) => {
  const iconColor = {
    success: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    danger: 'text-red-600 bg-red-50',
    info: 'text-blue-600 bg-blue-50',
    default: 'text-slate-600 bg-slate-50',
  }[status];

  return (
    <div className={cn("bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        </div>
        <div className={cn("p-2.5 rounded-lg", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn("font-medium", trend.isPositive ? "text-emerald-600" : "text-red-600")}>
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-slate-500 ml-1.5">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
};
