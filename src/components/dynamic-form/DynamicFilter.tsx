import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DynamicField } from './DynamicField';
import { useDynamicProperties } from '@/hooks/useDynamicProperties';
import { DynamicFormData, ApiDynamicProperty, MainType, SubType, FinalType } from '@/lib/types';
import { Filter, X, Search, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { mainTypeApi } from '@/api/mainTypeApi';
import { finalTypeTypeApi } from '@/api/finalTypeApi';

interface DynamicFilterProps {
    onFilterChange: (filters: DynamicFormData & {
        mainTypeId?: number;
        subTypeId?: number;
        finalTypeId?: number;
        minPrice?: number;
        maxPrice?: number;
    }) => void;
    className?: string;
}

export const DynamicFilter: React.FC<DynamicFilterProps> = ({
    onFilterChange,
    className = ''
}) => {
    const [mainTypes, setMainTypes] = useState<MainType[]>([]);
    const [selectedMainType, setSelectedMainType] = useState<MainType | null>(null);
    const [selectedSubType, setSelectedSubType] = useState<SubType | null>(null);
    const [selectedFinalType, setSelectedFinalType] = useState<FinalType | null>(null);
    const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [isOpen, setIsOpen] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [dynamicFilters, setDynamicFilters] = useState<DynamicFormData>({});

    // استخدام hook للخصائص الديناميكية (الخصائص التي تستخدم في الفلترة فقط)
    const {
        properties: filterProperties,
        loading: propertiesLoading
    } = useDynamicProperties(selectedFinalType?.id || null);

    // جلب الأنواع الرئيسية عند التحميل
    useEffect(() => {
        const fetchMainTypes = async () => {
            try {
                const data = await mainTypeApi.fetchMainType();
                setMainTypes(data);
            } catch (error) {
                console.error('Error fetching main types:', error);
            }
        };

        fetchMainTypes();
    }, []);

    // جلب الأنواع النهائية عند اختيار نوع فرعي
    useEffect(() => {
        if (selectedSubType) {
            const fetchFinalTypes = async () => {
                try {
                    const data = await finalTypeTypeApi.fetchFinalTypeBySubId(selectedSubType.id);
                    setFinalTypes(data);
                } catch (error) {
                    console.error('Error fetching final types:', error);
                    setFinalTypes([]);
                }
            };

            fetchFinalTypes();
        } else {
            setFinalTypes([]);
            setSelectedFinalType(null);
        }
    }, [selectedSubType]);

    // حساب عدد الفلاتر النشطة
    useEffect(() => {
        let count = 0;

        if (selectedMainType) count++;
        if (selectedSubType) count++;
        if (selectedFinalType) count++;
        if (priceRange.min) count++;
        if (priceRange.max) count++;

        // عد الفلاتر الديناميكية النشطة
        Object.values(dynamicFilters).forEach(value => {
            if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                count++;
            }
        });

        setActiveFiltersCount(count);
    }, [selectedMainType, selectedSubType, selectedFinalType, priceRange, dynamicFilters]);

    // إرسال الفلاتر عند التغيير
    useEffect(() => {
        const filters = {
            ...dynamicFilters,
            mainTypeId: selectedMainType?.id,
            subTypeId: selectedSubType?.id,
            finalTypeId: selectedFinalType?.id,
            minPrice: priceRange.min ? Number(priceRange.min) : undefined,
            maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
        };

        onFilterChange(filters);
    }, [selectedMainType, selectedSubType, selectedFinalType, priceRange, dynamicFilters, onFilterChange]);

    // معالجة اختيار النوع الرئيسي
    const handleMainTypeSelect = (mainType: MainType) => {
        setSelectedMainType(mainType);
        setSelectedSubType(null);
        setSelectedFinalType(null);
        setDynamicFilters({});
    };

    // معالجة اختيار النوع الفرعي
    const handleSubTypeSelect = (subType: SubType) => {
        setSelectedSubType(subType);
        setSelectedFinalType(null);
        setDynamicFilters({});
    };

    // معالجة اختيار النوع النهائي
    const handleFinalTypeSelect = (finalType: FinalType) => {
        setSelectedFinalType(finalType);
        setDynamicFilters({});
    };

    // معالجة تغيير الفلتر الديناميكي
    const handleDynamicFilterChange = (propertyKey: string, value: any) => {
        setDynamicFilters(prev => ({
            ...prev,
            [propertyKey]: value
        }));
    };

    // مسح جميع الفلاتر
    const clearAllFilters = () => {
        setSelectedMainType(null);
        setSelectedSubType(null);
        setSelectedFinalType(null);
        setPriceRange({ min: '', max: '' });
        setDynamicFilters({});
    };

    // مسح فلتر معين
    const clearFilter = (filterType: string, propertyKey?: string) => {
        switch (filterType) {
            case 'mainType':
                setSelectedMainType(null);
                setSelectedSubType(null);
                setSelectedFinalType(null);
                setDynamicFilters({});
                break;
            case 'subType':
                setSelectedSubType(null);
                setSelectedFinalType(null);
                setDynamicFilters({});
                break;
            case 'finalType':
                setSelectedFinalType(null);
                setDynamicFilters({});
                break;
            case 'minPrice':
                setPriceRange(prev => ({ ...prev, min: '' }));
                break;
            case 'maxPrice':
                setPriceRange(prev => ({ ...prev, max: '' }));
                break;
            case 'dynamic':
                if (propertyKey) {
                    setDynamicFilters(prev => {
                        const newFilters = { ...prev };
                        delete newFilters[propertyKey];
                        return newFilters;
                    });
                }
                break;
        }
    };

    // فلترة الخصائص لإظهار الفلاتر فقط
    const getFilterableProperties = (): ApiDynamicProperty[] => {
        return filterProperties.filter(property => property.isFilter);
    };

    return (
        <div className={className}>
            <Card>
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-blue-500" />
                                    فلتر البحث
                                    {activeFiltersCount > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {activeFiltersCount} فلتر نشط
                                        </Badge>
                                    )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {activeFiltersCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearAllFilters();
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            مسح الكل
                                        </Button>
                                    )}
                                    {isOpen ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <CardContent className="space-y-6">
                            {/* الفلاتر النشطة */}
                            {activeFiltersCount > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">الفلاتر النشطة:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMainType && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                {selectedMainType.name}
                                                <button
                                                    onClick={() => clearFilter('mainType')}
                                                    className="hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {selectedSubType && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                {selectedSubType.name}
                                                <button
                                                    onClick={() => clearFilter('subType')}
                                                    className="hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {selectedFinalType && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                {selectedFinalType.name}
                                                <button
                                                    onClick={() => clearFilter('finalType')}
                                                    className="hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {priceRange.min && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                من: {priceRange.min} ريال
                                                <button
                                                    onClick={() => clearFilter('minPrice')}
                                                    className="hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {priceRange.max && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                إلى: {priceRange.max} ريال
                                                <button
                                                    onClick={() => clearFilter('maxPrice')}
                                                    className="hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {Object.entries(dynamicFilters).map(([key, value]) => {
                                            if (!value || value === '' || (Array.isArray(value) && value.length === 0)) return null;

                                            const property = filterProperties.find(p => p.propertyKey === key);
                                            if (!property) return null;

                                            let displayValue = '';
                                            if (Array.isArray(value)) {
                                                displayValue = value.join(', ');
                                            } else {
                                                displayValue = String(value);
                                            }

                                            return (
                                                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                                                    {property.propertyName}: {displayValue}
                                                    <button
                                                        onClick={() => clearFilter('dynamic', key)}
                                                        className="hover:text-red-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                    <Separator />
                                </div>
                            )}

                            {/* اختيار النوع الرئيسي */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">نوع العقار</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {mainTypes.map((mainType) => (
                                        <button
                                            key={mainType.id}
                                            onClick={() => handleMainTypeSelect(mainType)}
                                            className={`
                                                p-3 border rounded-lg text-sm transition-all text-center
                                                ${selectedMainType?.id === mainType.id
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            {mainType.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* اختيار النوع الفرعي */}
                            {selectedMainType && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">النوع الفرعي</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedMainType.subtypes?.map((subType) => (
                                            <button
                                                key={subType.id}
                                                onClick={() => handleSubTypeSelect(subType)}
                                                className={`
                                                    p-3 border rounded-lg text-sm transition-all text-center
                                                    ${selectedSubType?.id === subType.id
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                {subType.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* اختيار النوع النهائي */}
                            {selectedSubType && finalTypes.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">النوع النهائي</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {finalTypes.map((finalType) => (
                                            <button
                                                key={finalType.id}
                                                onClick={() => handleFinalTypeSelect(finalType)}
                                                className={`
                                                    p-3 border rounded-lg text-sm transition-all text-center
                                                    ${selectedFinalType?.id === finalType.id
                                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                {finalType.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* نطاق السعر */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    نطاق السعر (ريال سعودي)
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="minPrice" className="text-xs text-gray-500">الحد الأدنى</Label>
                                        <Input
                                            id="minPrice"
                                            type="number"
                                            placeholder="0"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="maxPrice" className="text-xs text-gray-500">الحد الأقصى</Label>
                                        <Input
                                            id="maxPrice"
                                            type="number"
                                            placeholder="1000000"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* الفلاتر الديناميكية */}
                            {selectedFinalType && !propertiesLoading && (
                                <div className="space-y-4">
                                    <Separator />
                                    <Label className="text-sm font-medium">فلاتر إضافية</Label>

                                    {getFilterableProperties().length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {getFilterableProperties().map((property) => (
                                                <DynamicField
                                                    key={property.id}
                                                    property={property}
                                                    value={dynamicFilters[property.propertyKey]}
                                                    onChange={(value) => handleDynamicFilterChange(property.propertyKey, value)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            لا توجد فلاتر إضافية متاحة لهذا النوع
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* loading للخصائص الديناميكية */}
                            {selectedFinalType && propertiesLoading && (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-sm text-gray-500 mt-2">جاري تحميل الفلاتر...</p>
                                </div>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        </div>
    );
};
