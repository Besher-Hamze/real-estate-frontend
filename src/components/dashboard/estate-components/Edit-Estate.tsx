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
        if (field === "title") {
            const cleanedValue = value.replace(/\d/g, '');
            setEditingEstate((prev: any) => ({ ...prev, [field]: cleanedValue }));
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

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم الملف كبير جدًا. الحد الأقصى هو 5 ميجابايت');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار ملف صورة صالح');
            return;
        }

        // Create preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setCoverImagePreview(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);

        try {
            // Set specific loading state for cover image
            setIsCoverImageUploading(true);
            setCoverImageProgress(0); // Reset progress

            // Upload to API with -1 index to indicate it's the cover image
            const uploadedUrl = await uploadFileToAPI(file, -1);

            // Store the URL
            setCoverImageUrl(uploadedUrl);
            handleChange('coverImage', uploadedUrl);

        } catch (error) {
            console.error("Cover image upload failed:", error);
            // Revert the preview on error
            setCoverImagePreview(null);
        } finally {
            // Wait a moment before hiding loading indicator to make sure user sees 100%
            setTimeout(() => {
                setIsCoverImageUploading(false);
                setCoverImageProgress(0);
            }, 500);
        }
    };

    // Handle additional files upload
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

    // Function to delete a file from the API
    const handleDeleteFile = async (fileUrl: string): Promise<boolean> => {
        try {
            if (!fileUrl) return false;

            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/realestate/deleteFile/${fileUrl}`);

            if (response.status === 200) {
                toast.success('تم حذف الملف بنجاح');
                return true;
            } else {
                throw new Error(`Delete failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error("Failed to delete file:", error);
            toast.error('فشل حذف الملف، يرجى المحاولة مرة أخرى');
            return false;
        }
    };

    // Delete additional image
    const handleDeleteAdditionalImage = async (index: number) => {
        try {
            const fileUrl = additionalImagesUrls[index];

            // If there's a valid URL and it's not just a preview, delete from server
            if (fileUrl && typeof fileUrl === 'string' && !fileUrl.startsWith('data:')) {
                // Add index to loading state
                setUploadingImageIndexes(prev => [...prev, index]);

                // Send delete request to API
                const deleteSuccess = await handleDeleteFile(fileUrl);

                if (!deleteSuccess) {
                    throw new Error("File deletion failed");
                }
            }

            // Create new copies of arrays
            const newPreviews = [...additionalImagePreviews];
            const newUrls = [...additionalImagesUrls];
            const newTypes = [...additionalFileTypes];

            // Remove the item at the specified index
            newPreviews.splice(index, 1);
            newUrls.splice(index, 1);
            newTypes.splice(index, 1);

            // Update state
            setAdditionalImagePreviews(newPreviews);
            setAdditionalImagesUrls(newUrls);
            setAdditionalFileTypes(newTypes);

            // Update main form state
            const updatedFiles = Array.isArray(editingEstate.files) ? [...editingEstate.files] : [];
            updatedFiles.splice(index, 1);
            handleChange('files', updatedFiles);

        } catch (error) {
            console.error("Failed to delete file:", error);
            toast.error('فشل حذف الملف، يرجى المحاولة مرة أخرى');
        } finally {
            // Remove this index from loading indexes
            setUploadingImageIndexes(prev => prev.filter(i => i !== index));
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coverImageUrl && !coverImagePreview) {
            toast.error('يرجى إضافة صورة الغلاف');
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
            await onSubmit(estateToSubmit);
        } catch (error) {
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
                <InputField
                    type="text"
                    value={editingEstate.title}
                    onChange={(value) => handleChange("title", value)}
                    placeholder="أدخل عنوان العقار"
                    required
                />
            </FormField>

            <FormField label="وصف العقار">
                <InputField
                    type="textArea"
                    value={editingEstate.description}
                    onChange={(value) => handleChange("description", value)}
                    placeholder="أدخل وصف العقار"
                    required
                />
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
                <div className="space-y-3">
                    {editingEstate.viewTime && editingEstate.viewTime.split(',').map((timeRange: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2">
                                <InputField
                                    type="time"
                                    value={timeRange.split(' to ')[0] || ''}
                                    onChange={(value) => {
                                        const newTimeRanges = editingEstate.viewTime.split(',');
                                        const currentRange = newTimeRanges[index].split(' to ');
                                        newTimeRanges[index] = `${value} to ${currentRange[1] || ''}`;
                                        handleChange("viewTime", newTimeRanges.join(','));
                                    }}
                                    placeholder="من"
                                    className="flex-1"
                                />
                                <span className="text-gray-500">إلى</span>
                                <InputField
                                    type="time"
                                    value={timeRange.split(' to ')[1] || ''}
                                    onChange={(value) => {
                                        const newTimeRanges = editingEstate.viewTime.split(',');
                                        const currentRange = newTimeRanges[index].split(' to ');
                                        newTimeRanges[index] = `${currentRange[0] || ''} to ${value}`;
                                        handleChange("viewTime", newTimeRanges.join(','));
                                    }}
                                    placeholder="إلى"
                                    className="flex-1"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const newTimeRanges = editingEstate.viewTime.split(',').filter((_: any, i: number) => i !== index);
                                    handleChange("viewTime", newTimeRanges.join(','));
                                }}
                                className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => {
                            const currentValue = editingEstate.viewTime || '';
                            const newValue = currentValue ? `${currentValue},00:00 to 00:00` : '00:00 to 00:00';
                            handleChange("viewTime", newValue);
                        }}
                        className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        إضافة وقت آخر
                    </button>
                </div>
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


            <FormField label="الحي">
                <SelectField
                    value={editingEstate.finalCityId}
                    onChange={(value) => handleChange("finalCityId", Number(value))}
                    options={finalCities.map((nb: any) => ({
                        value: nb.id,
                        label: nb.name,
                    }))}
                    placeholder="اختر الحي"
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
                        onChange={(value) => handleChange('rentalDuration', Number(value))}
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