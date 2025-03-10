import React, { useState } from "react";
import { Camera, Plus } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import {
  ADDITIONAL_FEATURES,
  FEATURES_BY_TYPE,
  FLOOR_OPTIONS,
  FURNISHED_OPTIONS,
  NEARBY_LOCATION,
  PAYMENT_OPTIONS,
  RENTAL_DURATION_OPTIONS,
  VIEW_OPTIONS,
} from "@/components/ui/constants/formOptions";
import { useEstateForm } from "@/lib/hooks/useEstateForm";
import FeaturesSelect from "@/components/ui/FeaturesSelect";
import { BuildingItem } from "@/lib/types";
import LocationPicker from "@/components/map/LocationPicker";
import EnhancedImageUpload from "./EnhancedImageUpload";
import ImageUploadModal from "./EnhancedImageUpload";

interface EstateFormProps {
  buildingItemId?: string;
}

export default function EstateForm({
  buildingItemId,
}: EstateFormProps) {
  const {
    formData,
    errors,
    handleChange,
    cities,
    finalTypes,
    neighborhoods,
    isLoading,
    isSubmitting,
    submitFormData,
    mainTypes,
    getPropertyType,
    isLandType,
    isRentalType
  } = useEstateForm(buildingItemId);

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [additionalFileTypes, setAdditionalFileTypes] = useState<string[]>([]);

  const handleFormChange = (field: string, value: any) => {
    console.log(value);
    if (field === 'location') {
      const locationString = `${value.latitude},${value.longitude}`;
      handleChange(field, locationString);
      return;
    }

    if (field === "title") {
      const cleanedValue = value.replace(/\d/g, '');
      handleChange(field, cleanedValue);
      return;
    }

    if ((field === "bedrooms" || field === "bathrooms")) {
      const numValue = Number(value);
      if (numValue <= 0) {
        return;
      }
    }
    
    handleChange(field, value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use FileReader to read the file
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newPreviews = [...additionalImagePreviews];
          newPreviews[index] = e.target.result as string;
          setAdditionalImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);

      const files = Array.isArray(formData.files) ? [...formData.files] : [];
      files[index] = file;
      const newFileTypes = [...additionalFileTypes];
      newFileTypes[index] = file.type;
      setAdditionalFileTypes(newFileTypes);

      handleChange('files', files);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use FileReader to read the file
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCoverImagePreview(e.target.result as string);
        }
      };

      reader.readAsDataURL(file);

      // Update form data
      handleChange('coverImage', file);
    }
  };

  const shouldHideResidentialFields = isLandType();
  const shouldShowRentalField = isRentalType();

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitFormData();
    if (success) {
      setAdditionalFileTypes([]);
      setAdditionalImagePreviews([]);
      setCoverImagePreview(null);
    }
  };

  return (
    <form onSubmit={onSubmitForm}>
      <h2 className="text-xl font-semibold mb-6">إضافة عقار جديد</h2>
      <div className="space-y-4">
        {/* Basic Info */}
        <FormField 
          label="عنوان العقار" 
          error={errors.title}
        >
          <InputField
            type="text"
            value={formData.title}
            onChange={(value) => handleFormChange('title', value)}
            placeholder="أدخل عنوان العقار"
            required
            error={!!errors.title}
          />
        </FormField>

        <FormField 
          label="وصف العقار"
          error={errors.description}
        >
          <InputField
            type="textArea"
            value={formData.description}
            onChange={(value) => handleFormChange('description', value)}
            placeholder="أدخل وصف العقار"
            required
            error={!!errors.description}
          />
        </FormField>

        <FormField 
          label="السعر"
          error={errors.price}
        >
          <InputField
            type="text"
            value={formData.price === 0 ? "" : formData.price}
            onChange={(value) => {
              const numValue = Number(value);
              if (isNaN(numValue)) {
                handleFormChange("price", ""); // or handle it appropriately
              } else {
                handleFormChange("price", numValue);
              }
            }}
            placeholder="أدخل السعر"
            required
            error={!!errors.price}
          />
        </FormField>

        <FormField label="وقت المشاهدة">
          <div className="space-y-3">
            {formData.viewTime && formData.viewTime.split(',').map((timeRange, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <InputField
                    type="time"
                    value={timeRange.split(' to ')[0] || ''}
                    onChange={(value) => {
                      const newTimeRanges = formData.viewTime.split(',');
                      const currentRange = newTimeRanges[index].split(' to ');
                      newTimeRanges[index] = `${value} to ${currentRange[1] || ''}`;
                      handleFormChange("viewTime", newTimeRanges.join(','));
                    }}
                    placeholder="من"
                    className="flex-1"
                  />
                  <span className="text-gray-500">إلى</span>
                  <InputField
                    type="time"
                    value={timeRange.split(' to ')[1] || ''}
                    onChange={(value) => {
                      const newTimeRanges = formData.viewTime.split(',');
                      const currentRange = newTimeRanges[index].split(' to ');
                      newTimeRanges[index] = `${currentRange[0] || ''} to ${value}`;
                      handleFormChange("viewTime", newTimeRanges.join(','));
                    }}
                    placeholder="إلى"
                    className="flex-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newTimeRanges = formData.viewTime.split(',').filter((_, i) => i !== index);
                    handleFormChange("viewTime", newTimeRanges.join(','));
                  }}
                  className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const currentValue = formData.viewTime || '';
                const newValue = currentValue ? `${currentValue},00:00 to 00:00` : '00:00 to 00:00';
                handleFormChange("viewTime", newValue);
              }}
              className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              إضافة وقت آخر
            </button>
          </div>
        </FormField>

        <FormField label="طريقة الدفع">
          <FeaturesSelect
            features={PAYMENT_OPTIONS}
            selectedFeatures={formData.paymentMethod.split("، ").filter(Boolean)}
            onChange={(selected) => handleFormChange('paymentMethod', selected.join("، "))}
            placeholder="اختر طريقة الدفع"
            selectionText={{
              single: "طريقة دفع",
              multiple: "طرق دفع"
            }}
          />
        </FormField>

        {/* Categories */}
        <FormField 
          label="التصنيف الرئيسي"
          error={errors.mainCategoryId}
        >
          <SelectField
            value={formData.mainCategoryId}
            onChange={(value) => {
              handleFormChange('mainCategoryId', Number(value));
              handleFormChange('subCategoryId', 0);
              handleFormChange('finalTypeId', 0);
              handleFormChange('mainFeatures', '');
            }}
            options={mainTypes?.map(type => ({
              value: type.id,
              label: type.name
            })) || []}
            placeholder="اختر الصنف الرئيسي"
            error={!!errors.mainCategoryId}
          />
        </FormField>

        {formData.mainCategoryId > 0 && (
          <FormField 
            label="التصنيف الفرعي"
            error={errors.subCategoryId}
          >
            <SelectField
              value={formData.subCategoryId}
              onChange={(value) => handleFormChange('subCategoryId', Number(value))}
              options={mainTypes
                ?.find(m => m.id === formData.mainCategoryId)
                ?.subtypes.map(sub => ({
                  value: sub.id,
                  label: sub.name
                })) || []}
              placeholder="اختر الصنف الفرعي"
              error={!!errors.subCategoryId}
            />
          </FormField>
        )}

        {formData.subCategoryId > 0 && (
          <FormField 
            label="التصنيف النهائي"
            error={errors.finalTypeId}
          >
            <SelectField
              value={formData.finalTypeId}
              onChange={(value) => handleFormChange('finalTypeId', Number(value))}
              options={finalTypes.map(type => ({
                value: type.id,
                label: type.name
              }))}
              placeholder="اختر الصنف النهائي"
              error={!!errors.finalTypeId}
            />
          </FormField>
        )}

        {/* Location */}
        <FormField 
          label="المحافظة"
          error={errors.cityId}
        >
          <SelectField
            value={formData.cityId}
            onChange={(value) => {
              handleFormChange('cityId', Number(value));
              handleFormChange('neighborhoodId', 0); // Reset neighborhood when city changes
            }}
            options={cities.map(city => ({
              value: city.id,
              label: city.name
            }))}
            placeholder="اختر المحافظة"
            error={!!errors.cityId}
          />
        </FormField>

        <FormField 
          label="المدينة"
          error={errors.neighborhoodId}
        >
          <SelectField
            value={formData.neighborhoodId}
            onChange={(value) => handleFormChange('neighborhoodId', Number(value))}
            options={neighborhoods.map(nb => ({
              value: nb.id,
              label: nb.name
            }))}
            placeholder="اختر المدينة"
            error={!!errors.neighborhoodId}
          />
        </FormField>

        <FormField label="الأماكن القريبة">
          <FeaturesSelect
            features={NEARBY_LOCATION}
            selectedFeatures={formData.nearbyLocations.split('، ').filter(Boolean)}
            onChange={(features) => handleFormChange('nearbyLocations', features.join('، '))}
            placeholder="اختر الأماكن القريبة"
            selectionText={{
              single: "مكان قريبة",
              multiple: "أماكن قريب"
            }}
          />
        </FormField>

        <FormField 
          label="تحديد الموقع على الخريطة"
          error={errors.location}
        >
          <LocationPicker
            initialLatitude={formData.location ? parseFloat(formData.location.split(',')[0]) : undefined}
            initialLongitude={formData.location ? parseFloat(formData.location.split(',')[1]) : undefined}
            onLocationSelect={(latitude, longitude) => {
              handleFormChange('location', { latitude, longitude });
            }}
          />
        </FormField>

        {/* Property Details - Only show if not land type */}
        {!shouldHideResidentialFields && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField 
                label="عدد الغرف"
                error={errors.bedrooms}
              >
                <InputField
                  type="number"
                  value={formData.bedrooms}
                  onChange={(value) => handleFormChange('bedrooms', Number(value))}
                  min={1}
                  error={!!errors.bedrooms}
                />
              </FormField>
              <FormField 
                label="عدد الحمامات"
                error={errors.bathrooms}
              >
                <InputField
                  type="number"
                  value={formData.bathrooms}
                  onChange={(value) => handleFormChange('bathrooms', Number(value))}
                  min={1}
                  error={!!errors.bathrooms}
                />
              </FormField>
            </div>

            {/* Additional Details - Only show if not land type */}
            <FormField 
              label="عدد الطوابق"
              error={errors.totalFloors}
            >
              <InputField
                type="number"
                value={formData.totalFloors}
                onChange={(value) => handleFormChange('totalFloors', Number(value))}
                min={1}
                error={!!errors.totalFloors}
              />
            </FormField>

            <FormField 
              label="الطابق"
              error={errors.floorNumber}
            >
              <SelectField
                value={formData.floorNumber}
                onChange={(value) => handleFormChange('floorNumber', Number(value))}
                options={FLOOR_OPTIONS}
                placeholder="اختر الطابق"
                error={!!errors.floorNumber}
              />
            </FormField>

            <FormField 
              label="إرتفاع السقف"
              error={errors.ceilingHeight}
            >
              <InputField
                type="number"
                value={formData.ceilingHeight}
                onChange={(value) => handleFormChange('ceilingHeight', Number(value))}
                min={1}
                error={!!errors.ceilingHeight}
              />
            </FormField>

            <FormField 
              label="مفروشة"
              error={errors.furnished}
            >
              <SelectField
                value={formData.furnished}
                onChange={(value) => handleFormChange('furnished', Number(value))}
                options={FURNISHED_OPTIONS}
                placeholder="اختر حالة الفرش"
                error={!!errors.furnished}
              />
            </FormField>

            <FormField 
              label="الإطلالة"
              error={errors.facade}
            >
              <SelectField
                value={formData.facade}
                onChange={(value) => handleFormChange('facade', value)}
                options={VIEW_OPTIONS}
                placeholder="اختر الإطلالة"
                error={!!errors.facade}
              />
            </FormField>
          </>
        )}

        {/* Rental Duration */}
        {shouldShowRentalField && (
          <FormField 
            label="مدة العقد"
            error={errors.rentalDuration}
          >
            <SelectField
              value={formData.rentalDuration}
              onChange={(value) => handleFormChange('rentalDuration', Number(value))}
              options={RENTAL_DURATION_OPTIONS}
              placeholder="اختر مدة العقد"
              error={!!errors.rentalDuration}
            />
          </FormField>
        )}

        {/* Always show area */}
        <FormField 
          label="المساحة"
          error={errors.buildingArea}
        >
          <InputField
            type="text"
            value={formData.buildingArea}
            onChange={(value) => {
              if (Number(value) > 0) {
                handleFormChange('buildingArea', value);
              } else {
                handleFormChange('buildingArea', "");
              }
            }}
            placeholder="المساحة بالمتر المربع"
            error={!!errors.buildingArea}
          />
        </FormField>

        {/* Features */}
        <FormField label="الميزات الاساسية">
          <FeaturesSelect
            features={FEATURES_BY_TYPE[getPropertyType()]}
            selectedFeatures={formData.mainFeatures.split('، ').filter(Boolean)}
            onChange={(features) => handleFormChange('mainFeatures', features.join('، '))}
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
            onChange={(features) => handleFormChange('additionalFeatures', features.join('، '))}
            placeholder="اختر الميزات الإضافية"
            selectionText={{
              single: "ميزة إضافية",
              multiple: "ميزات إضافية"
            }}
          />
        </FormField>

        <FormField 
          label="صور العقار"
          error={errors.coverImage || errors.files}
        >
          <ImageUploadModal
            additionalImagePreviews={additionalImagePreviews}
            additionalFileTypes={additionalFileTypes}
            handleFileUpload={handleFileUpload}
            coverImagePreview={coverImagePreview}
            handleImageUpload={handleImageUpload}
          />
          {(errors.coverImage || errors.files) && (
            <p className="text-sm text-red-500 mt-1">
              {errors.coverImage || errors.files}
            </p>
          )}
        </FormField>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 
            ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isSubmitting}
        >
          <Plus className="w-5 h-5" />
          {isSubmitting ? "جارٍ الإضافة..." : "إضافة عقار"}
        </button>
      </div>
    </form>
  );
}