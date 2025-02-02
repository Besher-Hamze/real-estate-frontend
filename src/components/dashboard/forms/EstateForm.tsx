// components/estate/EstateForm.tsx
import React from "react";
import { Plus } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import AdditionalFeaturesSelection from "../estate-components/AdditionalSelectionProps";
import {
  FLOOR_OPTIONS,
  FURNISHED_OPTIONS,
} from "@/components/ui/constants/formOptions";
import { useEstateForm } from "@/lib/hooks/useEstateForm";
import FeaturesSelection from "../estate-components/FeaturesSelectionProps ";

export default function EstateForm() {
  const {
    formData,
    setFormData,
    cities,
    finalTypes,
    neighborhoods,
    isLoading,
    handleSubmit,
    mainTypes,
    getPropertyType
  } = useEstateForm();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : null;
    handleChange('files', files);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleChange('coverImage', file);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
      <h2 className="text-xl font-semibold mb-6">إضافة عقار جديد</h2>
      <div className="space-y-4">
        {/* Basic Info */}
        <FormField label="عنوان العقار">
          <InputField
            type="text"
            value={formData.title}
            onChange={(value) => handleChange('title', value)}
            placeholder="أدخل عنوان العقار"
            required
          />
        </FormField>

        <FormField label="السعر">
          <InputField
            type="number"
            value={formData.price}
            onChange={(value) => handleChange('price', Number(value))}
            placeholder="أدخل السعر"
            required
          />
        </FormField>

        <FormField label="طريقة الدفع">
          <InputField
            type="text"
            value={formData.paymentMethod}
            onChange={(value) => handleChange('paymentMethod', value)}
            placeholder="أدخل طريقة الدفع"
          />
        </FormField>

        {/* Categories */}
        <FormField label="التصنيف الرئيسي">
          <SelectField
            value={formData.mainCategoryId}
            onChange={(value) => {
              handleChange('mainCategoryId', Number(value));
              handleChange('subCategoryId', 0);
              handleChange('mainFeatures', '');
            }}
            options={mainTypes?.map(type => ({
              value: type.id,
              label: type.name
            })) || []}
            placeholder="اختر الصنف الرئيسي"
          />
        </FormField>

        {formData.mainCategoryId > 0 && (
          <FormField label="التصنيف الفرعي">
            <SelectField
              value={formData.subCategoryId}
              onChange={(value) => handleChange('subCategoryId', Number(value))}
              options={mainTypes
                ?.find(m => m.id === formData.mainCategoryId)
                ?.subtypes.map(sub => ({
                  value: sub.id,
                  label: sub.name
                })) || []}
              placeholder="اختر الصنف الفرعي"
              
            />
          </FormField>
        )}

        {formData.subCategoryId > 0 && (
          <FormField label="التصنيف النهائي">
            <SelectField
              value={formData.finalTypeId}
              onChange={(value) => handleChange('finalTypeId', Number(value))}
              options={finalTypes.map(type => ({
                value: type.id,
                label: type.name
              }))}
              placeholder="اختر الصنف النهائي"
            />
          </FormField>
        )}

        {/* Location */}
        <FormField label="المدينة">
          <SelectField
            value={formData.cityId}
            onChange={(value) => handleChange('cityId', Number(value))}
            options={cities.map(city => ({
              value: city.id,
              label: city.name
            }))}
            placeholder="اختر المدينة"
            
          />
        </FormField>

        <FormField label="الحي">
          <SelectField
            value={formData.neighborhoodId}
            onChange={(value) => handleChange('neighborhoodId', Number(value))}
            options={neighborhoods.map(nb => ({
              value: nb.id,
              label: nb.name
            }))}
            placeholder="اختر الحي"
            
          />
        </FormField>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="عدد الغرف">
            <InputField
              type="number"
              value={formData.bedrooms}
              onChange={(value) => handleChange('bedrooms', Number(value))}
              min={0}
            />
          </FormField>
          <FormField label="عدد الحمامات">
            <InputField
              type="number"
              value={formData.bathrooms}
              onChange={(value) => handleChange('bathrooms', Number(value))}
              min={0}
            />
          </FormField>
        </div>

        <FormField label="المساحة">
          <InputField
            type="number"
            value={formData.buildingArea}
            onChange={(value) => handleChange('buildingArea', value)}
            placeholder="المساحة بالمتر المربع"
          />
        </FormField>

        {/* Additional Details */}
        <FormField label="الطابق">
          <SelectField
            value={formData.floorNumber}
            onChange={(value) => handleChange('floorNumber', Number(value))}
            options={FLOOR_OPTIONS}
            placeholder="اختر الطابق"
          />
        </FormField>

        <FormField label="حالة الفرش">
          <SelectField
            value={formData.furnished}
            onChange={(value) => handleChange('furnished', Number(value))}
            options={FURNISHED_OPTIONS}
            placeholder="اختر حالة الفرش"
          />
        </FormField>

        {/* Features */}
        <FormField label="الميزات الاساسية">
          <FeaturesSelection
            propertyType={getPropertyType()}
            selectedFeatures={formData.mainFeatures.split('، ').filter(Boolean)}
            onChange={(features) => handleChange('mainFeatures', features.join('، '))}
          />
        </FormField>

        <FormField label="الميزات الإضافية">
          <AdditionalFeaturesSelection
            selectedFeatures={formData.additionalFeatures.split('، ').filter(Boolean)}
            onChange={(features) => handleChange('additionalFeatures', features.join('، '))}
          />
        </FormField>

        {/* Files */}
        <FormField label="صورة الغلاف">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </FormField>

        <FormField label="ملفات إضافية">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </FormField>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isLoading}
        >
          <Plus className="w-5 h-5" />
          {isLoading ? "جارٍ الإضافة..." : "إضافة عقار"}
        </button>
      </div>
    </form>
  );
}