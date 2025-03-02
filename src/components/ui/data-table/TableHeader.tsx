import React from 'react';
import { Column } from './type';

interface TableHeaderProps<T> {
  columns: Column<T>[];
  hasActions?: boolean;
}

export function TableHeader<T>({ columns, hasActions }: TableHeaderProps<T>) {
  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            scope="col"
            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {typeof column.header === 'function' ? column.header() : column.header}
          </th>
        ))}
        {hasActions && (
          <th
            scope="col"
            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            الإجراءات
          </th>
        )}
      </tr>
    </thead>
  );
}