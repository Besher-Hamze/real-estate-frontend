import React from 'react';
import { GroupedProperties, DynamicFormData } from '@/lib/types';
import { DynamicField } from './DynamicField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FolderIcon, AlertCircle } from 'lucide-react';

interface DynamicFormProps {
    groupedProperties: GroupedProperties;
    formData: DynamicFormData;
    onChange: (propertyKey: string, value: any) => void;
    errors?: string[];
    className?: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
    groupedProperties,
    formData,
    onChange,
    errors = [],
    className = ''
}) => {
    const groupNames = Object.keys(groupedProperties);
    
    if (groupNames.length === 0) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد خصائص متاحة لهذا النوع</p>
            </div>
        );
    }

    // تجميع الأخطاء حسب propertyKey
    const fieldErrors: { [key: string]: string } = {};
    errors.forEach(error => {
        // محاولة استخراج propertyKey من رسالة الخطأ
        const match = error.match(/(.+) مطلوب|قيمة غير صحيحة لـ (.+)|قيم غير صحيحة لـ (.+):/);
        if (match) {
            const fieldName = match[1] || match[2] || match[3];
            // البحث عن الحقل المطابق
            Object.values(groupedProperties).flat().forEach(property => {
                if (property.propertyName === fieldName) {
                    fieldErrors[property.propertyKey] = error;
                }
            });
        }
    });

    return (
        <div className={`space-y-6 ${className}`}>
            {groupNames.map((groupName) => {
                const properties = groupedProperties[groupName];
                const displayGroupName = groupName || 'معلومات عامة';
                
                return (
                    <Card key={groupName} className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FolderIcon className="w-5 h-5 text-blue-500" />
                                {displayGroupName}
                                <Badge variant="outline" className="text-xs">
                                    {properties.length} حقل
                                </Badge>
                            </CardTitle>
                            <Separator />
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {properties.map((property) => (
                                    <div key={property.id} className="space-y-2">
                                        <DynamicField
                                            property={property}
                                            value={formData[property.propertyKey]}
                                            onChange={(value) => onChange(property.propertyKey, value)}
                                            error={fieldErrors[property.propertyKey]}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
            
            {/* عرض الأخطاء العامة */}
            {errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800 mb-2">
                                    يرجى تصحيح الأخطاء التالية:
                                </h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index} className="text-sm text-red-700">
                                            {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
