// components/BulkActionsBar.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  itemName: {
    singular: string;
    plural: string;
  };
}

export function BulkActionsBar({ 
  selectedCount, 
  onClearSelection, 
  onDelete, 
  isDeleting,
  itemName
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;
  
  return (
    <div className="bg-blue-50 p-3 mb-4 rounded-lg flex items-center justify-between">
      <div className="text-blue-800">
        تم تحديد {selectedCount} {selectedCount === 1 ? itemName.singular : itemName.plural}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onClearSelection}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          إلغاء التحديد
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>جاري الحذف...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>حذف المحدد</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}