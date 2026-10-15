import React from 'react';
import { cn } from '../../lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ data, columns, keyExtractor, emptyMessage = "No data available", className, onRowClick }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/50">
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={cn("px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr 
                key={keyExtractor(item)} 
                onClick={() => onRowClick?.(item)}
                className={cn("transition-colors", onRowClick && "cursor-pointer hover:bg-slate-50/80")}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-6 py-4 whitespace-nowrap text-sm text-slate-700", col.className)}>
                    {col.render ? col.render(item) : String((item as any)[col.key] || '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
