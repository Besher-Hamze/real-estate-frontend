import { SelectFieldProps } from "@/lib/types";
import { ChevronDown } from "lucide-react";

export const SelectField: React.FC<SelectFieldProps> = ({ label, icon: Icon, value, onChange, options, className = '', enable = true }) => (
    <div className="relative group">
        <label className="block text-sm font-medium text-gray-700 mb-2 mr-1">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-600" />
                {label}
            </div>
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className={`w-full appearance-none bg-white text-gray-700 rounded-xl px-4 py-3 border border-gray-200 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200
                    hover:border-blue-300 ${className}`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
    </div>
);