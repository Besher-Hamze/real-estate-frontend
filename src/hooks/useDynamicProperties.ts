import { useState, useEffect } from 'react';
import { ApiDynamicProperty, GroupedProperties, ApiPropertyGroup, DynamicFormData } from '@/lib/types';
import { DynamicPropertiesApi } from '@/api/dynamicPropertiesApi';

export const useDynamicProperties = (finalTypeId: number | null) => {
    const [properties, setProperties] = useState<ApiDynamicProperty[]>([]);
    const [groupedProperties, setGroupedProperties] = useState<GroupedProperties>({});
    const [propertyGroups, setPropertyGroups] = useState<ApiPropertyGroup[]>([]);
    const [filterProperties, setFilterProperties] = useState<ApiDynamicProperty[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // جلب الخصائص بناءً على finalTypeId
    const fetchProperties = async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            const [propertiesData, groupsData, filtersData] = await Promise.all([
                DynamicPropertiesApi.fetchPropertiesByFinalType(id),
                DynamicPropertiesApi.fetchPropertyGroups(id),
                DynamicPropertiesApi.fetchPropertiesByFinalType(id)
            ]);

            setProperties(propertiesData);
            setPropertyGroups(groupsData);
            setFilterProperties(filtersData);

            // تجميع الخصائص حسب المجموعات
            const grouped = DynamicPropertiesApi.groupPropertiesByGroup(propertiesData);
            setGroupedProperties(grouped);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    // تحديث البيانات عند تغيير finalTypeId
    useEffect(() => {
        if (finalTypeId) {
            fetchProperties(finalTypeId);
        } else {
            // إعادة تعيين البيانات إذا لم يكن هناك finalTypeId
            setProperties([]);
            setGroupedProperties({});
            setPropertyGroups([]);
            setFilterProperties([]);
        }
    }, [finalTypeId]);

    // دالة لإعادة تحديث البيانات
    const refetch = () => {
        if (finalTypeId) {
            fetchProperties(finalTypeId);
        }
    };

    // دالة للحصول على خاصية معينة بواسطة propertyKey
    const getPropertyByKey = (propertyKey: string): ApiDynamicProperty | undefined => {
        return properties.find(prop => prop.propertyKey === propertyKey);
    };

    // دالة للحصول على القيمة الافتراضية لخاصية معينة
    const getDefaultValue = (property: ApiDynamicProperty): any => {
        switch (property.dataType) {
            case 'boolean':
                return false;
            case 'number':
                return '';
            case 'multiple_choice':
                return [];
            case 'single_choice':
                return '';
            case 'date':
                return '';
            case 'file':
                return null;
            case 'text':
            default:
                return '';
        }
    };

    // دالة لإنشاء كائن البيانات الأولية للنموذج
    const getInitialFormData = (): DynamicFormData => {
        const initialData: DynamicFormData = {};
        properties.forEach(property => {
            initialData[property.propertyKey] = getDefaultValue(property);
        });
        return initialData;
    };

    // دالة للتحقق من صحة البيانات
    const validateFormData = (formData: DynamicFormData): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        properties.forEach(property => {
            const value = formData[property.propertyKey];

            // التحقق من الحقول المطلوبة
            if (property.isRequired && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
                errors.push(`${property.propertyName} مطلوب`);
            }

            // التحقق من نوع البيانات
            if (value !== null && value !== undefined && value !== '') {
                switch (property.dataType) {
                    case 'number':
                        if (isNaN(Number(value))) {
                            errors.push(`${property.propertyName} يجب أن يكون رقمًا`);
                        }
                        break;
                    case 'single_choice':
                        if (property.allowedValues && !property.allowedValues.includes(value)) {
                            errors.push(`قيمة غير صحيحة لـ ${property.propertyName}`);
                        }
                        break;
                    case 'multiple_choice':
                        if (Array.isArray(value) && property.allowedValues) {
                            const invalidValues = value.filter(v => !property.allowedValues!.includes(v));
                            if (invalidValues.length > 0) {
                                errors.push(`قيم غير صحيحة لـ ${property.propertyName}: ${invalidValues.join(', ')}`);
                            }
                        }
                        break;
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    return {
        properties,
        groupedProperties,
        propertyGroups,
        filterProperties,
        loading,
        error,
        refetch,
        getPropertyByKey,
        getDefaultValue,
        getInitialFormData,
        validateFormData
    };
};

// Hook منفصل لإدارة نموذج الخصائص الديناميكية
export const useDynamicForm = (finalTypeId: number | null, initialData?: DynamicFormData) => {
    const { properties, groupedProperties, loading, error, getInitialFormData, validateFormData } = useDynamicProperties(finalTypeId);
    const [formData, setFormData] = useState<DynamicFormData>(initialData || {});
    const [errors, setErrors] = useState<string[]>([]);

    // تحديث البيانات الأولية عند تغيير الخصائص
    useEffect(() => {
        if (properties.length > 0 && Object.keys(formData).length === 0) {
            const initial = initialData || getInitialFormData();
            setFormData(initial);
        }
    }, [properties, initialData]);

    // دالة لتحديث قيمة حقل معين
    const updateField = (propertyKey: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [propertyKey]: value
        }));
        // مسح الأخطاء عند التحديث
        setErrors([]);
    };

    // دالة لتحديث عدة حقول مرة واحدة
    const updateFields = (updates: Partial<DynamicFormData>) => {
        setFormData(prev => ({
            ...prev,
            ...updates
        }));
        setErrors([]);
    };

    // دالة للتحقق من صحة النموذج
    const validate = (): boolean => {
        const validation = validateFormData(formData);
        setErrors(validation.errors);
        return validation.isValid;
    };

    // دالة لإعادة تعيين النموذج
    const reset = () => {
        setFormData(initialData || getInitialFormData());
        setErrors([]);
    };

    // دالة للحصول على قيمة حقل معين
    const getFieldValue = (propertyKey: string): any => {
        return formData[propertyKey];
    };

    return {
        formData,
        groupedProperties,
        properties,
        errors,
        loading,
        error,
        updateField,
        updateFields,
        validate,
        reset,
        getFieldValue,
        isValid: errors.length === 0
    };
};
