// hooks/useEstateForm.ts
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { finalTypeTypeApi } from '@/api/finalTypeApi';
import { RealEstateApi } from '@/api/realEstateApi';
import apiClient from '@/api';
import { CreateEstateForm } from '../types/create';
import { CityType, FinalType, NeighborhoodType, MainType } from '../types';
import { useMainType } from './useMainType';
import { useRealEstate } from './useRealEstate';

const initialFormState: CreateEstateForm = {
    title: "",
    price: 0,
    cityId: 0,
    neighborhoodId: 0,
    bedrooms: 1,
    bathrooms: 1,
    furnished: 2,
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
    rentalDuration: 0,
    totalFloors: null
};

export function useEstateForm() {
    const [formData, setFormData] = useState<CreateEstateForm>(initialFormState);
    const [cities, setCities] = useState<CityType[]>([]);
    const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mainTypes } = useMainType();
    const { refetch: refetchEstates } = useRealEstate();

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await apiClient.get("/api/cities");
                setCities(response.data);
            } catch (error) {
                console.error("Failed to fetch cities:", error);
                toast.error("فشل في تحميل المدن");
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        const fetchFinalType = async () => {
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
        if (formData.subCategoryId && formData.subCategoryId !== 0) {
            fetchFinalType();
        }
    }, [formData.subCategoryId]);

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            try {
                const response = await apiClient.get(`/api/neighborhoods/${formData.cityId}`);
                setNeighborhoods(response.data);
            } catch (error) {
                console.error("Failed to fetch neighborhoods:", error);
                toast.error("فشل في تحميل الأحياء");
            }
        };
        if (formData.cityId) {
            fetchNeighborhoods();
        }
    }, [formData.cityId]);

    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error("يرجى إدخال عنوان العقار");
            return false;
        }
        if (formData.price <= 0) {
            toast.error("يرجى إدخال سعر صحيح");
            return false;
        }
        if (!formData.mainCategoryId || !formData.subCategoryId) {
            toast.error("يرجى اختيار التصنيف الرئيسي والفرعي");
            return false;
        }
        if (!formData.cityId || !formData.neighborhoodId) {
            toast.error("يرجى اختيار المدينة والحي");
            return false;
        }
        if (!formData.coverImage) {
            toast.error("يرجى اختيار صورة الغلاف");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === "files" && Array.isArray(value)) {
                        value.forEach((file) => formDataToSend.append("files", file));
                    } else if (key === "coverImage") {
                        formDataToSend.append("coverImage", value);
                    } else {
                        formDataToSend.append(key, value.toString());
                    }
                }
            });

            await RealEstateApi.addRealEstate(formDataToSend);
            toast.success("تمت إضافة العقار بنجاح!");
            setFormData(initialFormState);
            refetchEstates();
        } catch (error) {
            console.error("Failed to create estate:", error);
            toast.error("حدث خطأ أثناء إضافة العقار");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPropertyType = (): 'residential' | 'commercial' | 'industrial' | 'others' => {
        const subType = mainTypes
            ?.find((m) => m.id === formData.mainCategoryId)
            ?.subtypes.find(m => m.id === formData.subCategoryId);
        const finalType = finalTypes?.find(f => f.id === formData.finalTypeId);

        if (subType?.name.includes('سكني') || finalType?.name.includes('سكني')) {
            return 'residential';
        } else if (subType?.name.includes('تجاري') || finalType?.name.includes('تجاري')) {
            return 'commercial';
        } else if (subType?.name.includes('صناعي') || finalType?.name.includes('صناعي')) {
            return 'industrial';
        }
        return 'others';
    };

    return {
        formData,
        setFormData,
        cities,
        finalTypes,
        neighborhoods,
        mainTypes,
        isLoading,
        isSubmitting,
        handleSubmit,
        getPropertyType,
        initialFormState
    };
}