import React from "react";
import { Plus, X } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import AdditionalFeaturesSelection from "../estate-components/AdditionalSelectionProps";
import { FLOOR_OPTIONS, FURNISHED_OPTIONS } from "@/components/ui/constants/formOptions";
import FeaturesSelection from "./FeaturesSelectionProps ";

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
    const getPropertyType = (): "residential" | "commercial" | "industrial" | "others" => {
        const mainType = mainTypes?.find((m: any) => m.id === editingEstate.mainCategoryId);
        const subType = mainType?.subtypes.find((st: any) => st.id === editingEstate.subCategoryId);
        const finalType = finalTypes?.find((f: any) => f.id === editingEstate.finalTypeId);
        if (subType?.name.includes("سكني") || finalType?.name.includes("سكني")) {
            return "residential";
        } else if (subType?.name.includes("تجاري") || finalType?.name.includes("تجاري")) {
            return "commercial";
        } else if (subType?.name.includes("صناعي") || finalType?.name.includes("صناعي")) {
            return "industrial";
        }
        return "others";
    };

    // Helper to update estate data
    const handleChange = (field: string, value: any) => {
        setEditingEstate((prev: any) => ({ ...prev, [field]: value }));
    };

    // File upload handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleChange("coverImage", file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : null;
        handleChange("files", files);
    };

    // Delete current cover image
    const handleDeleteCoverImage = () => {
        handleChange("coverImage", null);
    };

    // Delete an additional image by index
    const handleDeleteAdditionalImage = (index: number) => {
        const currentFiles = editingEstate.files || [];
        const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index);
        handleChange("files", updatedFiles);
    };

    return (
        <form
            onSubmit={onSubmit}
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

            <FormField label="السعر">
                <InputField
                    type="number"
                    value={editingEstate.price}
                    onChange={(value) => handleChange("price", Number(value))}
                    placeholder="أدخل السعر"
                    required
                />
            </FormField>

            <FormField label="طريقة الدفع">
                <InputField
                    type="text"
                    value={editingEstate.paymentMethod}
                    onChange={(value) => handleChange("paymentMethod", value)}
                    placeholder="أدخل طريقة الدفع"
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
                    options={
                        mainTypes?.map((type: any) => ({
                            value: type.id,
                            label: type.name,
                        })) || []
                    }
                    placeholder="اختر التصنيف الرئيسي"
                />
            </FormField>

            {editingEstate.mainCategoryId > 0 && (
                <FormField label="التصنيف الفرعي">
                    <SelectField
                        value={editingEstate.subCategoryId}
                        onChange={(value) => handleChange("subCategoryId", Number(value))}
                        options={
                            mainTypes
                                ?.find((m: any) => m.id === editingEstate.mainCategoryId)
                                ?.subtypes.map((sub: any) => ({
                                    value: sub.id,
                                    label: sub.name,
                                })) || []
                        }
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
            <FormField label="المدينة">
                <SelectField
                    value={editingEstate.cityId}
                    onChange={(value) => handleChange("cityId", Number(value))}
                    options={cities.map((city: any) => ({
                        value: city.id,
                        label: city.name,
                    }))}
                    placeholder="اختر المدينة"
                />
            </FormField>

            <FormField label="الحي">
                <SelectField
                    value={editingEstate.neighborhoodId}
                    onChange={(value) => handleChange("neighborhoodId", Number(value))}
                    options={neighborhoods.map((nb: any) => ({
                        value: nb.id,
                        label: nb.name,
                    }))}
                    placeholder="اختر الحي"
                />
            </FormField>

            {/* Property Details */}
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

            <FormField label="المساحة">
                <InputField
                    type="number"
                    value={editingEstate.buildingArea}
                    onChange={(value) => handleChange("buildingArea", value)}
                    placeholder="المساحة بالمتر المربع"
                />
            </FormField>

            {/* Additional Details */}
            <FormField label="الطابق">
                <SelectField
                    value={editingEstate.floorNumber}
                    onChange={(value) => handleChange("floorNumber", Number(value))}
                    options={FLOOR_OPTIONS}
                    placeholder="اختر الطابق"
                />
            </FormField>

            <FormField label="حالة الفرش">
                <SelectField
                    value={editingEstate.furnished}
                    onChange={(value) => handleChange("furnished", Number(value))}
                    options={FURNISHED_OPTIONS}
                    placeholder="اختر حالة الفرش"
                />
            </FormField>

            {/* Features */}
            <FormField label="الميزات الاساسية">
                <FeaturesSelection
                    propertyType={getPropertyType()}
                    selectedFeatures={editingEstate.mainFeatures.split("، ").filter(Boolean)}
                    onChange={(features) => handleChange("mainFeatures", features.join("، "))}
                />
            </FormField>

            <FormField label="الميزات الإضافية">
                <AdditionalFeaturesSelection
                    selectedFeatures={editingEstate.additionalFeatures.split("، ").filter(Boolean)}
                    onChange={(features) => handleChange("additionalFeatures", features.join("، "))}
                />
            </FormField>

            {/* Preview Current Images */}
            <FormField label="صورة الغلاف الحالية">
                {editingEstate.coverImage ? (
                    <div className="relative inline-block">
                        <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/${editingEstate.coverImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${editingEstate.coverImage}`}
                                alt="Cover Image"
                                className="w-32 h-32 object-cover rounded-md"
                            />
                        </a>
                        {/* <button
                            type="button"
                            onClick={handleDeleteCoverImage}
                            className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button> */}
                    </div>
                ) : (
                    <p>لا توجد صورة غلاف</p>
                )}
            </FormField>

            <FormField label="الصور الإضافية الحالية">
                {editingEstate.files && editingEstate.files.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {editingEstate.files.map((file: string, index: number) => (
                            <div key={index} className="relative inline-block">
                                <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
                                        alt={`Additional Image ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                </a>
                                {/* <button
                                    type="button"
                                    onClick={() => handleDeleteAdditionalImage(index)}
                                    className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                                >
                                    <X className="w-3 h-3" />
                                </button> */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>لا توجد صور إضافية</p>
                )}
            </FormField>

            {/* Files Upload */}
            {/* <FormField label="تحديث صورة الغلاف">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </FormField>

            <FormField label="تحديث ملفات إضافية">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </FormField> */}

            <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                حفظ التعديلات
            </button>
        </form>
    );
};

export default EditEstateForm;
