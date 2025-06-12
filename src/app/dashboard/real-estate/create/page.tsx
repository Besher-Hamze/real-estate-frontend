'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TypeSelector, DynamicForm } from '@/components/dynamic-form';
import { useDynamicForm } from '@/hooks/useDynamicProperties';
import { useLocationData } from '@/hooks/useLocationData';
import { CreateRealEstateData, MainType, SubType, FinalType } from '@/lib/types';
import { RealEstateApi } from '@/api/realEstateApi';
import {
    Save,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    MapPin,
    Camera,
    FileText,
    Home,
    DollarSign,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface FormStep {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    isCompleted: boolean;
}

export default function CreateRealEstatePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFinalTypeId, setSelectedFinalTypeId] = useState<number | null>(null);
    const [selectedTypePath, setSelectedTypePath] = useState<{
        mainType: MainType;
        subType: SubType;
        finalType: FinalType;
    } | null>(null);

    // استخدام hook للخصائص الديناميكية
    const {
        formData: dynamicFormData,
        groupedProperties,
        errors: dynamicErrors,
        loading: dynamicLoading,
        updateField: updateDynamicField,
        validate: validateDynamic,
        isValid: isDynamicValid
    } = useDynamicForm(selectedFinalTypeId);

    // استخدام hook لبيانات الموقع
    const {
        cities,
        neighborhoods,
        finalCities,
        selectedCityId,
        selectedNeighborhoodId,
        setSelectedCityId,
        setSelectedNeighborhoodId,
        loading: locationLoading
    } = useLocationData();

    // بيانات النموذج الأساسية
    const [basicFormData, setBasicFormData] = useState({
        title: '',
        description: '',
        price: '',
        finalCityId: '',
        location: '',
        viewTime: '',
        coverImage: null as File | null,
        files: [] as File[]
    });

    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // تعريف خطوات النموذج
    const steps: FormStep[] = [
        {
            id: 1,
            title: 'نوع العقار',
            description: 'اختر نوع العقار المناسب',
            icon: <Home className="w-5 h-5" />,
            isCompleted: selectedFinalTypeId !== null
        },
        {
            id: 2,
            title: 'المعلومات الأساسية',
            description: 'العنوان والوصف والسعر',
            icon: <FileText className="w-5 h-5" />,
            isCompleted: !!(basicFormData.title && basicFormData.description && basicFormData.price)
        },
        {
            id: 3,
            title: 'الموقع',
            description: 'تفاصيل موقع العقار',
            icon: <MapPin className="w-5 h-5" />,
            isCompleted: !!(selectedCityId && selectedNeighborhoodId && basicFormData.finalCityId)
        },
        {
            id: 4,
            title: 'الخصائص التفصيلية',
            description: 'خصائص العقار المحددة',
            icon: <DollarSign className="w-5 h-5" />,
            isCompleted: isDynamicValid && Object.keys(dynamicFormData).length > 0
        },
        {
            id: 5,
            title: 'الصور والملفات',
            description: 'صور العقار والمستندات',
            icon: <Camera className="w-5 h-5" />,
            isCompleted: basicFormData.coverImage !== null
        }
    ];

    // التعامل مع اختيار نوع العقار
    const handleFinalTypeSelect = (finalTypeId: number, path: { mainType: MainType; subType: SubType; finalType: FinalType }) => {
        setSelectedFinalTypeId(finalTypeId);
        setSelectedTypePath(path);
        setCurrentStep(2);
    };

    // التحديث للبيانات الأساسية
    const updateBasicField = (field: keyof typeof basicFormData, value: any) => {
        setBasicFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setErrors([]);
    };

    // التحقق من صحة الخطوة الحالية
    const validateCurrentStep = (): boolean => {
        const newErrors: string[] = [];

        switch (currentStep) {
            case 1:
                if (!selectedFinalTypeId) {
                    newErrors.push('يرجى اختيار نوع العقار');
                }
                break;

            case 2:
                if (!basicFormData.title.trim()) newErrors.push('عنوان العقار مطلوب');
                if (!basicFormData.description.trim()) newErrors.push('وصف العقار مطلوب');
                if (!basicFormData.price || isNaN(Number(basicFormData.price))) newErrors.push('سعر صحيح مطلوب');
                break;

            case 3:
                if (!selectedCityId) newErrors.push('المدينة مطلوبة');
                if (!selectedNeighborhoodId) newErrors.push('الحي مطلوب');
                if (!basicFormData.finalCityId) newErrors.push('المنطقة مطلوبة');
                if (!basicFormData.location.trim()) newErrors.push('الموقع على الخريطة مطلوب');
                break;

            case 4:
                if (!validateDynamic()) {
                    newErrors.push(...dynamicErrors);
                }
                break;

            case 5:
                if (!basicFormData.coverImage) newErrors.push('صورة الغلاف مطلوبة');
                if (!basicFormData.viewTime) newErrors.push('وقت المعاينة مطلوب');
                break;
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    // الانتقال للخطوة التالية
    const nextStep = () => {
        if (validateCurrentStep() && currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    // العودة للخطوة السابقة
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // إرسال النموذج
    const handleSubmit = async () => {
        if (!validateCurrentStep() || !selectedTypePath || !selectedCityId || !selectedNeighborhoodId) {
            return;
        }

        setIsSubmitting(true);

        try {
            const createData: CreateRealEstateData = {
                title: basicFormData.title,
                description: basicFormData.description,
                price: Number(basicFormData.price),
                mainCategoryId: selectedTypePath.mainType.id,
                subCategoryId: selectedTypePath.subType.id,
                finalTypeId: selectedTypePath.finalType.id,
                cityId: selectedCityId,
                neighborhoodId: selectedNeighborhoodId,
                finalCityId: Number(basicFormData.finalCityId),
                location: basicFormData.location,
                viewTime: basicFormData.viewTime,
                coverImage: basicFormData.coverImage,
                files: basicFormData.files,
                dynamicProperties: dynamicFormData
            };

            await RealEstateApi.create(createData);

            toast.success('تم إنشاء العقار بنجاح!');
            router.push('/dashboard/real-estate');

        } catch (error) {
            console.error('Error creating real estate:', error);
            toast.error('حدث خطأ في إنشاء العقار');
        } finally {
            setIsSubmitting(false);
        }
    };

    // رندر محتوى الخطوة
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <TypeSelector
                        onFinalTypeSelect={handleFinalTypeSelect}
                        className="min-h-[400px]"
                    />
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    المعلومات الأساسية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">عنوان العقار *</Label>
                                    <Input
                                        id="title"
                                        value={basicFormData.title}
                                        onChange={(e) => updateBasicField('title', e.target.value)}
                                        placeholder="أدخل عنوان مميز للعقار"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">وصف العقار *</Label>
                                    <Textarea
                                        id="description"
                                        value={basicFormData.description}
                                        onChange={(e) => updateBasicField('description', e.target.value)}
                                        placeholder="اكتب وصفاً تفصيلياً للعقار"
                                        className="mt-1 min-h-[100px]"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="price">السعر (ريال سعودي) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={basicFormData.price}
                                        onChange={(e) => updateBasicField('price', e.target.value)}
                                        placeholder="0"
                                        className="mt-1"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-green-500" />
                                    تفاصيل الموقع
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city">المدينة *</Label>
                                        <select
                                            id="city"
                                            value={selectedCityId || ''}
                                            onChange={(e) => setSelectedCityId(Number(e.target.value) || null)}
                                            className="w-full mt-1 p-2 border rounded-md"
                                            disabled={locationLoading}
                                        >
                                            <option value="">اختر المدينة</option>
                                            {cities.map(city => (
                                                <option key={city.id} value={city.id}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="neighborhood">الحي *</Label>
                                        <select
                                            id="neighborhood"
                                            value={selectedNeighborhoodId || ''}
                                            onChange={(e) => setSelectedNeighborhoodId(Number(e.target.value) || null)}
                                            className="w-full mt-1 p-2 border rounded-md"
                                            disabled={!selectedCityId || locationLoading}
                                        >
                                            <option value="">اختر الحي</option>
                                            {neighborhoods.map(neighborhood => (
                                                <option key={neighborhood.id} value={neighborhood.id}>
                                                    {neighborhood.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="finalCity">المنطقة *</Label>
                                    <select
                                        id="finalCity"
                                        value={basicFormData.finalCityId}
                                        onChange={(e) => updateBasicField('finalCityId', e.target.value)}
                                        className="w-full mt-1 p-2 border rounded-md"
                                        disabled={!selectedNeighborhoodId || locationLoading}
                                    >
                                        <option value="">اختر المنطقة</option>
                                        {finalCities.map(finalCity => (
                                            <option key={finalCity.id} value={finalCity.id}>
                                                {finalCity.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="location">الموقع على الخريطة *</Label>
                                    <Input
                                        id="location"
                                        value={basicFormData.location}
                                        onChange={(e) => updateBasicField('location', e.target.value)}
                                        placeholder="lat,lng (مثال: 24.7136,46.6753)"
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        يمكنك الحصول على الإحداثيات من خرائط جوجل
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 4:
                if (dynamicLoading) {
                    return (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">جاري تحميل الخصائص...</p>
                        </div>
                    );
                }

                return (
                    <div className="space-y-6">
                        {selectedTypePath && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Home className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-blue-900">
                                                {selectedTypePath.mainType.name} - {selectedTypePath.subType.name} - {selectedTypePath.finalType.name}
                                            </h3>
                                            <p className="text-sm text-blue-700">
                                                املأ الخصائص المطلوبة لهذا النوع من العقارات
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <DynamicForm
                            groupedProperties={groupedProperties}
                            formData={dynamicFormData}
                            onChange={updateDynamicField}
                            errors={dynamicErrors}
                        />
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-purple-500" />
                                    الصور والملفات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="coverImage">صورة الغلاف *</Label>
                                    <Input
                                        id="coverImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => updateBasicField('coverImage', e.target.files?.[0] || null)}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        هذه الصورة ستظهر كصورة رئيسية للعقار
                                    </p>
                                    {basicFormData.coverImage && (
                                        <p className="text-xs text-green-600 mt-1">
                                            ✓ تم اختيار: {basicFormData.coverImage.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="files">صور إضافية</Label>
                                    <Input
                                        id="files"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => updateBasicField('files', Array.from(e.target.files || []))}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        يمكنك اختيار عدة صور للعقار
                                    </p>
                                    {basicFormData.files.length > 0 && (
                                        <p className="text-xs text-green-600 mt-1">
                                            ✓ تم اختيار {basicFormData.files.length} صور
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="viewTime">وقت المعاينة *</Label>
                                    <Input
                                        id="viewTime"
                                        type="datetime-local"
                                        value={basicFormData.viewTime}
                                        onChange={(e) => updateBasicField('viewTime', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4" />
                            العودة
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">إضافة عقار جديد</h1>
                            <p className="text-gray-600">أدخل تفاصيل العقار لإضافته للمنصة</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                                ${currentStep === step.id
                                                    ? 'border-blue-500 bg-blue-500 text-white'
                                                    : step.isCompleted
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : 'border-gray-300 bg-white text-gray-500'
                                                }
                                            `}
                                        >
                                            {step.isCompleted ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                step.icon
                                            )}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p className="text-xs font-medium text-gray-900">
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="w-16 h-0.5 bg-gray-300 mx-4 mb-8" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="mb-8">
                    {renderStepContent()}
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                {errors.map((error, index) => (
                                    <p key={index} className="text-sm text-red-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                        {error}
                                    </p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center bg-white rounded-lg p-6 shadow-sm">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2"
                    >
                        <ArrowRight className="w-4 h-4" />
                        السابق
                    </Button>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                            الخطوة {currentStep} من {steps.length}
                        </span>
                    </div>

                    {currentStep < steps.length ? (
                        <Button
                            onClick={nextStep}
                            className="flex items-center gap-2"
                        >
                            التالي
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    حفظ العقار
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
