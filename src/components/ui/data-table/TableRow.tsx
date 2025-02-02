import React from 'react';
import { Action, Column } from './type';

interface TableRowProps<T> {
    row: T;
    columns: Column<T>[];
    actions?: Action<T>[];
}

export function TableRow<T>({ row, columns, actions }: TableRowProps<T>) {
    return (
        <tr className="hover:bg-gray-50">
            {columns.map((column, index) => (
                <td key={index} className="px-6 py-4 whitespace-nowrap">
                    {column.cell ? (
                        column.cell(row)
                    ) : (
                        <div className="text-sm text-gray-900">
                            {String(row[column.accessorKey as keyof T])}
                        </div>
                    )}
                </td>
            ))}
            {actions && actions.length > 0 && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                        {actions.map((action, index) => (
                            action.show?.(row) !== false && (
                                <button
                                    key={index}
                                    className={`${action.color || 'text-blue-600'} hover:opacity-80`}
                                    onClick={() => action.onClick(row)}
                                    title={action.label}
                                    disabled={action.isLoading}
                                >
                                    {action.icon}
                                </button>
                            )
                        ))}
                    </div>
                </td>
            )}
        </tr>
    );
}
