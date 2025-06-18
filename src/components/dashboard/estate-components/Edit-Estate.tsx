import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { ADDITIONAL_FEATURES, BUILDING_AGE_OPTION, FEATURES_BY_TYPE, FLOOR_OPTIONS, FURNISHED_OPTIONS, NEARBY_LOCATION, PAYMENT_OPTIONS, RENTAL_DURATION_OPTIONS, VIEW_OPTIONS } from "@/components/ui/constants/formOptions";
import FeaturesSelect from "@/components/ui/FeaturesSelect";
import LocationPicker from "@/components/map/LocationPicker";
import ImageUploadModal from "../forms/EnhancedImageUpload";
import { FinalCityType } from "@/lib/types";
import { toast } from "react-toastify";
import apiClient from "@/api";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { estateQuery } from "@/lib/constants/queryNames";
import { RealEstateApi } from "@/api/realEstateApi";
import ViewingTimeSelector from "@/components/forms/ViewingTimeSelector";

interface EditEstateFormProps {
    editingEstate: any;
    setEditingEstate: (estate: any) => void;
    onSubmit: (estate: any) => Promise<void>;
    cities: any[];
    neighborhoods: any[];
    finalCities: FinalCityType[];
    mainTypes: any[];
    finalTypes: any[];
}

// Create an interface for error field references
interface ErrorFieldRefs {
    [key: string]: React.RefObject<HTMLDivElement>;
}

