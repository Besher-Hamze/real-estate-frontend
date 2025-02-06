// components/estate/EstateForm.tsx
import React from "react";
import { Plus } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import {
  ADDITIONAL_FEATURES,
  FEATURES_BY_TYPE,
  FLOOR_OPTIONS,
  FURNISHED_OPTIONS,
  PAYMENT_OPTIONS,
} from "@/components/ui/constants/formOptions";
import { useEstateForm } from "@/lib/hooks/useEstateForm";
import FeaturesSelect from "@/components/ui/FeaturesSelect";
import RangeInput from "@/components/ui/form/RangePriceInput";

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

  const isLandType = () => {
    const selectedSubType = mainTypes
      ?.find(m => m.id === formData.mainCategoryId)
      ?.subtypes.find(sub => sub.id === formData.subCategoryId);

    const selectedFinalType = finalTypes.find(type => type.id === formData.finalTypeId);

    return selectedSubType?.name.includes('أرض') || selectedFinalType?.name.includes('أرض');
  };

  const shouldHideResidentialFields = isLandType();

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
          <RangeInput
            minValue={0}
            maxValue={1000}
            step={10}
            onChange={(value) => {
              handleChange('price', value);
            }}
          />
        </FormField>
        <FormField label="طريقة الدفع">
          <FeaturesSelect
            features={PAYMENT_OPTIONS}
            selectedFeatures={formData.paymentMethod.split("، ").filter(Boolean)}
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


        <FormField label="الأماكن القريبة">
          <FeaturesSelect
            features={ADDITIONAL_FEATURES}
            selectedFeatures={formData.additionalFeatures.split('، ').filter(Boolean)}
            onChange={(features) => handleChange('nearbyLocations', features.join('، '))}
            placeholder="اختر الأماكن القريبة"
            selectionText={{
              single: "مكان قريبة",
              multiple: "أماكن قريب"
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

            {/* Additional Details - Only show if not land type */}
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
          </>
        )}

        {/* Always show area */}
        <FormField label="المساحة">
          <InputField
            type="number"
            value={formData.buildingArea}
            onChange={(value) => handleChange('buildingArea', value)}
            placeholder="المساحة بالمتر المربع"
          />
        </FormField>

        {/* Features */}
        <FormField label="الميزات الاساسية">
          <FeaturesSelect
            features={FEATURES_BY_TYPE[getPropertyType()]}
            selectedFeatures={formData.mainFeatures.split('، ').filter(Boolean)}
            onChange={(features) => handleChange('mainFeatures', features.join('، '))}
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
            selectedFeatures={formData.additionalFeatures.split('، ').filter(Boolean)}
            onChange={(features) => handleChange('additionalFeatures', features.join('، '))}
            placeholder="اختر الميزات الإضافية"
            selectionText={{
              single: "ميزة إضافية",
              multiple: "ميزات إضافية"
            }}
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
