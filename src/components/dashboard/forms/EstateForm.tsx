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
  NEARBY_LOCATION,
  PAYMENT_OPTIONS,
  RENTAL_DURATION_OPTIONS,
  VIEW_OPTIONS,
} from "@/components/ui/constants/formOptions";
import { useEstateForm } from "@/lib/hooks/useEstateForm";
import FeaturesSelect from "@/components/ui/FeaturesSelect";
import { BuildingItem } from "@/lib/types";
import LocationPicker from "@/components/map/LocationPicker";

interface EstateFormProps {
  buildingItemId?: string;
}
export default function EstateForm({
  buildingItemId,
}: EstateFormProps) {
  const {
    formData,
    setFormData,
    cities,
    finalTypes,
    neighborhoods,
    isLoading,
    handleSubmit,
    mainTypes,
    isSubmitting,
    getPropertyType
  } = useEstateForm(buildingItemId);

  const handleChange = (field: string, value: any) => {
    console.log(value);
    if (field === 'location') {
      const locationString = `${value.latitude},${value.longitude}`;
      setFormData(prev => ({ ...prev, [field]: locationString }));
      return;
    }

    if (field === "title") {
      const cleanedValue = value.replace(/\d/g, '');
      setFormData(prev => ({ ...prev, [field]: cleanedValue }));
      return;
    }

    if ((field === "bedrooms" || field === "bathrooms")) {
      const numValue = Number(value);
      if (numValue <= 0) {
        return;
      }
    }
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

  const isRentalType = () => {
    const mainType = mainTypes?.find((m: any) => m.id === formData.mainCategoryId);
    return mainType?.name.includes("إيجار");
  }


  const shouldHideResidentialFields = isLandType();
  const shouldShowRentalField = isRentalType();

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


        <FormField label="وصف العقار">
          <InputField
            type="textArea"
            value={formData.description}
            onChange={(value) => handleChange('description', value)}
            placeholder="أدخل وصف العقار"
            required
          />
        </FormField>

        <FormField label="السعر">


          <InputField
            type="text"
            value={formData.price === 0 ? "" : formData.price}
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
                      const newTimeRanges = formData.viewTime.split(',');
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
                    const newTimeRanges = formData.viewTime.split(',').filter((_, i) => i !== index);
                    handleChange("viewTime", newTimeRanges.join(','));
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
                handleChange("viewTime", newValue);
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
        <FormField label="المحافظة">
          <SelectField
            value={formData.cityId}
            onChange={(value) => handleChange('cityId', Number(value))}
            options={cities.map(city => ({
              value: city.id,
              label: city.name
            }))}
            placeholder="اختر المحافظة"
          />
        </FormField>



        <FormField label="المدينة">
          <SelectField
            value={formData.neighborhoodId}
            onChange={(value) => handleChange('neighborhoodId', Number(value))}
            options={neighborhoods.map(nb => ({
              value: nb.id,
              label: nb.name
            }))}
            placeholder="اختر المدينة"
          />
        </FormField>


        <FormField label="الأماكن القريبة">
          <FeaturesSelect
            features={NEARBY_LOCATION}
            selectedFeatures={formData.nearbyLocations.split('، ').filter(Boolean)}
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
            // If you have existing location, pass it
            initialLatitude={formData.location ? parseFloat(formData.location.split(',')[0]) : undefined}
            initialLongitude={formData.location ? parseFloat(formData.location.split(',')[1]) : undefined}
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
                  value={formData.bedrooms}
                  onChange={(value) => handleChange('bedrooms', Number(value))}
                  min={1}
                />
              </FormField>
              <FormField label="عدد الحمامات">
                <InputField
                  type="number"
                  value={formData.bathrooms}
                  onChange={(value) => handleChange('bathrooms', Number(value))}
                  min={1}
                />
              </FormField>
            </div>

            {/* Additional Details - Only show if not land type */}

            <FormField label="عدد الطوابق">
              <InputField
                type="number"
                value={formData.totalFloors}
                onChange={(value) => handleChange('totalFloors', Number(value))}
                min={1}
              />
            </FormField>

            <FormField label="الطابق">
              <SelectField
                value={formData.floorNumber}
                onChange={(value) => handleChange('floorNumber', Number(value))}
                options={FLOOR_OPTIONS}
                placeholder="اختر الطابق"
              />
            </FormField>

            <FormField label="إرتفاع السقف">
              <InputField
                type="number"
                value={formData.ceilingHeight}
                onChange={(value) => handleChange('ceilingHeight', Number(value))}
                min={1}
              />
            </FormField>

            <FormField label="مفروشة">
              <SelectField
                value={formData.furnished}
                onChange={(value) => handleChange('furnished', Number(value))}
                options={FURNISHED_OPTIONS}
                placeholder="اختر حالة الفرش"
              />
            </FormField>


            <FormField label="الإطلالة">
              <SelectField
                value={formData.facade}
                onChange={(value) => handleChange('facade', value)}
                options={VIEW_OPTIONS}
                placeholder="اختر الإطلالة"
              />
            </FormField>

          </>
        )}



        {/* Rental Duration */}
        {shouldShowRentalField && <FormField label="مدة العقد">
          <SelectField
            value={formData.rentalDuration}
            onChange={(value) => handleChange('rentalDuration', Number(value))}
            options={RENTAL_DURATION_OPTIONS}
            placeholder="اختر مدة العقد"
          />
        </FormField>
        }
        {/* Always show area */}
        <FormField label="المساحة">
          <InputField
            type="text"
            value={formData.buildingArea}
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
            accept="image/*, video/*"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
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