export const EditEstateForm: React.FC<EditEstateFormProps> = ({
    editingEstate,
    setEditingEstate,
    onSubmit,
    cities,
    neighborhoods,
    mainTypes,
    finalTypes,
    finalCities
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
    const [filterConfig, setFilterConfig] = useState<any>({
        title: true,
        description: true,
        price: true,
        viewTime: true,
        paymentMethod: true,
        mainCategoryId: true,
        subCategoryId: true,
        finalTypeId: true,
        cityId: true,
        neighborhoodId: true,
        finalCityId: true,
        nearbyLocations: true,
        location: true,
        bedrooms: true,
        bathrooms: true,
        totalFloors: true,
        floorNumber: true,
        buildingAge: true,
        ceilingHeight: true,
        furnished: true,
        facade: true,
        rentalDuration: true,
        buildingArea: true,
        mainFeatures: true,
        additionalFeatures: true,
        coverImage: true,
        files: true,
    });

    const errorFieldRefs: ErrorFieldRefs = {
        title: useRef<any>(null),
        description: useRef<any>(null),
        price: useRef<any>(null),
        viewTime: useRef<any>(null),
        paymentMethod: useRef<any>(null),
        mainCategoryId: useRef<any>(null),
        subCategoryId: useRef<any>(null),
        finalTypeId: useRef<any>(null),
        cityId: useRef<any>(null),
        neighborhoodId: useRef<any>(null),
        finalCityId: useRef<any>(null),
        nearbyLocations: useRef<any>(null),
        location: useRef<any>(null),
        bedrooms: useRef<any>(null),
        bathrooms: useRef<any>(null),
        totalFloors: useRef<any>(null),
        floorNumber: useRef<any>(null),
        buildingAge: useRef<any>(null),
        ceilingHeight: useRef<any>(null),
        furnished: useRef<any>(null),
        facade: useRef<any>(null),
        rentalDuration: useRef<any>(null),
        buildingArea: useRef<any>(null),
        mainFeatures: useRef<any>(null),
        additionalFeatures: useRef<any>(null),
        coverImage: useRef<any>(null),
        files: useRef<any>(null),
    };

    const [isCoverImageUploading, setIsCoverImageUploading] = useState(false);
    const [uploadingImageIndexes, setUploadingImageIndexes] = useState<number[]>([]);

    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
        editingEstate.coverImage && typeof editingEstate.coverImage === 'string'
            ? editingEstate.coverImage
            : null
    );

    const [additionalImagesUrls, setAdditionalImagesUrls] = useState<string[]>(
        editingEstate.files && editingEstate.files.length > 0 && typeof editingEstate.files[0] === 'string'
            ? editingEstate.files
            : []
    );

    const [additionalFileTypes, setAdditionalFileTypes] = useState<string[]>(
        editingEstate.files && editingEstate.files.length > 0
            ? editingEstate.files.map((file: string) => {
                const ext = file.split('.').pop()?.toLowerCase();
                if (ext === 'mp4' || ext === 'mov' || ext === 'webm') return 'video/mp4';
                return 'image/jpeg'; // Default assumption
            })
            : []
    );

    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
        editingEstate.coverImage && typeof editingEstate.coverImage === 'string'
            ? `${editingEstate.coverImage}`
            : null
    );

    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>(
        editingEstate.files && editingEstate.files.length > 0 && typeof editingEstate.files[0] === 'string'
            ? editingEstate.files.map((file: string) => `${file}`)
            : []
    );

    const [coverImageProgress, setCoverImageProgress] = useState<number>(0);
    const [additionalImageProgress, setAdditionalImageProgress] = useState<Record<number, number>>({});

    useEffect(() => {
        setIsUploading(isCoverImageUploading || uploadingImageIndexes.length > 0);
    }, [isCoverImageUploading, uploadingImageIndexes]);

    // Function to fetch filter config based on property type
    useEffect(() => {
        async function fetchFilterConfig() {
            try {
                const mainCategoryName =
                    editingEstate.mainCategoryId && mainTypes
                        ? mainTypes.find((m) => m.id === Number(editingEstate.mainCategoryId))?.name || ""
                        : "";
                const finalTypeName =
                    editingEstate.finalTypeId && finalTypes
                        ? finalTypes.find((m) => m.id === Number(editingEstate.finalTypeId))?.name || ""
                        : "";
                const subCategoryName =
                    editingEstate.subCategoryId && mainTypes
                        ? mainTypes.flatMap(m => m.subtypes).find(sub => sub.id === Number(editingEstate.subCategoryId))?.name || ""
                        : "";

                const response = await RealEstateApi.fetchFilter(mainCategoryName, subCategoryName, finalTypeName);
                setFilterConfig(response);
                console.log("Filter config loaded:", response);

            } catch (error) {
                console.error("Failed to fetch filter config:", error);
                // Set default filter config if fetch fails
                setFilterConfig({
                    title: true,
                    description: true,
                    price: true,
                    viewTime: true,
                    paymentMethod: true,
                    mainCategoryId: true,
                    subCategoryId: true,
                    finalTypeId: true,
                    cityId: true,
                    neighborhoodId: true,
                    finalCityId: true,
                    nearbyLocations: true,
                    location: true,
                    bedrooms: true,
                    bathrooms: true,
                    totalFloors: true,
                    floorNumber: true,
                    buildingAge: true,
                    ceilingHeight: true,
                    furnished: true,
                    facade: true,
                    rentalDuration: true,
                    buildingArea: true,
                    mainFeatures: true,
                    additionalFeatures: true,
                    coverImage: true,
                    files: true,
                });
            }
        }
        fetchFilterConfig();
    }, [editingEstate.mainCategoryId, editingEstate.subCategoryId, editingEstate.finalTypeId, mainTypes, finalTypes]);

    const isLandType = () => {
        const mainType = mainTypes?.find((m: any) => m.id === editingEstate.mainCategoryId);
        const subType = mainType?.subtypes.find((st: any) => st.id === editingEstate.subCategoryId);
        const finalType = finalTypes?.find((f: any) => f.id === editingEstate.finalTypeId);

        return subType?.name?.includes("أرض") || finalType?.name?.includes("أرض");
    };

    const isRentalType = () => {
        const mainType = mainTypes?.find((m: any) => m.id === editingEstate.mainCategoryId);
        return mainType?.name?.includes("إيجار");
    }

    const getPropertyType = (): "residential" | "commercial" | "industrial" | "others" => {
        const mainType = mainTypes?.find((m: any) => m.id === editingEstate.mainCategoryId);
        const subType = mainType?.subtypes.find((st: any) => st.id === editingEstate.subCategoryId);
        const finalType = finalTypes?.find((f: any) => f.id === editingEstate.finalTypeId);

        if (subType?.name?.includes("سكني") || finalType?.name?.includes("سكني")) {
            return "residential";
        } else if (subType?.name?.includes("تجاري") || finalType?.name?.includes("تجاري")) {
            return "commercial";
        } else if (subType?.name?.includes("صناعي") || finalType?.name?.includes("صناعي")) {
            return "industrial";
        }
        return "others";
    };

    const handleChange = (field: string, value: any) => {
        if (field === 'location') {
            const locationString = `${value.latitude},${value.longitude}`;
            setEditingEstate((prev: any) => ({ ...prev, [field]: locationString }));
            return;
        }
        if (field === 'finalCityId') {
            setEditingEstate((prev: any) => ({ ...prev, [field]: value }));

            const selectedFinalCity = finalCities.find(c => c.id === value);

            if (selectedFinalCity && selectedFinalCity.location) {
                const [lat, lng] = selectedFinalCity.location.split(",");

                if (lat && lng) {
                    const locationString = `${lat},${lng}`;
                    setEditingEstate((prev: any) => ({ ...prev, ["location"]: locationString }))
                }
            }
            return;
        }
        if ((field === "bedrooms" || field === "bathrooms" || field === "totalFloors")) {
            const numValue = Number(value);
            if (field === "totalFloors") {
                if (numValue > 12) {
                    return;
                }
            }
            if (numValue <= 0) {
                return;
            }
        }
        setEditingEstate((prev: any) => ({ ...prev, [field]: value }));
    };

    // useEffect(() => {
    //     // When finalCityId changes, update the location
    //     if (editingEstate.finalCityId) {
    //         const selectedFinalCity = finalCities.find(c => c.id === editingEstate.finalCityId);

    //         if (selectedFinalCity && selectedFinalCity.location) {
    //             // Only update if we don't already have a location or if we're explicitly changing areas
    //             const [lat, lng] = selectedFinalCity.location.split(",");

    //             if (lat && lng) {
    //                 // Update the location in the form
    //                 handleChange("location", {
    //                     latitude: parseFloat(lat),
    //                     longitude: parseFloat(lng)
    //                 });

    //                 console.log("Updated location based on selected finalCity:", {
    //                     finalCityId: editingEstate.finalCityId,
    //                     location: selectedFinalCity.location
    //                 });
    //             }
    //         }
    //     }
    // }, [editingEstate.finalCityId]);

    // Function to upload file to API with progress tracking
    const uploadFileToAPI = async (file: File, index: number = -1): Promise<string> => {
        try {
            // Create FormData object
            const formData = new FormData();

            // Append the file with its original name and type preserved
            formData.append('file', file, file.name);

            // Add estate ID if we're editing an existing estate
            if (editingEstate.id) {
                formData.append('estateId', editingEstate.id.toString());
            }

            // Add additional metadata
            formData.append('fileType', file.type);
            formData.append('fileName', file.name);
            formData.append('fileSize', file.size.toString());

            // Reset progress at the start of upload
            if (index === -1) {
                setCoverImageProgress(0);
            } else {
                setAdditionalImageProgress(prev => ({
                    ...prev,
                    [index]: 0
                }));
            }

            // Use axios to post the FormData
            const response = await axios.post(
                `api/upload/uploadFile`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            if (index === -1) {
                                setCoverImageProgress(percentCompleted);
                            } else {
                                setAdditionalImageProgress(prev => ({
                                    ...prev,
                                    [index]: percentCompleted
                                }));
                            }
                        }
                    }
                }
            );

            const data = response.data;
            toast.success('تم رفع الملف بنجاح');
            return data.fileName;

        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error('فشل رفع الملف، يرجى المحاولة مرة أخرى');

            // Reset progress on error
            if (index === -1) {
                setCoverImageProgress(0);
            } else {
                setAdditionalImageProgress(prev => ({
                    ...prev,
                    [index]: 0
                }));
            }

            throw error;
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم الملف كبير جدًا. الحد الأقصى هو 5 ميجابايت');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار ملف صورة صالح');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setCoverImagePreview(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);

        try {
            setIsCoverImageUploading(true);
            setCoverImageProgress(0); // Reset progress

            const uploadedUrl = await uploadFileToAPI(file, -1);

            setCoverImageUrl(uploadedUrl);
            handleChange('coverImage', uploadedUrl);

        } catch (error) {
            console.error("Cover image upload failed:", error);
            setCoverImagePreview(null);
        } finally {
            setTimeout(() => {
                setIsCoverImageUploading(false);
                setCoverImageProgress(0);
            }, 500);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('حجم الملف كبير جدًا. الحد الأقصى هو 10 ميجابايت');
            return;
        }

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            toast.error('يُرجى اختيار ملف صورة أو فيديو صالح');
            return;
        }

        // For videos, limit to 30 seconds
        if (isVideo) {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = function () {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 30) {
                    toast.error('مدة الفيديو لا يمكن أن تتجاوز 30 ثانية');
                    return;
                }
                // Continue with upload after validation
                continueWithUpload();
            };

            video.src = URL.createObjectURL(file);
            video.onerror = function () {
                // Handle video load error
                window.URL.revokeObjectURL(video.src);
                toast.error('فشل تحميل الفيديو، يرجى التحقق من صحة الملف');
            };

            return; // Wait for metadata to load
        }

        // For images, continue immediately
        continueWithUpload();

        async function continueWithUpload() {
            // Detect file type
            const fileType = file!.type;
            const newTypes = [...additionalFileTypes];
            newTypes[index] = fileType;
            setAdditionalFileTypes(newTypes);

            // Create preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const newPreviews = [...additionalImagePreviews];
                    newPreviews[index] = e.target.result as string;
                    setAdditionalImagePreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file!);

            try {
                // Add this index to loading indexes
                setUploadingImageIndexes(prev => [...prev, index]);

                // Reset progress for this index
                setAdditionalImageProgress(prev => ({
                    ...prev,
                    [index]: 0
                }));

                const uploadedUrl = await uploadFileToAPI(file!, index);

                // Store the URL
                const newUrls = [...additionalImagesUrls];
                newUrls[index] = uploadedUrl;
                setAdditionalImagesUrls(newUrls);

                // Update the main form state
                const updatedFiles = Array.isArray(editingEstate.files) ? [...editingEstate.files] : [];
                updatedFiles[index] = uploadedUrl;
                handleChange('files', updatedFiles);

            } catch (error) {
                console.error("File upload failed:", error);
                // Remove the preview on error
                const newPreviews = [...additionalImagePreviews];
                newPreviews[index] = "";
                setAdditionalImagePreviews(newPreviews);
            } finally {
                // Wait a moment before hiding loading indicator to make sure user sees 100%
                setTimeout(() => {
                    setUploadingImageIndexes(prev => prev.filter(i => i !== index));
                    setAdditionalImageProgress(prev => {
                        const newProgress = { ...prev };
                        delete newProgress[index];
                        return newProgress;
                    });
                }, 500);
            }
        }
    };

    const client = useQueryClient();
    const deleteFilesFromAPI = async (fileUrls: string[]): Promise<boolean> => {
        if (!fileUrls.length) return true;

        try {
            const deletePromises = fileUrls.map(fileUrl =>
                axios.delete(`api/realestate/deleteFile/${fileUrl}`)
            );

            await Promise.all(deletePromises);
            client.invalidateQueries({
                queryKey: [estateQuery]
            })
            return true;
        } catch (error) {
            console.error("Failed to delete files:", error);
            return false;
        }
    };

    const handleDeleteAdditionalImage = (index: number) => {
        try {
            const fileUrl = additionalImagesUrls[index];

            if (fileUrl && typeof fileUrl === 'string' && !fileUrl.startsWith('data:')) {
                setFilesToDelete(prev => [...prev, fileUrl]);
            }

            const newPreviews = [...additionalImagePreviews];
            const newUrls = [...additionalImagesUrls];
            const newTypes = [...additionalFileTypes];

            newPreviews.splice(index, 1);
            newUrls.splice(index, 1);
            newTypes.splice(index, 1);

            setAdditionalImagePreviews(newPreviews);
            setAdditionalImagesUrls(newUrls);
            setAdditionalFileTypes(newTypes);

            const updatedFiles = Array.isArray(editingEstate.files) ? [...editingEstate.files] : [];
            updatedFiles.splice(index, 1);
            handleChange('files', updatedFiles);

            toast.info('تم حذف الملف من القائمة - سيتم الحذف النهائي عند حفظ التغييرات');
        } catch (error) {
            console.error("Failed to prepare file for deletion:", error);
            toast.error('فشل إعداد الملف للحذف');
        }
    };

    // Function to scroll to the first error
    const scrollToFirstError = () => {
        // Get all field names with errors
        const errorFields = Object.keys(editingEstate.errors || {}).filter(key => !!editingEstate.errors[key]);

        if (errorFields.length > 0) {
            // Get the first field with an error
            const firstErrorField = errorFields[0];

            // Get the reference to that field
            const errorRef = errorFieldRefs[firstErrorField];

            // Scroll to the field if we have a reference for it
            if (errorRef && errorRef.current) {
                errorRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isUploading) {
            toast.warning('يرجى الانتظار حتى اكتمال رفع جميع الملفات');
            return;
        }

        setIsSubmitting(true);
        try {
            const estateToSubmit = { ...editingEstate };
            if (coverImageUrl) {
                estateToSubmit.coverImage = coverImageUrl;
            }

            if (additionalImagesUrls.length > 0) {
                estateToSubmit.files = additionalImagesUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
            }

            if (estateToSubmit.files) {
                estateToSubmit.files = estateToSubmit.files.filter(
                    (url: string) => !url.startsWith('data:')
                );
            }

            const success = await onSubmit(estateToSubmit);

            if (filesToDelete.length > 0) {
                await deleteFilesFromAPI(filesToDelete);
                setFilesToDelete([]);
            }

            toast.success('تم حفظ التغييرات بنجاح');
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error('حدث خطأ أثناء حفظ التغييرات');
            setTimeout(() => {
                scrollToFirstError();
            }, 100);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Wait until filterConfig is fetched
    if (!filterConfig) {
        return <div>Loading...</div>;
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
            dir="rtl"
        >
            <h2 className="text-xl font-semibold mb-6">تعديل العقار</h2>

            {/* Basic Info */}
            {filterConfig.title && (
                <div ref={errorFieldRefs.title}>
                    <FormField label="عنوان العقار">
                        <div className="space-y-1">
                            <InputField
                                type="text"
                                value={editingEstate.title}
                                onChange={(value: any) => {
                                    // Only update if under the character limit
                                    if (value.length <= 100) {
                                        handleChange("title", value);
                                    }
                                }}
                                placeholder="أدخل عنوان العقار"
                                required
                                maxLength={100}
                            />
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">الحد الأقصى 100 حرف</span>
                                <span className={`${editingEstate.title.length > 90 ? 'text-amber-600' : ''} ${editingEstate.title.length >= 100 ? 'text-red-500' : ''}`}>
                                    {editingEstate.title.length}/100
                                </span>
                            </div>
                        </div>
                    </FormField>
                </div>
            )}

            {filterConfig.description && (
                <div ref={errorFieldRefs.description}>
                    <FormField label="وصف العقار">
                        <div className="space-y-1">
                            <InputField
                                type="textArea"
                                value={editingEstate.description}
                                onChange={(value: any) => {
                                    // Only update if under the character limit
                                    if (value.length <= 1000) {
                                        handleChange("description", value);
                                    }
                                }}
                                placeholder="أدخل وصف العقار"
                                required
                                maxLength={1000}
                            />
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">الحد الأقصى 1000 حرف</span>
                                <span className={`${editingEstate.description.length > 900 ? 'text-amber-600' : ''} ${editingEstate.description.length >= 1000 ? 'text-red-500' : ''}`}>
                                    {editingEstate.description.length}/1000
                                </span>
                            </div>
                        </div>
                    </FormField>
                </div>
            )}

            {filterConfig.price && (
                <div ref={errorFieldRefs.price}>
                    <FormField label="السعر">
                        <InputField
                            type="text"
                            value={editingEstate.price === 0 ? "" : editingEstate.price}
                            onChange={(value) => {
                                const numValue = Number(value);
                                if (isNaN(numValue)) {
                                    handleChange("price", ""); // or handle it appropriately
                                } else {
                                    handleChange("price", numValue);
                                }
                            }}
                            placeholder="أدخل السعر"
                            required
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.viewTime && (
                <div ref={errorFieldRefs.viewTime}>
                    <FormField label="وقت المشاهدة">
                        <ViewingTimeSelector
                            value={editingEstate.viewTime}
                            onChange={(value) => handleChange('viewTime', value)}
                            label="وقت المشاهدة"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.paymentMethod && (
                <div ref={errorFieldRefs.paymentMethod}>
                    <FormField label="طريقة الدفع">
                        <FeaturesSelect
                            features={PAYMENT_OPTIONS}
                            selectedFeatures={editingEstate.paymentMethod?.split("، ").filter(Boolean) || []}
                            onChange={(selected) => handleChange('paymentMethod', selected.join("، "))}
                            placeholder="اختر طريقة الدفع"
                            selectionText={{
                                single: "طريقة دفع",
                                multiple: "طرق دفع"
                            }}
                        />
                    </FormField>
                </div>
            )}

            {/* Categories */}
            {filterConfig.mainCategoryId && (
                <div ref={errorFieldRefs.mainCategoryId}>
                    <FormField label="التصنيف الرئيسي">
                        <SelectField
                            value={editingEstate.mainCategoryId}
                            onChange={(value) => {
                                handleChange("mainCategoryId", Number(value));
                                handleChange("subCategoryId", 0);
                                handleChange("mainFeatures", "");
                            }}
                            options={mainTypes?.map((type: any) => ({
                                value: type.id,
                                label: type.name,
                            })) || []}
                            placeholder="اختر التصنيف الرئيسي"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.subCategoryId && editingEstate.mainCategoryId > 0 && (
                <div ref={errorFieldRefs.subCategoryId}>
                    <FormField label="التصنيف الفرعي">
                        <SelectField
                            value={editingEstate.subCategoryId}
                            onChange={(value) => handleChange("subCategoryId", Number(value))}
                            options={mainTypes
                                ?.find((m: any) => m.id === editingEstate.mainCategoryId)
                                ?.subtypes.map((sub: any) => ({
                                    value: sub.id,
                                    label: sub.name,
                                })) || []}
                            placeholder="اختر التصنيف الفرعي"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.finalTypeId && editingEstate.subCategoryId > 0 && (
                <div ref={errorFieldRefs.finalTypeId}>
                    <FormField label="التصنيف النهائي">
                        <SelectField
                            value={editingEstate.finalTypeId}
                            onChange={(value) => handleChange("finalTypeId", Number(value))}
                            options={finalTypes.map((type: any) => ({
                                value: type.id,
                                label: type.name,
                            }))}
                            placeholder="اختر التصنيف النهائي"
                        />
                    </FormField>
                </div>
            )}

            {/* Location */}
            {filterConfig.cityId && (
                <div ref={errorFieldRefs.cityId}>
                    <FormField label="المحافظة">
                        <SelectField
                            value={editingEstate.cityId}
                            onChange={(value) => handleChange("cityId", Number(value))}
                            options={cities.map((city: any) => ({
                                value: city.id,
                                label: city.name,
                            }))}
                            placeholder="اختر المحافظة"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.neighborhoodId && (
                <div ref={errorFieldRefs.neighborhoodId}>
                    <FormField label="المدينة">
                        <SelectField
                            value={editingEstate.neighborhoodId}
                            onChange={(value) => handleChange("neighborhoodId", Number(value))}
                            options={neighborhoods.map((nb: any) => ({
                                value: nb.id,
                                label: nb.name,
                            }))}
                            placeholder="اختر المدينة"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.finalCityId && (
                <div ref={errorFieldRefs.finalCityId}>
                    <FormField label="المنطقة">
                        <SelectField
                            value={editingEstate.finalCityId}
                            onChange={(value) => handleChange("finalCityId", Number(value))}
                            options={finalCities.map((nb: any) => ({
                                value: nb.id,
                                label: nb.name,
                            }))}
                            placeholder="اختر المنطقة"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.nearbyLocations && (
                <div ref={errorFieldRefs.nearbyLocations}>
                    <FormField label="الأماكن القريبة">
                        <FeaturesSelect
                            features={NEARBY_LOCATION}
                            selectedFeatures={editingEstate.nearbyLocations?.split('، ').filter(Boolean) || []}
                            onChange={(features) => handleChange('nearbyLocations', features.join('، '))}
                            placeholder="اختر الأماكن القريبة"
                            selectionText={{
                                single: "مكان قريبة",
                                multiple: "أماكن قريب"
                            }}
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.location && (
                <div ref={errorFieldRefs.location}>
                    <FormField label="تحديد الموقع على الخريطة">
                        <LocationPicker
                            key={`location-${editingEstate.finalCityId || 'default'}`}
                            initialLatitude={
                                parseFloat(editingEstate.location.split(',')[0])
                            }
                            initialLongitude={
                                parseFloat(editingEstate.location.split(',')[1])
                            }
                            onLocationSelect={(latitude, longitude) => {
                                handleChange('location', { latitude, longitude });
                            }}
                        />
                    </FormField>
                </div>
            )}


            {/* Property Details */}
            {filterConfig.bedrooms && (
                <div className="grid grid-cols-2 gap-4">
                    <div ref={errorFieldRefs.bedrooms}>
                        <FormField label="عدد الغرف">
                            <InputField
                                type="number"
                                value={editingEstate.bedrooms}
                                onChange={(value) => handleChange("bedrooms", Number(value))}
                                min={1}
                            />
                        </FormField>
                    </div>
                    {filterConfig.bathrooms && (
                        <div ref={errorFieldRefs.bathrooms}>
                            <FormField label="عدد الحمامات">
                                <InputField
                                    type="number"
                                    value={editingEstate.bathrooms}
                                    onChange={(value) => handleChange("bathrooms", Number(value))}
                                    min={1}
                                />
                            </FormField>
                        </div>
                    )}
                </div>
            )}

            {filterConfig.totalFloors && (
                <div ref={errorFieldRefs.totalFloors}>
                    <FormField label="عدد الطوابق">
                        <InputField
                            type="number"
                            value={editingEstate.totalFloors}
                            onChange={(value) => handleChange('totalFloors', Number(value))}
                            min={1}
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.floorNumber && (
                <div ref={errorFieldRefs.floorNumber}>
                    <FormField label="الطابق">
                        <SelectField
                            value={editingEstate.floorNumber}
                            onChange={(value) => handleChange("floorNumber", Number(value))}
                            options={FLOOR_OPTIONS}
                            placeholder="اختر الطابق"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.buildingAge && (
                <div ref={errorFieldRefs.buildingAge}>
                    <FormField label="عمر البناء">
                        <SelectField
                            value={editingEstate.buildingAge}
                            onChange={(value) => handleChange("buildingAge", value)}
                            options={BUILDING_AGE_OPTION}
                            placeholder="اختر عمر المبنى"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.ceilingHeight && (
                <div ref={errorFieldRefs.ceilingHeight}>
                    <FormField label="إرتفاع السقف">
                        <InputField
                            type="number"
                            value={editingEstate.ceilingHeight}
                            onChange={(value) => handleChange('ceilingHeight', Number(value))}
                            min={1}
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.furnished && (
                <div ref={errorFieldRefs.furnished}>
                    <FormField label="مفروشة">
                        <SelectField
                            value={editingEstate.furnished}
                            onChange={(value) => handleChange("furnished", Number(value))}
                            options={FURNISHED_OPTIONS}
                            placeholder="اختر حالة الفرش"
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.facade && (
                <div ref={errorFieldRefs.facade}>
                    <FormField label="الإطلالة">
                        <FeaturesSelect
                            features={VIEW_OPTIONS.map(f => f.value)}
                            selectedFeatures={editingEstate.facade?.split("، ").filter(Boolean) || []}
                            onChange={(features) => handleChange("facade", features.join("، "))}
                            placeholder="اختر الإطلالة"
                            selectionText={{
                                single: "إطلالة",
                                multiple: "إطلالات",
                            }}
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.rentalDuration && (
                <div ref={errorFieldRefs.rentalDuration}>
                    <FormField label="مدة العقد">
                        <SelectField
                            value={editingEstate.rentalDuration}
                            onChange={(value) => handleChange('rentalDuration', value)}
                            options={RENTAL_DURATION_OPTIONS}
                            placeholder="اختر مدة العقد"
                        />
                    </FormField>
                </div>
            )}

            {/* Always show area */}
            {filterConfig.buildingArea && (
                <div ref={errorFieldRefs.buildingArea}>
                    <FormField label="المساحة">
                        <InputField
                            type="number"
                            value={editingEstate.buildingArea}
                            onChange={(value) => {
                                if (Number(value) > 0) {
                                    handleChange('buildingArea', value);
                                } else {
                                    handleChange('buildingArea', "");
                                }
                            }}
                            placeholder="المساحة بالمتر المربع"
                        />
                    </FormField>
                </div>
            )}

            {/* Features */}
            {filterConfig.mainFeatures && (
                <div ref={errorFieldRefs.mainFeatures}>
                    <FormField label="الميزات الاساسية">
                        <FeaturesSelect
                            features={FEATURES_BY_TYPE[getPropertyType()]}
                            selectedFeatures={editingEstate.mainFeatures?.split("، ").filter(Boolean) || []}
                            onChange={(features) => handleChange("mainFeatures", features.join("، "))}
                            placeholder="اختر الميزات الأساسية"
                            selectionText={{
                                single: "ميزة أساسية",
                                multiple: "ميزات أساسية"
                            }}
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.additionalFeatures && (
                <div ref={errorFieldRefs.additionalFeatures}>
                    <FormField label="الميزات الإضافية">
                        <FeaturesSelect
                            features={ADDITIONAL_FEATURES}
                            selectedFeatures={editingEstate.additionalFeatures?.split("، ").filter(Boolean) || []}
                            onChange={(features) => handleChange("additionalFeatures", features.join("، "))}
                            placeholder="اختر الميزات الإضافية"
                            selectionText={{
                                single: "ميزة إضافية",
                                multiple: "ميزات إضافية"
                            }}
                        />
                    </FormField>
                </div>
            )}

            {filterConfig.coverImage && (
                <div ref={errorFieldRefs.coverImage}>
                    <FormField label="صور العقار">
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
                    </FormField>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className={`w-full ${isSubmitting || isUploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        جاري الحفظ...
                    </>
                ) : (
                    <>
                        <Plus className="w-5 h-5" />
                        حفظ التعديلات
                    </>
                )}
            </button>

        </form>)
}