import { useState, useEffect, useCallback } from 'react';
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
    const refetch = useCallback(() => {
        if (finalTypeId) {
            fetchProperties(finalTypeId);
        }
    }, [finalTypeId]);

    // دالة للحصول على خاصية معينة بواسطة propertyKey
    const getPropertyByKey = useCallback((propertyKey: string): ApiDynamicProperty | undefined => {
        return properties.find(prop => prop.propertyKey === propertyKey);
    }, [properties]);

    // دالة للحصول على القيمة الافتراضية لخاصية معينة
    const getDefaultValue = useCallback((property: ApiDynamicProperty): any => {
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
    }, []);

    // دالة لإنشاء كائن البيانات الأولية للنموذج
    const getInitialFormData = useCallback((): DynamicFormData => {
        const initialData: DynamicFormData = {};
        properties.forEach(property => {
            initialData[property.propertyKey] = getDefaultValue(property);
        });
        return initialData;
    }, [properties, getDefaultValue]);

    // دالة للتحقق من صحة البيانات
    const validateFormData = useCallback((formData: DynamicFormData): { isValid: boolean; errors: string[] } => {
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
    }, [properties]);

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
    const {
        properties,
        groupedProperties,
        loading,
        error,
        getInitialFormData,
        validateFormData
    } = useDynamicProperties(finalTypeId);

    const [formData, setFormData] = useState<DynamicFormData>(initialData || {});
    const [errors, setErrors] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // تحديث البيانات الأولية عند تغيير الخصائص أو البيانات الأولية
    useEffect(() => {
        if (properties.length > 0) {
            if (initialData && Object.keys(initialData).length > 0) {
                // إذا كانت هناك بيانات أولية (وضع التعديل)
                setFormData(initialData);
                setIsInitialized(true);
            } else if (!isInitialized) {
                // إذا لم تكن هناك بيانات أولية (وضع الإنشاء)
                const initial = getInitialFormData();
                setFormData(initial);
                setIsInitialized(true);
            }
        }
    }, [properties, initialData, getInitialFormData, isInitialized]);

    // دالة لتعيين بيانات النموذج بالكامل (مفيدة لوضع التعديل)
    const setFormDataManually = useCallback((data: DynamicFormData) => {
        setFormData(data);
        setErrors([]);
        setIsInitialized(true);
    }, []);

    // دالة لتحديث قيمة حقل معين
    const updateField = useCallback((propertyKey: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [propertyKey]: value
        }));
        // مسح الأخطاء عند التحديث
        setErrors([]);
    }, []);

    // دالة لتحديث عدة حقول مرة واحدة
    const updateFields = useCallback((updates: Partial<DynamicFormData>) => {
        setFormData(prev => ({
            ...prev,
            ...updates
        }));
        setErrors([]);
    }, []);

    // دالة للتحقق من صحة النموذج
    const validate = useCallback((): boolean => {
        const validation = validateFormData(formData);
        setErrors(validation.errors);
        return validation.isValid;
    }, [formData, validateFormData]);

    // دالة لإعادة تعيين النموذج
    const reset = useCallback(() => {
        const resetData = initialData || getInitialFormData();
        setFormData(resetData);
        setErrors([]);
        setIsInitialized(true);
    }, [initialData, getInitialFormData]);

    // دالة للحصول على قيمة حقل معين
    const getFieldValue = useCallback((propertyKey: string): any => {
        return formData[propertyKey];
    }, [formData]);

    // دالة للتحقق من وجود أخطاء في حقل معين
    const getFieldError = useCallback((propertyKey: string): string | undefined => {
        const property = properties.find(p => p.propertyKey === propertyKey);
        if (!property) return undefined;

        return errors.find(error => error.includes(property.propertyName));
    }, [errors, properties]);

    // دالة للتحقق من صحة حقل معين
    const validateField = useCallback((propertyKey: string): { isValid: boolean; error?: string } => {
        const property = properties.find(p => p.propertyKey === propertyKey);
        if (!property) return { isValid: true };

        const value = formData[propertyKey];

        // التحقق من الحقول المطلوبة
        if (property.isRequired && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
            return { isValid: false, error: `${property.propertyName} مطلوب` };
        }

        // التحقق من نوع البيانات
        if (value !== null && value !== undefined && value !== '') {
            switch (property.dataType) {
                case 'number':
                    if (isNaN(Number(value))) {
                        return { isValid: false, error: `${property.propertyName} يجب أن يكون رقمًا` };
                    }
                    break;
                case 'single_choice':
                    if (property.allowedValues && !property.allowedValues.includes(value)) {
                        return { isValid: false, error: `قيمة غير صحيحة لـ ${property.propertyName}` };
                    }
                    break;
                case 'multiple_choice':
                    if (Array.isArray(value) && property.allowedValues) {
                        const invalidValues = value.filter(v => !property.allowedValues!.includes(v));
                        if (invalidValues.length > 0) {
                            return {
                                isValid: false,
                                error: `قيم غير صحيحة لـ ${property.propertyName}: ${invalidValues.join(', ')}`
                            };
                        }
                    }
                    break;
            }
        }

        return { isValid: true };
    }, [properties, formData]);

    // دالة للحصول على جميع الحقول المطلوبة
    const getRequiredFields = useCallback((): ApiDynamicProperty[] => {
        return properties.filter(prop => prop.isRequired);
    }, [properties]);

    // دالة للتحقق من اكتمال النموذج
    const isFormComplete = useCallback((): boolean => {
        const requiredFields = getRequiredFields();
        return requiredFields.every(field => {
            const value = formData[field.propertyKey];
            return value !== null && value !== undefined && value !== '' &&
                !(Array.isArray(value) && value.length === 0);
        });
    }, [formData, getRequiredFields]);

    return {
        formData,
        groupedProperties,
        properties,
        errors,
        loading,
        error,
        isInitialized,
        updateField,
        updateFields,
        validate,
        reset,
        getFieldValue,
        getFieldError,
        validateField,
        getRequiredFields,
        isFormComplete,
        setFormData: setFormDataManually,  // إضافة دالة setFormData
        isValid: errors.length === 0
    };
};