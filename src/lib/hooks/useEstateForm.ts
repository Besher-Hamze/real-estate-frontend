// hooks/useEstateForm.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { finalTypeTypeApi } from '@/api/finalTypeApi';
import { RealEstateApi } from '@/api/realEstateApi';
import apiClient from '@/api';
import { CreateEstateForm } from '../types/create';
import { CityType, FinalType, NeighborhoodType, MainType, FinalCityType } from '../types';
import { useMainType } from './useMainType';
import { useRealEstate } from './useRealEstate';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { createValidationContext, estateSchema } from '@/schemas/estateSchema';
import { finalCityApi } from '@/api/finalCityApi';

const initialFormState: CreateEstateForm = {
    title: "",
    description: "",
    price: 0,
    cityId: 0,
    neighborhoodId: 0,
    finalCityId: 0,
    bedrooms: 1,
    bathrooms: 1,
    furnished: 1,
    buildingArea: "",
    floorNumber: 0,
    facade: "",
    paymentMethod: "",
    mainCategoryId: 0,
    subCategoryId: 0,
    finalTypeId: 0,
    mainFeatures: "",
    additionalFeatures: "",
    nearbyLocations: "",
    coverImage: null,
    files: null,
    ceilingHeight: 0,
    rentalDuration: "",
    totalFloors: 0,
    viewTime: '',
    buildingItemId: '',
    location: "23.5880,58.3829 ",
    buildingAge: ""
};

