'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TypeSelector, DynamicForm } from '@/components/dynamic-form';
import { useDynamicForm } from '@/hooks/useDynamicProperties';
import { useLocationData } from '@/hooks/useLocationData';
import { CreateRealEstateData, MainType, SubType, FinalType, RealEstateData, Building } from '@/lib/types';
import { RealEstateApi } from '@/api/realEstateApi';
import { buildingApi } from '@/api/buidlingApi';
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
    Loader2,
    Edit,
    Plus,
    Building2,
    AlertCircle,
    CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { PAYMENT_OPTIONS } from '@/components/ui/constants/formOptions';
import LocationPicker from '@/components/map/LocationPicker';
import ViewingTimeSelector from '@/components/forms/ViewingTimeSelector';
import ImageUploadModal from '@/components/dashboard/forms/EnhancedImageUpload';

interface FormStep {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

// Main component content
function RealEstatePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const propertyId = searchParams.get('id');
    const buildingId = searchParams.get('buildingId');
    const isEditMode = !!propertyId;
    const isBuildingMode = !!buildingId;

    // Step management
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Property type selection
    const [selectedFinalTypeId, setSelectedFinalTypeId] = useState<number | null>(null);
    const [selectedTypePath, setSelectedTypePath] = useState<{
        mainType: MainType;
        subType: SubType;
        finalType: FinalType;
    } | null>(null);

    // Building data
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [isLoadingBuilding, setIsLoadingBuilding] = useState(isBuildingMode);

    // Property data for edit mode
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [property, setProperty] = useState<RealEstateData | null>(null);

    // Dynamic properties
    const {
        formData: dynamicFormData,
        groupedProperties,
        errors: dynamicErrors,
        loading: dynamicLoading,
        updateField: updateDynamicField,
        validate: validateDynamic,
        isValid: isDynamicValid,
        setFormData: setDynamicFormData
    } = useDynamicForm(selectedFinalTypeId);

    // Location data
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

    // Basic form data
    const [basicFormData, setBasicFormData] = useState({
        title: '',
        description: '',
        price: '',
        finalCityId: '',
        location: '',
        viewTime: '',  // Changed from array to string
        paymentMethod: '',
        coverImage: null as File | null,
        files: [] as File[],
        existingCoverImage: '',
        existingFiles: [] as string[]
    });

