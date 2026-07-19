'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  isLoading = false,
  emptyMessage = "Tidak ada data."
}: DataTableProps<T>) {
  
  if (isLoading) {
    return (
      <div className="w-full glass-panel rounded-xl overflow-hidden shadow-xl relative">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        <div className="p-12 flex flex-col items-center justify-center text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-cyan-500" />
          <p className="font-medium tracking-wide">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full glass-panel rounded-xl overflow-hidden shadow-xl relative">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        <div className="p-12 flex flex-col items-center justify-center text-zinc-500">
          <p className="font-medium tracking-wide">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full glass-panel rounded-xl overflow-hidden overflow-x-auto shadow-xl relative">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      <table className="w-full text-sm text-left">
        <thead className="text-[11px] tracking-wider text-zinc-500 uppercase bg-white/5 border-b border-white/5">
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" className={`px-6 py-4 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(6,182,212,0.1)] transition-all duration-300 group">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
                  {col.cell 
                    ? col.cell(item) 
                    : col.accessorKey 
                      ? (item[col.accessorKey] as ReactNode)
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
