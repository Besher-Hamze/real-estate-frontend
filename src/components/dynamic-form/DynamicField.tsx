import React from 'react';
import { ApiDynamicProperty } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FileIcon, Hash, Type, List, CheckSquare, X } from 'lucide-react';

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
    const renderField = () => {
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
                        <div className="grid grid-cols-2 gap-2">
                            {property.allowedValues?.map((option) => (
                                <label
                                    key={option}
                                    className={`
                                        flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all
                                        ${value === option 
                                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                                        ${error ? 'border-red-500' : ''}
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name={property.propertyKey}
                                        value={option}
                                        checked={value === option}
                                        onChange={(e) => onChange(e.target.value)}
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
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
                        
                        {/* خيارات الاختيار */}
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            {property.allowedValues?.map((option) => {
                                const isSelected = selectedValues.includes(option);
                                return (
                                    <label
                                        key={option}
                                        className={`
                                            flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all
                                            ${isSelected 
                                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                : 'border-gray-200 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => {
                                                let newValues;
                                                if (checked) {
                                                    newValues = [...selectedValues, option];
                                                } else {
                                                    newValues = selectedValues.filter(v => v !== option);
                                                }
                                                onChange(newValues);
                                            }}
                                        />
                                        <span className="text-sm">{option}</span>
                                    </label>
                                );
                            })}
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
            {renderField()}
            {error && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
};
