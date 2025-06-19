import React, { useState } from 'react';
import { ApiDynamicProperty } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { CalendarIcon, FileIcon, Hash, Type, List, CheckSquare, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicFieldProps {
    property: ApiDynamicProperty;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
    property,
    value,
    onChange,
    error
}) => {
    const [open, setOpen] = useState(false);

    const RenderField = () => {
        switch (property.dataType) {
            case 'text':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={property.propertyKey} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Type className="w-4 h-4 text-blue-500" />
                            {property.propertyName}
                            {property.isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <Textarea
                            id={property.propertyKey}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={property.placeholder || `أدخل ${property.propertyName}`}
                            className={`min-h-[80px] ${error ? 'border-red-500' : ''}`}
                        />
                    </div>
                );

            case 'number':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={property.propertyKey} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-green-500" />
                            {property.propertyName}
                            {property.isRequired && <span className="text-red-500">*</span>}
                            {property.unit && <span className="text-gray-500 text-xs">({property.unit})</span>}
                        </Label>
                        <Input
                            id={property.propertyKey}
                            type="number"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={property.placeholder || `أدخل ${property.propertyName}`}
                            className={error ? 'border-red-500' : ''}
                        />
                    </div>
                );

            case 'single_choice':
                return (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <List className="w-4 h-4 text-purple-500" />
                            {property.propertyName}
                            {property.isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <Select value={value || ''} onValueChange={onChange}>
                            <SelectTrigger className={cn("w-full", error && "border-red-500")}>
                                <SelectValue placeholder={property.placeholder || `اختر ${property.propertyName}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {property.allowedValues?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );

            case 'multiple_choice':
                const selectedValues = Array.isArray(value) ? value : [];

                return (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-orange-500" />
                            {property.propertyName}
                            {property.isRequired && <span className="text-red-500">*</span>}
                        </Label>

                        {/* عرض القيم المختارة */}
                        {selectedValues.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedValues.map((selectedValue) => (
                                    <Badge key={selectedValue} variant="secondary" className="flex items-center gap-1">
                                        {selectedValue}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newValues = selectedValues.filter(v => v !== selectedValue);
                                                onChange(newValues);
                                            }}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Multi-select dropdown using native select with custom styling */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpen(!open)}
                                className={cn(
                                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                    error && "border-red-500"
                                )}
                            >
                                <span className="text-muted-foreground">
                                    {selectedValues.length === 0
                                        ? (property.placeholder || `اختر ${property.propertyName}`)
                                        : `تم اختيار ${selectedValues.length} عنصر`
                                    }
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </button>

                            {open && (
                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                                    <div className="max-h-64 overflow-auto p-1">
                                        {property.allowedValues?.map((option) => {
                                            const isSelected = selectedValues.includes(option);
                                            return (
                                                <div
                                                    key={option}
                                                    onClick={() => {
                                                        let newValues;
                                                        if (isSelected) {
                                                            newValues = selectedValues.filter(v => v !== option);
                                                        } else {
                                                            newValues = [...selectedValues, option];
                                                        }
                                                        onChange(newValues);
                                                    }}
                                                    className={cn(
                                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                        isSelected && "bg-accent text-accent-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-4 h-4 border rounded flex items-center justify-center",
                                                            isSelected ? "bg-primary border-primary" : "border-input"
                                                        )}>
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span>{option}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Overlay to close dropdown when clicking outside */}
                            {open && (
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                );

            case 'boolean':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id={property.propertyKey}
                                checked={Boolean(value)}
                                onCheckedChange={(checked) => onChange(checked)}
                            />
                            <Label htmlFor={property.propertyKey} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-green-500" />
                                {property.propertyName}
                                {property.isRequired && <span className="text-red-500">*</span>}
                            </Label>
                        </div>
                    </div>
                );

            case 'date':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={property.propertyKey} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-indigo-500" />
                            {property.propertyName}
                            {property.isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={property.propertyKey}
                            type="date"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={error ? 'border-red-500' : ''}
                        />
                    </div>
                );

            case 'file':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={property.propertyKey} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FileIcon className="w-4 h-4 text-red-500" />
                            {property.propertyName}
                            {property.isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={property.propertyKey}
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                onChange(file);
                            }}
                            className={error ? 'border-red-500' : ''}
                            accept={property.allowedValues?.extensions?.join(',') || '*'}
                        />
                        {property.allowedValues?.extensions && (
                            <p className="text-xs text-gray-500">
                                الصيغ المسموحة: {property.allowedValues.extensions.join(', ')}
                            </p>
                        )}
                        {value && (
                            <p className="text-xs text-green-600">
                                ملف مختار: {value.name}
                            </p>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="space-y-2">
                        <Label htmlFor={property.propertyKey} className="text-sm font-medium text-gray-700">
                            {property.propertyName}
                            {property.isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={property.propertyKey}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={property.placeholder || `أدخل ${property.propertyName}`}
                            className={error ? 'border-red-500' : ''}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            {RenderField()}
            {error && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
};