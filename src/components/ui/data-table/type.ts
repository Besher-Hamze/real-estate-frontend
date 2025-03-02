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
  isLoading?: boolean;
  show?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
}
