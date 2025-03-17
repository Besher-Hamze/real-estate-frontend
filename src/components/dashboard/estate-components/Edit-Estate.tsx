import React, { useState, useEffect } from "react";
import { Plus, X, Loader, Upload } from "lucide-react";
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

const EditEstateForm: React.FC<EditEstateFormProps> = ({
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
            ? `${process.env.NEXT_PUBLIC_API_URL}/${editingEstate.coverImage}`
            : null
    );

    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>(
        editingEstate.files && editingEstate.files.length > 0 && typeof editingEstate.files[0] === 'string'
            ? editingEstate.files.map((file: string) => `${process.env.NEXT_PUBLIC_API_URL}/${file}`)
            : []
    );

    const [coverImageProgress, setCoverImageProgress] = useState<number>(0);
    const [additionalImageProgress, setAdditionalImageProgress] = useState<Record<number, number>>({});

    useEffect(() => {
        setIsUploading(isCoverImageUploading || uploadingImageIndexes.length > 0);
    }, [isCoverImageUploading, uploadingImageIndexes]);

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

    const shouldHideResidentialFields = isLandType();
    const shouldShowRentalField = isRentalType();

    const handleChange = (field: string, value: any) => {
        if (field === 'location') {
            const locationString = `${value.latitude},${value.longitude}`;
            setEditingEstate((prev: any) => ({ ...prev, [field]: locationString }));
            return;
        }
        if ((field === "bedrooms" || field === "bathrooms")) {
            const numValue = Number(value);
            if (numValue <= 0) {
                return;
            }
        }
        setEditingEstate((prev: any) => ({ ...prev, [field]: value }));
    };

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/upload/uploadFile`,
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
                axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/realestate/deleteFile/${fileUrl}`)
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

            // First submit the updated estate data
            await onSubmit(estateToSubmit);

            if (filesToDelete.length > 0) {
                await deleteFilesFromAPI(filesToDelete);
                setFilesToDelete([]);
            }

            toast.success('تم حفظ التغييرات بنجاح');
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error('حدث خطأ أثناء حفظ التغييرات');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
            dir="rtl"
        >
            <h2 className="text-xl font-semibold mb-6">تعديل العقار</h2>

            {/* Basic Info */}
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

            <FormField label="وقت المشاهدة">
                <InputField
                    type="textArea"
                    value={editingEstate.viewTime || ''}
                    onChange={(value) => handleChange("viewTime", value)}
                    placeholder="أدخل وقت المشاهدة (مثال: من الساعة 9 صباحًا إلى 5 مساءً)"
                />
            </FormField>
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

            {/* Categories */}
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

            {editingEstate.mainCategoryId > 0 && (
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
            )}

            {editingEstate.subCategoryId > 0 && (
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
            )}

            {/* Location */}
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
            <FormField label="تحديد الموقع على الخريطة">
                <LocationPicker
                    initialLatitude={editingEstate.location ? parseFloat(editingEstate.location.split(',')[0]) : undefined}
                    initialLongitude={editingEstate.location ? parseFloat(editingEstate.location.split(',')[1]) : undefined}
                    onLocationSelect={(latitude, longitude) => {
                        handleChange('location', { latitude, longitude });
                    }}
                />
            </FormField>

            {/* Property Details - Only show if not land type */}
            {!shouldHideResidentialFields && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="عدد الغرف">
                            <InputField
                                type="number"
                                value={editingEstate.bedrooms}
                                onChange={(value) => handleChange("bedrooms", Number(value))}
                                min={1}
                            />
                        </FormField>
                        <FormField label="عدد الحمامات">
                            <InputField
                                type="number"
                                value={editingEstate.bathrooms}
                                onChange={(value) => handleChange("bathrooms", Number(value))}
                                min={1}
                            />
                        </FormField>
                    </div>

                    <FormField label="عدد الطوابق">
                        <InputField
                            type="number"
                            value={editingEstate.totalFloors}
                            onChange={(value) => handleChange('totalFloors', Number(value))}
                            min={1}
                        />
                    </FormField>

                    <FormField label="الطابق">
                        <SelectField
                            value={editingEstate.floorNumber}
                            onChange={(value) => handleChange("floorNumber", Number(value))}
                            options={FLOOR_OPTIONS}
                            placeholder="اختر الطابق"
                        />
                    </FormField>

                    <FormField label="عمر البناء">
                        <SelectField
                            value={editingEstate.buildingAge}
                            onChange={(value) => handleChange("buildingAge", value)}
                            options={BUILDING_AGE_OPTION}
                            placeholder="اختر عمر المبنى"
                        />
                    </FormField>

                    <FormField label="إرتفاع السقف">
                        <InputField
                            type="number"
                            value={editingEstate.ceilingHeight}
                            onChange={(value) => handleChange('ceilingHeight', Number(value))}
                            min={1}
                        />
                    </FormField>

                    <FormField label="مفروشة">
                        <SelectField
                            value={editingEstate.furnished}
                            onChange={(value) => handleChange("furnished", Number(value))}
                            options={FURNISHED_OPTIONS}
                            placeholder="اختر حالة الفرش"
                        />
                    </FormField>

                    <FormField label="الإطلالة">
                        <SelectField
                            value={editingEstate.facade}
                            onChange={(value) => handleChange('facade', value)}
                            options={VIEW_OPTIONS}
                            placeholder="اختر الإطلالة"
                        />
                    </FormField>
                </>
            )}

            {shouldShowRentalField && (
                <FormField label="مدة العقد">
                    <SelectField
                        value={editingEstate.rentalDuration}
                        onChange={(value) => handleChange('rentalDuration', value)}
                        options={RENTAL_DURATION_OPTIONS}
                        placeholder="اختر مدة العقد"
                    />
                </FormField>
            )}

            {/* Always show area */}
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

            {/* Features */}
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
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
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
        </form>
    );
};

export default EditEstateForm;