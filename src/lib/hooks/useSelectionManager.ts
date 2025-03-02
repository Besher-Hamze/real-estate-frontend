// hooks/useSelectionManager.ts
import { useState } from 'react';

interface UseSelectionManagerProps<T> {
  items: T[] | undefined;
  idExtractor: (item: T) => number;
}

export function useSelectionManager<T>({ items, idExtractor }: UseSelectionManagerProps<T>) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toggleSelectItem = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!items) return;
    
    if (selectedIds.length === items.length) {
      // If all are selected, unselect all
      setSelectedIds([]);
    } else {
      // Otherwise, select all
      setSelectedIds(items.map(item => idExtractor(item)));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: number) => selectedIds.includes(id);
  const isAllSelected = items?.length ? selectedIds.length === items.length : false;
  const hasSelection = selectedIds.length > 0;

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    hasSelection,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    isBulkDeleting,
    setIsBulkDeleting
  };
}