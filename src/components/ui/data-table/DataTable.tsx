import React from 'react';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import Spinner from '../Spinner';
import ErrorFallback from '../ErrorFallback';

export interface Column<T> {
  header: string | (() => React.ReactNode);
  accessorKey: string;
  cell: (row: T) => React.ReactNode;
}

export interface Action<T> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  color?: string;
  show?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  rowClassName?: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  actions,
  isLoading,
  error,
  onRefresh,
  rowClassName
}: DataTableProps<T>) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorFallback onRefresh={onRefresh} />;

  return (
    <div className="relative  shadow-md sm:rounded-lg" dir="rtl">
      <table className="min-w-full text-sm text-gray-700">
        <TableHeader columns={columns} hasActions={!!actions?.length} />
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <TableRow
              key={index}
              row={row}
              columns={columns}
              actions={actions}
              className={rowClassName ? rowClassName(row) : ''}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}