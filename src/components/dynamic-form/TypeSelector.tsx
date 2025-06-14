import React, { useState, useEffect } from 'react';
import { MainType, SubType, FinalType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Building, Home, ChevronRight, Check } from 'lucide-react';
import { mainTypeApi } from '@/api/mainTypeApi';
import { finalTypeTypeApi } from '@/api/finalTypeApi';

interface TypeSelectorProps {
    onFinalTypeSelect: (finalTypeId: number, path: { mainType: MainType; subType: SubType; finalType: FinalType }) => void;
    initialFinalTypeId?: number | null;
    className?: string;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
    onFinalTypeSelect,
    initialFinalTypeId = null,
    className = ''
}) => {
    const [mainTypes, setMainTypes] = useState<MainType[]>([]);
    const [selectedMainType, setSelectedMainType] = useState<MainType | null>(null);
    const [selectedSubType, setSelectedSubType] = useState<SubType | null>(null);
    const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
    const [selectedFinalType, setSelectedFinalType] = useState<FinalType | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // جلب الأنواع الرئيسية عند التحميل
    useEffect(() => {
        const fetchMainTypes = async () => {
            try {
                const data = await mainTypeApi.fetchMainType();
                setMainTypes(data);
                return data;
            } catch (error) {
                console.error('Error fetching main types:', error);
                return [];
            }
        };

        fetchMainTypes();
    }, []);

    // تهيئة البيانات في حالة التعديل
    useEffect(() => {
        const initializeEditMode = async () => {
            if (initialFinalTypeId && mainTypes.length > 0 && !isInitialized) {
                try {
                    setLoading(true);

                    // البحث عن النوع النهائي في جميع الأنواع الفرعية
                    let foundPath: { mainType: MainType; subType: SubType; finalType: FinalType } | null = null;

                    for (const mainType of mainTypes) {
                        if (mainType.subtypes) {
                            for (const subType of mainType.subtypes) {
                                try {
                                    const finalTypesData = await finalTypeTypeApi.fetchFinalTypeBySubId(subType.id);
                                    const foundFinalType = finalTypesData.find(ft => ft.id === initialFinalTypeId);

                                    if (foundFinalType) {
                                        foundPath = {
                                            mainType,
                                            subType,
                                            finalType: foundFinalType
                                        };
                                        break;
                                    }
                                } catch (error) {
                                    console.error(`Error fetching final types for subType ${subType.id}:`, error);
                                }
                            }
                            if (foundPath) break;
                        }
                    }

                    if (foundPath) {
                        setSelectedMainType(foundPath.mainType);
                        setSelectedSubType(foundPath.subType);

                        // جلب جميع الأنواع النهائية للنوع الفرعي المحدد
                        const finalTypesData = await finalTypeTypeApi.fetchFinalTypeBySubId(foundPath.subType.id);
                        setFinalTypes(finalTypesData);
                        setSelectedFinalType(foundPath.finalType);

                        // إشعار المكون الأب بالاختيار المبدئي
                        onFinalTypeSelect(foundPath.finalType.id, foundPath);
                    }
                } catch (error) {
                    console.error('Error initializing edit mode:', error);
                } finally {
                    setLoading(false);
                    setIsInitialized(true);
                }
            }
        };

        initializeEditMode();
    }, [initialFinalTypeId, mainTypes, isInitialized, onFinalTypeSelect]);

    // جلب الأنواع النهائية عند اختيار نوع فرعي
    useEffect(() => {
        if (selectedSubType && !isInitialized) {
            const fetchFinalTypes = async () => {
                setLoading(true);
                try {
                    const data = await finalTypeTypeApi.fetchFinalTypeBySubId(selectedSubType.id);
                    setFinalTypes(data);
                } catch (error) {
                    console.error('Error fetching final types:', error);
                    setFinalTypes([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchFinalTypes();
        }
    }, [selectedSubType, isInitialized]);

    const handleMainTypeSelect = (mainType: MainType) => {
        setSelectedMainType(mainType);
        setSelectedSubType(null);
        setSelectedFinalType(null);
        setFinalTypes([]);
        setIsInitialized(true);
    };

    const handleSubTypeSelect = async (subType: SubType) => {
        setSelectedSubType(subType);
        setSelectedFinalType(null);

        // جلب الأنواع النهائية للنوع الفرعي المحدد
        setLoading(true);
        try {
            const data = await finalTypeTypeApi.fetchFinalTypeBySubId(subType.id);
            setFinalTypes(data);
        } catch (error) {
            console.error('Error fetching final types:', error);
            setFinalTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalTypeSelect = (finalType: FinalType) => {
        if (selectedMainType && selectedSubType) {
            setSelectedFinalType(finalType);
            onFinalTypeSelect(finalType.id, {
                mainType: selectedMainType,
                subType: selectedSubType,
                finalType
            });
        }
    };

    const resetSelection = () => {
        setSelectedMainType(null);
        setSelectedSubType(null);
        setSelectedFinalType(null);
        setFinalTypes([]);
        setIsInitialized(true);
    };

    const goBackToSubTypes = () => {
        setSelectedSubType(null);
        setSelectedFinalType(null);
        setFinalTypes([]);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header مع مسار التنقل */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    {selectedMainType && (
                        <>
                            <span className="font-medium">{selectedMainType.name}</span>
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                    {selectedSubType && (
                        <>
                            <span className="font-medium">{selectedSubType.name}</span>
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                    {selectedFinalType && (
                        <span className="font-medium text-purple-600">{selectedFinalType.name}</span>
                    )}
                    {!selectedMainType && <span>اختر نوع العقار</span>}
                </div>

                <div className="flex gap-2">
                    {selectedSubType && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goBackToSubTypes}
                            className="flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4" />
                            العودة للأنواع الفرعية
                        </Button>
                    )}
                    {selectedMainType && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetSelection}
                            className="flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4" />
                            العودة للبداية
                        </Button>
                    )}
                </div>
            </div>

            {/* عرض الاختيار الحالي في حالة التعديل */}
            {selectedFinalType && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Check className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-900 mb-1">
                                    نوع العقار المحدد
                                </h3>
                                <p className="text-sm text-green-700">
                                    {selectedMainType?.name} → {selectedSubType?.name} → {selectedFinalType.name}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetSelection}
                                className="text-green-700 border-green-300 hover:bg-green-100"
                            >
                                تغيير النوع
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* اختيار النوع الرئيسي */}
            {!selectedMainType && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-500" />
                            اختر النوع الرئيسي
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mainTypes.map((mainType) => (
                                <button
                                    key={mainType.id}
                                    onClick={() => handleMainTypeSelect(mainType)}
                                    className="p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-right group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                            <Home className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {mainType.name}
                                            </h3>
                                            <Badge variant="outline" className="text-xs">
                                                {mainType.subtypes?.length || 0} نوع فرعي
                                            </Badge>
                                        </div>
                                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* اختيار النوع الفرعي */}
            {selectedMainType && !selectedSubType && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-green-500" />
                            اختر النوع الفرعي - {selectedMainType.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedMainType.subtypes?.map((subType) => (
                                <button
                                    key={subType.id}
                                    onClick={() => handleSubTypeSelect(subType)}
                                    className="p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-right group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {subType.name}
                                            </h3>
                                        </div>
                                        <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* اختيار النوع النهائي */}
            {selectedSubType && !selectedFinalType && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-purple-500" />
                            اختر النوع النهائي - {selectedSubType.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">جاري التحميل...</p>
                            </div>
                        ) : finalTypes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {finalTypes.map((finalType) => (
                                    <button
                                        key={finalType.id}
                                        onClick={() => handleFinalTypeSelect(finalType)}
                                        className="p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
                                    >
                                        <div className="space-y-2">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mx-auto group-hover:bg-purple-200 transition-colors">
                                                <Building className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <h3 className="font-medium text-gray-900">
                                                {finalType.name}
                                            </h3>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">لا توجد أنواع نهائية متاحة</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};