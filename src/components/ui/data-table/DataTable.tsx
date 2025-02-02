import React from 'react';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import Spinner from '../Spinner';
import ErrorFallback from '../ErrorFallback';
import { DataTableProps } from './type';

export function DataTable<T>({
  data,
  columns,
  actions,
  isLoading,
  error,
  onRefresh
}: DataTableProps<T>) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorFallback onRefresh={onRefresh} />;

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg" dir="rtl">
      <table className="min-w-full text-sm text-gray-700">
        <TableHeader columns={columns} hasActions={!!actions?.length} />
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <TableRow
              key={index}
              row={row}
              columns={columns}
              actions={actions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
