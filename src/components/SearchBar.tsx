import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = 'ابحث...',
    className = '',
}) => {
    return (
        <div className={`relative ${className}`}>
            <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                aria-hidden="true"
            />
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                className="pr-10 pl-4 py-3 text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search input"
                dir="rtl"
            />
        </div>
    );
};