    // Image upload states
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
    const [additionalFileTypes, setAdditionalFileTypes] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isCoverImageUploading, setIsCoverImageUploading] = useState(false);
    const [uploadingImageIndexes, setUploadingImageIndexes] = useState<number[]>([]);
    const [coverImageProgress, setCoverImageProgress] = useState<number>(0);
    const [additionalImageProgress, setAdditionalImageProgress] = useState<Record<number, number>>({});

    // Form validation
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Define form steps
    const steps: FormStep[] = [
        {
            id: 1,
            title: 'نوع العقار',
            description: isEditMode ? 'تعديل نوع العقار' : 'اختر نوع العقار المناسب',
            icon: <Home className="w-5 h-5" />
        },
        {
            id: 2,
            title: 'المعلومات الأساسية',
            description: 'العنوان والوصف والسعر',
            icon: <FileText className="w-5 h-5" />
        },
        {
            id: 3,
            title: 'الموقع',
            description: 'تفاصيل موقع العقار',
            icon: <MapPin className="w-5 h-5" />
        },
        {
            id: 4,
            title: 'الخصائص التفصيلية',
            description: 'خصائص العقار المحددة',
            icon: <DollarSign className="w-5 h-5" />
        },
        {
            id: 5,
            title: 'الصور والملفات',
            description: 'صور العقار والمستندات',
            icon: <Camera className="w-5 h-5" />
        }
    ];

    // Check if step is completed
    const isStepCompleted = (stepId: number): boolean => {
        if (completedSteps.has(stepId)) return true;

        switch (stepId) {
            case 1:
                return selectedFinalTypeId !== null;
            case 2:
                return !!(
                    basicFormData.title.trim() &&
                    basicFormData.description.trim() &&
                    basicFormData.price &&
                    !isNaN(Number(basicFormData.price)) &&
                    basicFormData.paymentMethod.trim()
                );
            case 3:
                return !!(
                    selectedCityId &&
                    selectedNeighborhoodId &&
                    basicFormData.finalCityId &&
                    basicFormData.location.trim()
                );
            case 4:
                return currentStep == 4 || currentStep > 4;
            case 5:
                return !!(
                    (basicFormData.coverImage || basicFormData.existingCoverImage || coverImagePreview) &&
                    basicFormData.viewTime && basicFormData.viewTime.trim()
                );
            default:
                return false;
        }
    };

    // Mark step as completed
    const markStepCompleted = (stepId: number) => {
        if (isStepCompleted(stepId)) {
            setCompletedSteps(prev => new Set([...prev, stepId]));
        }
    };

    // Load building data if buildingId is provided
    useEffect(() => {
        const loadBuilding = async () => {
            if (!buildingId) {
                setIsLoadingBuilding(false);
                return;
            }

            try {
                setIsLoadingBuilding(true);
                const buildingData = await buildingApi.fetchBuildingById(buildingId);
                setSelectedBuilding(buildingData);

                // Auto-fill location data from building
                if (buildingData.location) {
                    updateBasicField('location', buildingData.location);
                }

                if (buildingData.cityId) {
                    setSelectedCityId(buildingData.cityId);
                }
                if (buildingData.neighborhoodId) {
                    setSelectedNeighborhoodId(buildingData.neighborhoodId);
                }
                if (buildingData.finalCityId) {
                    updateBasicField('finalCityId', buildingData.finalCityId.toString());
                }

                // Pre-fill title with building context
                if (!basicFormData.title) {
                    updateBasicField('title', `عقار في ${buildingData.title}`);
                }

            } catch (error) {
                console.error('Error loading building:', error);
                toast.error('حدث خطأ في تحميل بيانات المبنى');
                router.push('/dashboard');
            } finally {
                setIsLoadingBuilding(false);
            }
        };

        loadBuilding();
    }, [buildingId, router, setSelectedCityId, setSelectedNeighborhoodId]);

    // Load existing property data for edit mode
    useEffect(() => {
        const loadProperty = async () => {
            if (!isEditMode || !propertyId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const propertyData = await RealEstateApi.fetchRealEstateById(Number(propertyId));
                setProperty(propertyData);

                // Parse viewTime data properly
                let parsedViewTime = '';
                if (propertyData.viewTime) {
                    try {
                        // Try to parse as JSON first
                        const parsed = JSON.parse(propertyData.viewTime);
                        if (typeof parsed === 'string') {
                            parsedViewTime = parsed;
                        } else if (Array.isArray(parsed) && parsed.length > 0) {
                            parsedViewTime = typeof parsed[0] === 'string' ? parsed[0] : JSON.stringify(parsed[0]);
                        } else {
                            parsedViewTime = JSON.stringify(parsed);
                        }
                    } catch {
                        // If JSON parsing fails, use as string
                        parsedViewTime = propertyData.viewTime;
                    }
                }

                // Fill basic data
                setBasicFormData({
                    title: propertyData.title || '',
                    description: propertyData.description || '',
                    price: propertyData.price?.toString() || '',
                    finalCityId: propertyData.finalCityId?.toString() || '',
                    location: propertyData.location || '',
                    viewTime: parsedViewTime,
                    paymentMethod: propertyData.paymentMethod || '',
                    coverImage: null,
                    files: [],
                    existingCoverImage: propertyData.coverImage || '',
                    existingFiles: propertyData.files || []
                });

                // Set image previews
                if (propertyData.coverImage) {
                    setCoverImagePreview(`${propertyData.coverImage}`);
                }

                if (propertyData.files && propertyData.files.length > 0) {
                    const imagePreviews = propertyData.files.map((file: string) => `${file}`);
                    setAdditionalImagePreviews(imagePreviews);
                    const fileTypes = propertyData.files.map(() => 'image/jpeg');
                    setAdditionalFileTypes(fileTypes);
                }

                // Set location data
                if (propertyData.cityId) setSelectedCityId(propertyData.cityId);
                if (propertyData.neighborhoodId) setSelectedNeighborhoodId(propertyData.neighborhoodId);

                // Set property type
                if (propertyData.finalTypeId) {
                    setSelectedFinalTypeId(propertyData.finalTypeId);
                }

                // Load building data if property belongs to a building
                if (propertyData.buildingItemId) {
                    try {
                        const buildingData = await buildingApi.fetchBuildingById(propertyData.buildingItemId);
                        setSelectedBuilding(buildingData);
                    } catch (error) {
                        console.warn('Could not load building data for property');
                    }
                }

            } catch (error) {
                console.error('Error loading property:', error);
                toast.error('حدث خطأ في تحميل بيانات العقار');
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        loadProperty();
    }, [isEditMode, propertyId, router, setSelectedCityId, setSelectedNeighborhoodId]);

    // Fill dynamic properties after property is loaded and finalTypeId is set
    useEffect(() => {

        if (isEditMode && property && selectedFinalTypeId && !dynamicLoading && groupedProperties) {
            // Fill dynamic properties
            if (property.properties) {
                const dynamicData: { [key: string]: any } = {};
                Object.entries(property.properties).forEach(([key, propValue]) => {
                    if (propValue && typeof propValue === 'object' && 'value' in propValue && 'property' in propValue) {
                        const propertyDef = propValue.property;
                        let value = propValue.value;

                        // Handle MULTIPLE_CHOICE fields - convert comma-separated string to array
                        if (propertyDef.dataType === 'MULTIPLE_CHOICE' && typeof value === 'string') {
                            value = value.split(',').map((item: string) => item.trim()).filter((item: string) => item);
                        }

                        dynamicData[key] = value;
                    }
                });
                setDynamicFormData(dynamicData);
            }

            // Mark all steps as completed for edit mode after data is loaded
            setTimeout(() => {
                setCompletedSteps(new Set([1, 2, 3, 4, 5]));
            }, 100);
        }
    }, [property, selectedFinalTypeId, dynamicLoading, groupedProperties, setDynamicFormData, isEditMode]);



    // Handle property type selection
    const handleFinalTypeSelect = (finalTypeId: number, path: { mainType: MainType; subType: SubType; finalType: FinalType }) => {
        setSelectedFinalTypeId(finalTypeId);
        setSelectedTypePath(path);
        markStepCompleted(1);

        if (!isEditMode) {
            setCurrentStep(2);
        }
    };

    // Update basic form field
    const updateBasicField = (field: keyof typeof basicFormData, value: any) => {
        setBasicFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setErrors([]);
    };

    // Image upload handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setCoverImagePreview(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
            updateBasicField('coverImage', file);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const newPreviews = [...additionalImagePreviews];
                    newPreviews[index] = e.target.result as string;
                    setAdditionalImagePreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file);

            const files = Array.isArray(basicFormData.files) ? [...basicFormData.files] : [];
            files[index] = file;
            const newFileTypes = [...additionalFileTypes];
            newFileTypes[index] = file.type;
            setAdditionalFileTypes(newFileTypes);

            updateBasicField('files', files);
        }
    };

    const handleDeleteAdditionalImage = (index: number) => {
        const newPreviews = [...additionalImagePreviews];
        const newUrls = [...basicFormData.files];
        const newTypes = [...additionalFileTypes];

        newPreviews.splice(index, 1);
        newUrls.splice(index, 1);
        newTypes.splice(index, 1);

        setAdditionalImagePreviews(newPreviews);
        setAdditionalFileTypes(newTypes);
        updateBasicField('files', newUrls);
    };

    // Validate current step
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
                if (!basicFormData.paymentMethod.trim()) newErrors.push('طريقة الدفع مطلوبة');
                break;

            case 3:
                if (!selectedCityId) newErrors.push('المحافظة مطلوبة');
                if (!selectedNeighborhoodId) newErrors.push('المدينة مطلوب');
                if (!basicFormData.finalCityId) newErrors.push('المنطقة مطلوبة');
                if (!basicFormData.location.trim()) newErrors.push('الموقع على الخريطة مطلوب');
                break;

            case 4:
                if (Object.keys(groupedProperties).length > 0 && !validateDynamic()) {
                    newErrors.push(...dynamicErrors);
                }
                break;

            case 5:
                if (!basicFormData.coverImage && !basicFormData.existingCoverImage && !coverImagePreview) {
                    newErrors.push('صورة الغلاف مطلوبة');
                }
                if (!basicFormData.viewTime || !basicFormData.viewTime.trim()) {
                    newErrors.push('وقت المعاينة مطلوب');
                }
                break;
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    // Navigation functions
    const nextStep = () => {
        if (validateCurrentStep() && currentStep < steps.length) {
            markStepCompleted(currentStep);
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const navigateToStep = (stepId: number) => {
        if (completedSteps.has(stepId) || stepId <= currentStep || stepId === currentStep + 1) {
            setCurrentStep(stepId);
        }
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateCurrentStep() || !selectedTypePath) {
            return;
        }

        if (!selectedCityId || !selectedNeighborhoodId) {
            toast.error('يرجى اختيار المحافظة والمدينة');
            return;
        }

        setIsSubmitting(true);

        try {
            // Process dynamic form data to handle MULTIPLE_CHOICE fields
            const processedDynamicData: { [key: string]: any } = {};
            Object.entries(dynamicFormData).forEach(([key, value]) => {
                // Convert arrays back to comma-separated strings for MULTIPLE_CHOICE fields
                if (Array.isArray(value)) {
                    processedDynamicData[key] = value.join(',');
                } else {
                    processedDynamicData[key] = value;
                }
            });

            if (isEditMode && property) {
                // Update existing property
                const updateData: Partial<any> = {
                    title: basicFormData.title,
                    description: basicFormData.description,
                    price: Number(basicFormData.price),
                    paymentMethod: basicFormData.paymentMethod,
                    location: basicFormData.location,
                    viewTime: basicFormData.viewTime, // Send as string
                    dynamicProperties: processedDynamicData,
                    cityId: selectedCityId,
                    neighborhoodId: selectedNeighborhoodId,
                    finalCityId: Number(basicFormData.finalCityId)
                };

                if (selectedBuilding) {
                    updateData.buildingItemId = selectedBuilding.id;
                }

                if (basicFormData.coverImage) {
                    updateData.coverImage = basicFormData.coverImage;
                }
                if (basicFormData.files.length > 0) {
                    updateData.files = basicFormData.files;
                }

                if (selectedTypePath) {
                    updateData.mainCategoryId = selectedTypePath.mainType.id;
                    updateData.subCategoryId = selectedTypePath.subType.id;
                    updateData.finalTypeId = selectedTypePath.finalType.id;
                }

                await RealEstateApi.update(property.id, updateData);
                toast.success('تم تحديث العقار بنجاح!');
            } else {
                // Create new property
                const createData: CreateRealEstateData = {
                    title: basicFormData.title,
                    description: basicFormData.description,
                    price: Number(basicFormData.price),
                    mainCategoryId: selectedTypePath.mainType.id,
                    subCategoryId: selectedTypePath.subType.id,
                    finalTypeId: selectedTypePath.finalType.id,
                    paymentMethod: basicFormData.paymentMethod,
                    location: basicFormData.location,
                    viewTime: basicFormData.viewTime, // Send as string
                    coverImage: basicFormData.coverImage,
                    files: basicFormData.files,
                    dynamicProperties: processedDynamicData,
                    cityId: selectedCityId!,
                    neighborhoodId: selectedNeighborhoodId!,
                    finalCityId: Number(basicFormData.finalCityId),
                    ...(selectedBuilding && {
                        buildingItemId: selectedBuilding.id,
                    })
                };

                await RealEstateApi.create(createData);
                toast.success('تم إنشاء العقار بنجاح!');
            }

            // Navigate back appropriately
            router.push('/dashboard');

        } catch (error) {
            console.error('Error saving real estate:', error);
            toast.error(isEditMode ? 'حدث خطأ في تحديث العقار' : 'حدث خطأ في إنشاء العقار');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (basicFormData.finalCityId && !isEditMode) {
            const selectedFinalCity = finalCities.find(c => c.id === Number(basicFormData.finalCityId));
            if (selectedFinalCity?.location) {
                // Only update if current location is empty or if it's the default coordinates
                const currentLocation = basicFormData.location;
                const isDefaultLocation = currentLocation === '23.5880,58.3829' || !currentLocation;

                if (isDefaultLocation) {
                    updateBasicField('location', selectedFinalCity.location);
                }
            } else if (!basicFormData.location) {
                // Set default Oman coordinates if no specific location for the final city
                updateBasicField('location', '23.5880,58.3829');
            }
        }
    }, [basicFormData.finalCityId, finalCities, isEditMode]);

    // Also add this useEffect to set initial location when finalCities load
    useEffect(() => {
        if (!isEditMode && !isLoadingBuilding && !basicFormData.location && finalCities.length > 0) {
            // Set default location when component loads if no location is set
            updateBasicField('location', '23.5880,58.3829');
        }
    }, [finalCities, isEditMode, isLoadingBuilding, basicFormData.location]);

    // Show loading screen
    if (isLoading || isLoadingBuilding) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {isLoadingBuilding ? 'جاري تحميل بيانات المبنى' : 'جاري تحميل بيانات العقار'}
                    </h2>
                    <p className="text-gray-600">يرجى الانتظار...</p>
                </div>
            </div>
        );
    }

    const getLocationCoordinates = () => {
        if (basicFormData.location) {
            const coords = basicFormData.location.split(',');
            return {
                lat: parseFloat(coords[0]) || 23.5880,
                lng: parseFloat(coords[1]) || 58.3829
            };
        }

        // Try to get from selected final city
        if (basicFormData.finalCityId) {
            const selectedFinalCity = finalCities.find(c => c.id === Number(basicFormData.finalCityId));
            if (selectedFinalCity?.location) {
                const coords = selectedFinalCity.location.split(',');
                return {
                    lat: parseFloat(coords[0]) || 23.5880,
                    lng: parseFloat(coords[1]) || 58.3829
                };
            }
        }

        // Default Oman coordinates
        return { lat: 23.5880, lng: 58.3829 };
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        {selectedBuilding && (
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-green-900">
                                                إضافة عقار إلى: {selectedBuilding.title}
                                            </h3>
                                            <p className="text-sm text-green-700">
                                                الحالة: {selectedBuilding.status} • الموقع: {selectedBuilding.location}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isEditMode && property && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Edit className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-blue-900">
                                                النوع الحالي: {property.finalTypeName}
                                            </h3>
                                            <p className="text-sm text-blue-700">
                                                يمكنك تغيير نوع العقار أو الاحتفاظ بالنوع الحالي
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <TypeSelector
                            onFinalTypeSelect={handleFinalTypeSelect}
                            initialFinalTypeId={selectedFinalTypeId}
                            className="min-h-[400px]"
                        />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    المعلومات الأساسية
                                    {selectedBuilding && (
                                        <Badge variant="secondary" className="mr-auto">
                                            مبنى: {selectedBuilding.title}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">عنوان العقار *</Label>
                                    <Input
                                        id="title"
                                        value={basicFormData.title}
                                        onChange={(e) => updateBasicField('title', e.target.value)}
                                        placeholder={selectedBuilding ?
                                            `أدخل عنوان العقار في ${selectedBuilding.title}` :
                                            "أدخل عنوان مميز للعقار"
                                        }
                                        className="mt-1"
                                        maxLength={100}
                                    />
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-gray-500">الحد الأقصى 100 حرف</span>
                                        <span className={`${basicFormData.title.length > 90 ? 'text-amber-600' : ''} ${basicFormData.title.length >= 100 ? 'text-red-500' : ''}`}>
                                            {basicFormData.title.length}/100
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">وصف العقار *</Label>
                                    <Textarea
                                        id="description"
                                        value={basicFormData.description}
                                        onChange={(e) => updateBasicField('description', e.target.value)}
                                        placeholder={selectedBuilding ?
                                            `اكتب وصفاً تفصيلياً للعقار في مبنى ${selectedBuilding.title}` :
                                            "اكتب وصفاً تفصيلياً للعقار"
                                        }
                                        className="mt-1 min-h-[100px]"
                                        maxLength={1000}
                                    />
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-gray-500">الحد الأقصى 1000 حرف</span>
                                        <span className={`${basicFormData.description.length > 900 ? 'text-amber-600' : ''} ${basicFormData.description.length >= 1000 ? 'text-red-500' : ''}`}>
                                            {basicFormData.description.length}/1000
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="price">السعر (ريال عماني) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={basicFormData.price}
                                        onChange={(e) => updateBasicField('price', e.target.value)}
                                        placeholder="0"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
                                    <Select
                                        value={basicFormData.paymentMethod}
                                        onValueChange={(value) => updateBasicField('paymentMethod', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="اختر طريقة الدفع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PAYMENT_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                    {selectedBuilding && (
                                        <Badge variant="secondary" className="mr-auto">
                                            مرتبط بمبنى: {selectedBuilding.title}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedBuilding ? (
                                    <div className="space-y-4">
                                        <Card className="bg-green-50 border-green-200">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <CheckSquare className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-green-900 mb-1">
                                                            معلومات المبنى
                                                        </h4>
                                                        <div className="text-sm text-green-700 space-y-1">
                                                            <p><strong>اسم المبنى:</strong> {selectedBuilding.title}</p>
                                                            <p><strong>الحالة:</strong> {selectedBuilding.status}</p>
                                                            <p><strong>عدد العقارات الحالية:</strong> {selectedBuilding.realEstateCount || 0}</p>
                                                            {selectedBuilding.location && (
                                                                <p><strong>الموقع الحالي:</strong> {selectedBuilding.location}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="city">المحافظة *</Label>
                                                <select
                                                    id="city"
                                                    value={selectedCityId || ''}
                                                    onChange={(e) => setSelectedCityId(Number(e.target.value) || null)}
                                                    className="w-full mt-1 p-2 border rounded-md"
                                                    disabled={locationLoading}
                                                >
                                                    <option value="">اختر المحافظة</option>
                                                    {cities.map(city => (
                                                        <option key={city.id} value={city.id}>
                                                            {city.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <Label htmlFor="neighborhood">المدينة *</Label>
                                                <select
                                                    id="neighborhood"
                                                    value={selectedNeighborhoodId || ''}
                                                    onChange={(e) => setSelectedNeighborhoodId(Number(e.target.value) || null)}
                                                    className="w-full mt-1 p-2 border rounded-md"
                                                    disabled={!selectedCityId || locationLoading}
                                                >
                                                    <option value="">اختر المدينة</option>
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
                                            <Label htmlFor="location">تحديد الموقع على الخريطة *</Label>
                                            <div className="mt-1">
                                                <LocationPicker
                                                    key={`location-picker-${basicFormData.finalCityId || 'default'}`}
                                                    initialLatitude={getLocationCoordinates().lat}
                                                    initialLongitude={getLocationCoordinates().lng}
                                                    onLocationSelect={(latitude, longitude) => {
                                                        updateBasicField('location', `${latitude},${longitude}`);
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                انقر على الخريطة لتحديد الموقع أو اسحب العلامة لتغيير الموقع
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="buildingFloor">الطابق (اختياري)</Label>
                                            <Input
                                                id="buildingFloor"
                                                type="number"
                                                placeholder="رقم الطابق"
                                                className="mt-1"
                                                onChange={(e) => {
                                                    updateDynamicField('building_floor', e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="city">المحافظة *</Label>
                                                <select
                                                    id="city"
                                                    value={selectedCityId || ''}
                                                    onChange={(e) => setSelectedCityId(Number(e.target.value) || null)}
                                                    className="w-full mt-1 p-2 border rounded-md"
                                                    disabled={locationLoading}
                                                >
                                                    <option value="">اختر المحافظة</option>
                                                    {cities.map(city => (
                                                        <option key={city.id} value={city.id}>
                                                            {city.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <Label htmlFor="neighborhood">المدينة *</Label>
                                                <select
                                                    id="neighborhood"
                                                    value={selectedNeighborhoodId || ''}
                                                    onChange={(e) => setSelectedNeighborhoodId(Number(e.target.value) || null)}
                                                    className="w-full mt-1 p-2 border rounded-md"
                                                    disabled={!selectedCityId || locationLoading}
                                                >
                                                    <option value="">اختر المدينة</option>
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
                                            <Label htmlFor="location">تحديد الموقع على الخريطة *</Label>
                                            <div className="mt-1">
                                                <LocationPicker
                                                    key={`location-picker-${basicFormData.finalCityId || 'default'}`}
                                                    initialLatitude={getLocationCoordinates().lat}
                                                    initialLongitude={getLocationCoordinates().lng}
                                                    onLocationSelect={(latitude, longitude) => {
                                                        updateBasicField('location', `${latitude},${longitude}`);
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                انقر على الخريطة لتحديد الموقع أو اسحب العلامة لتغيير الموقع
                                            </p>
                                        </div>
                                    </div>
                                )}
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
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-blue-900">
                                                {selectedTypePath.mainType.name} - {selectedTypePath.subType.name} - {selectedTypePath.finalType.name}
                                            </h3>
                                            <p className="text-sm text-blue-700">
                                                املأ الخصائص المطلوبة لهذا النوع من العقارات
                                                {selectedBuilding && ` في مبنى ${selectedBuilding.title}`}
                                            </p>
                                        </div>
                                        {selectedBuilding && (
                                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                                                مبنى
                                            </Badge>
                                        )}
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
                                    {selectedBuilding && (
                                        <Badge variant="secondary" className="mr-auto">
                                            {selectedBuilding.title}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <ImageUploadModal
                                    additionalImagePreviews={additionalImagePreviews}
                                    additionalFileTypes={additionalFileTypes}
                                    handleFileUpload={handleFileUpload}
                                    coverImagePreview={coverImagePreview}
                                    handleImageUpload={handleImageUpload}
                                    isUploading={isUploading}
                                    handleDeleteImage={handleDeleteAdditionalImage}
                                    isCoverImageUploading={isCoverImageUploading}
                                    isAdditionalImageUploading={uploadingImageIndexes}
                                    coverImageProgress={coverImageProgress}
                                    additionalImageProgress={additionalImageProgress}
                                />

                                <div className="mt-6">
                                    <ViewingTimeSelector
                                        value={basicFormData.viewTime}
                                        onChange={(viewingTimes) => updateBasicField('viewTime', viewingTimes)}
                                        label="أوقات المعاينة *"
                                    />
                                    {selectedBuilding && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            تأكد من تنسيق أوقات المعاينة مع إدارة المبنى
                                        </p>
                                    )}
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
                            onClick={() => {
                                if (selectedBuilding) {
                                    router.push(`/dashboard`);
                                } else {
                                    router.back();
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4" />
                            العودة
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'تعديل العقار' :
                                    selectedBuilding ? `إضافة عقار إلى ${selectedBuilding.title}` :
                                        'إضافة عقار جديد'}
                            </h1>
                            <p className="text-gray-600">
                                {isEditMode
                                    ? 'قم بتعديل تفاصيل العقار'
                                    : selectedBuilding
                                        ? `أدخل تفاصيل العقار لإضافته إلى مبنى ${selectedBuilding.title}`
                                        : 'أدخل تفاصيل العقار لإضافته للمنصة'
                                }
                            </p>
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
                                                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer
                                                ${currentStep === step.id
                                                    ? 'border-blue-500 bg-blue-500 text-white'
                                                    : isStepCompleted(step.id)
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : 'border-gray-300 bg-white text-gray-500'
                                                }
                                            `}
                                            onClick={() => navigateToStep(step.id)}
                                        >
                                            {isStepCompleted(step.id) ? (
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
                                        <div className={`w-16 h-0.5 mx-4 mb-8 ${isStepCompleted(step.id) ? 'bg-green-500' : 'bg-gray-300'
                                            }`} />
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
                                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    يرجى تصحيح الأخطاء التالية:
                                </h4>
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
                        {isEditMode && (
                            <Badge variant="secondary" className="text-xs">
                                وضع التعديل
                            </Badge>
                        )}
                        {selectedBuilding && (
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                مرتبط بمبنى
                            </Badge>
                        )}
                    </div>

                    {currentStep < steps.length ? (
                        <Button
                            onClick={nextStep}
                            className="flex items-center gap-2"
                            disabled={dynamicLoading}
                        >
                            التالي
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || dynamicLoading}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {isEditMode ? 'جاري التحديث...' : 'جاري الحفظ...'}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? (
                                        <>
                                            <Save className="w-4 h-4" />
                                            حفظ التغييرات
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            {selectedBuilding ? `حفظ العقار في ${selectedBuilding.title}` : 'حفظ العقار'}
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Loading Overlay for Dynamic Content */}
                {dynamicLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="text-gray-700">جاري تحميل الخصائص...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main component with Suspense wrapper
export default function RealEstatePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        جاري تحميل الصفحة...
                    </h2>
                    <p className="text-gray-600">يرجى الانتظار...</p>
                </div>
            </div>
        }>
            <RealEstatePageContent />
        </Suspense>
    );
}