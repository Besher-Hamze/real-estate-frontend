import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { ADDITIONAL_FEATURES, FEATURES_BY_TYPE, FLOOR_OPTIONS, FURNISHED_OPTIONS, NEARBY_LOCATION, PAYMENT_OPTIONS, RENTAL_DURATION_OPTIONS, VIEW_OPTIONS } from "@/components/ui/constants/formOptions";
import FeaturesSelect from "@/components/ui/FeaturesSelect";
import LocationPicker from "@/components/map/LocationPicker";

interface EditEstateFormProps {
    editingEstate: any;
    setEditingEstate: (estate: any) => void;
    onSubmit: (estate: any) => Promise<void>;
    cities: any[];
    neighborhoods: any[];
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
}) => {
    const [newCoverImage, setNewCoverImage] = useState<File | null>(null);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewCoverImage(file);
            handleChange("coverImage", file);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) as File[] : [];
        setNewFiles(files);
        handleChange("files", files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const estateToSubmit = { ...editingEstate };

            if (newCoverImage) {
                estateToSubmit.coverImage = newCoverImage;
            }
            if (newFiles.length > 0) {
                estateToSubmit.files = newFiles;
            }

            await onSubmit(estateToSubmit);
        } catch (error) {
            console.error("Error submitting form:", error);
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

            {/* Image Preview Section */}
            <FormField label="صورة الغلاف الحالية">
                <div className="flex flex-col gap-2">
                    {editingEstate.coverImage ? (
                        <div className="relative inline-block">
                            {typeof editingEstate.coverImage === 'string' ? (
                                // If coverImage is a string (existing image URL)
                                <a href={`${process.env.NEXT_PUBLIC_API_URL}/${editingEstate.coverImage}`}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${editingEstate.coverImage}`}
                                        alt="Cover Image"
                                        className="w-32 h-32 object-cover rounded-md"
                                    />
                                </a>
                            ) : (
                                // If coverImage is a File object (new upload)
                                <img
                                    src={URL.createObjectURL(editingEstate.coverImage)}
                                    alt="New Cover Image"
                                    className="w-32 h-32 object-cover rounded-md"
                                />
                            )}
                        </div>
                    ) : (
                        <p>لا توجد صورة غلاف</p>
                    )}

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            تغيير صورة الغلاف
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                        />
                    </div>
                </div>
            </FormField>
            <FormField label="الصور الإضافية الحالية">
                <div className="flex flex-col gap-3">
                    {editingEstate.files && editingEstate.files.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {typeof editingEstate.files[0] === 'string' ? (
                                editingEstate.files.map((file: string, index: number) => (
                                    <div key={index} className="relative inline-block">
                                        <a href={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
                                                alt={`Additional Image ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded-md"
                                            />
                                        </a>
                                    </div>
                                ))
                            ) : (
                                // New file uploads
                                Array.from(editingEstate.files).map((file, index: number) => {
                                    // Check if file is a File object before using URL.createObjectURL
                                    if (file instanceof File) {
                                        return (
                                            <div key={index} className="relative inline-block">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`New Image ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-md"
                                                />
                                            </div>
                                        );
                                    }
                                    // If it's not a File object, return null or a placeholder
                                    return null;
                                })
                            )}
                        </div>
                    ) : (
                        <p>لا توجد صور إضافية</p>
                    )}

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            إضافة صور جديدة
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                    </div>
                </div>
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