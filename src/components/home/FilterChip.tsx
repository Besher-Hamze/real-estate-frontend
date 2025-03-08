import { FilterChipProps } from "@/lib/types";
import { X } from "lucide-react";

export const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => (
    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
        {label}
        <button onClick={onRemove} className="hover:text-blue-900">
            <X className="w-4 h-4" />
        </button>
    </span>
);