export function useEstateForm(buildingItemId?: string) {
    // Initialize the form state, accounting for buildingItemId if provided
    const initialState = {
        ...initialFormState,
        ...(buildingItemId ? { buildingItemId } : {})
    };

    // State for data fetching
    const [cities, setCities] = useState<CityType[]>([]);
    const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
    const [finalCities, setFinalCities] = useState<FinalCityType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { mainTypes } = useMainType();
    const { refetch: refetchEstates } = useRealEstate();

    // Use our form validation hook for a single source of truth
    const {
        formData,
        errors,
        isSubmitting,
        setFormData,
        handleChange: baseHandleChange,
        handleSubmit,
        validateForm
    } = useFormValidation(
        estateSchema,
        initialState,
        createValidationContext
    );

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await apiClient.get("/api/cities");
                setCities(response.data);
            } catch (error) {
                console.error("Failed to fetch cities:", error);
                toast.error("فشل في تحميل المحافظة");
            }
        };
        fetchCities();
    }, []);

    // Fetch final types when subCategoryId changes
    useEffect(() => {
        const fetchFinalTypes = async () => {
            if (!formData.subCategoryId || formData.subCategoryId === 0) {
                setFinalTypes([]);
                return;
            }

            try {
                setIsLoading(true);
                const response = await finalTypeTypeApi.fetchFinalTypeBySubId(formData.subCategoryId);
                setFinalTypes(response);
            } catch (error) {
                console.error("Failed to fetch final types:", error);
                toast.error("فشل في تحميل التصنيفات النهائية");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinalTypes();
    }, [formData.subCategoryId]);

    // Fetch neighborhoods when cityId changes
    useEffect(() => {
        const fetchNeighborhoods = async () => {
            if (!formData.cityId) {
                setNeighborhoods([]);
                return;
            }
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/api/neighborhoods/${formData.cityId}`);
                setNeighborhoods(response.data);
            } catch (error) {
                console.error("Failed to fetch neighborhoods:", error);
                toast.error("فشل في تحميل المدن");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNeighborhoods();
    }, [formData.cityId]);

    useEffect(() => {
        const fetchFinalCities = async () => {
            if (!formData.cityId) {
                setNeighborhoods([]);
                return;
            }
            try {
                setIsLoading(true);
                const response = await finalCityApi.fetchFinalCityByNeighborhoodId(formData.neighborhoodId);;
                setFinalCities(response);
            } catch (error) {
                console.error("Failed to fetch neighborhoods:", error);
                toast.error("فشل في تحميل المناطق");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFinalCities();
    }, [formData.neighborhoodId]);

    const handleChange = useCallback((field: string, value: any) => {
        baseHandleChange(field, value as any);

        if (field === 'mainCategoryId') {
            baseHandleChange('subCategoryId', 0);
            baseHandleChange('finalTypeId', 0);
            setFinalTypes([]);
        } else if (field === 'cityId') {
            baseHandleChange('neighborhoodId', 0);
            baseHandleChange('finalCityId', 0);
        }
    }, [baseHandleChange]);

    const submitFormData = async (): Promise<boolean> => {
        let success = false;

        await handleSubmit(async (validData) => {
            if (buildingItemId) {
                validData.buildingItemId = buildingItemId;
            }
            
            try {
                setIsLoading(true);
                const formDataToSend = new FormData();

                Object.entries(validData).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (key === "files" && Array.isArray(value)) {
                            // Handle file array
                            value.forEach((file) => {
                                if (file instanceof File) {
                                    formDataToSend.append("files", file);
                                }
                            });
                        } else if (key === "coverImage" && value instanceof File) {
                            // Handle cover image file
                            formDataToSend.append("coverImage", value);
                        } else if (typeof value === 'number' || typeof value === 'boolean') {
                            // Convert numbers and booleans to strings
                            formDataToSend.append(key, value.toString());
                        } else if (typeof value === 'string') {
                            // Handle strings directly
                            formDataToSend.append(key, value);
                        } else if (value instanceof Blob) {
                            // Handle Blob objects
                            formDataToSend.append(key, value);
                        }
                    }
                });

                await RealEstateApi.addRealEstate(formDataToSend);
                toast.success("تمت إضافة العقار بنجاح!");

                // Reset form
                const newInitialState = {
                    ...initialFormState,
                    ...(buildingItemId ? { buildingItemId } : {})
                };

                setFormData(newInitialState);

                // Clear file inputs
                const fileInputs = document.querySelectorAll('input[type="file"]');
                fileInputs.forEach((input) => {
                    (input as HTMLInputElement).value = '';
                });

                refetchEstates();
                success = true;
            } catch (error) {
                console.error("Failed to create estate:", error);
                toast.error("حدث خطأ أثناء إضافة العقار");
                success = false;
            } finally {
                setIsLoading(false);
            }
        });

        return success;
    };

    const getPropertyType = (): 'residential' | 'commercial' | 'industrial' | 'others' => {
        const subType = mainTypes
            ?.find((m) => m.id === formData.mainCategoryId)
            ?.subtypes.find(m => m.id === formData.subCategoryId);
        const finalType = finalTypes?.find(f => f.id === formData.finalTypeId);

        if (subType?.name?.includes('سكني') || finalType?.name?.includes('سكني')) {
            return 'residential';
        } else if (subType?.name?.includes('تجاري') || finalType?.name?.includes('تجاري')) {
            return 'commercial';
        } else if (subType?.name?.includes('صناعي') || finalType?.name?.includes('صناعي')) {
            return 'industrial';
        }
        return 'others';
    };

    // Determine if property is land type for conditional validation
    const isLandType = () => {
        const selectedSubType = mainTypes
            ?.find(m => m.id === formData.mainCategoryId)
            ?.subtypes.find(sub => sub.id === formData.subCategoryId);

        const selectedFinalType = finalTypes.find(type => type.id === formData.finalTypeId);

        return (selectedSubType?.name?.includes('أرض') || selectedFinalType?.name?.includes('أرض')) || false;
    };

    // Determine if property is rental type for conditional validation
    const isRentalType = () => {
        const mainType = mainTypes?.find((m: any) => m.id === formData.mainCategoryId);
        return mainType?.name?.includes("إيجار") || false;
    };

    return {
        formData,
        errors,
        setFormData,
        handleChange,
        cities,
        finalTypes,
        neighborhoods,
        finalCities,
        mainTypes,
        isLoading,
        isSubmitting,
        submitFormData,
        getPropertyType,
        isLandType,
        isRentalType,
        initialFormState
    };
}