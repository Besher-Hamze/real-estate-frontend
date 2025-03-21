import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronsLeftRight, Building } from 'lucide-react';

interface RangeDropdownProps {
    label: string;
    icon: React.ElementType;
    minValue: string;
    maxValue: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
    placeholder?: {
        min: string;
        max: string;
    };
    suffix?: string;
    className?: string;
}

export const RangeDropdown: React.FC<RangeDropdownProps> = ({
    label,
    icon: Icon,
    minValue,
    maxValue,
    onMinChange,
    onMaxChange,
    placeholder = { min: 'من', max: 'إلى' },
    suffix = '',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const selectedRangeText = () => {
        if (minValue && maxValue) {
            return `${minValue} - ${maxValue}${suffix ? ' ' + suffix : ''}`;
        } else if (minValue) {
            return `من ${minValue}${suffix ? ' ' + suffix : ''}`;
        } else if (maxValue) {
            return `إلى ${maxValue}${suffix ? ' ' + suffix : ''}`;
        }
        return 'الكل';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2 mr-1">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-blue-600" />
                    {label}
                </div>
            </label>

            <div
                className="w-full bg-white text-gray-700 rounded-xl px-4 py-3 border border-gray-200 
          hover:border-blue-300 cursor-pointer flex justify-between items-center"
                onClick={toggleDropdown}
            >
                <span className={`${(!minValue && !maxValue) ? 'text-gray-500' : 'text-gray-800'}`}>
                    {selectedRangeText()}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </div>

            {isOpen && (
                <div className="absolute z-[101] mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 py-2 px-3">
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">{placeholder.min}</label>
                            <input
                                type="text"
                                value={minValue}
                                onChange={(e) => onMinChange(e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                placeholder={placeholder.min}
                                dir="rtl"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">{placeholder.max}</label>
                            <input
                                type="text"
                                value={maxValue}
                                onChange={(e) => onMaxChange(e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                placeholder={placeholder.max}
                                dir="rtl"
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export const PriceRangeDropdown: React.FC<{
    minPrice: string;
    maxPrice: string;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
}> = ({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }) => {
    return (
        <RangeDropdown
            label="نطاق السعر"
            icon={ChevronsLeftRight}
            minValue={minPrice}
            maxValue={maxPrice}
            onMinChange={onMinPriceChange}
            onMaxChange={onMaxPriceChange}
            placeholder={{ min: 'الحد الأدنى للسعر', max: 'الحد الأقصى للسعر' }}
            suffix="ر.ع"
        />
    );
};

export const AreaRangeDropdown: React.FC<{
    minArea: string;
    maxArea: string;
    onMinAreaChange: (value: string) => void;
    onMaxAreaChange: (value: string) => void;
}> = ({ minArea, maxArea, onMinAreaChange, onMaxAreaChange }) => {
    return (
        <RangeDropdown
            label="المساحة"
            icon={Building}
            minValue={minArea}
            maxValue={maxArea}
            onMinChange={onMinAreaChange}
            onMaxChange={onMaxAreaChange}
            placeholder={{ min: 'الحد الأدنى للمساحة', max: 'الحد الأقصى للمساحة' }}
            suffix="متر مربع"
        />
    );
};