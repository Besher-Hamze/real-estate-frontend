import React, { useState, useEffect } from "react";
import { Camera, Plus } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import {
  ADDITIONAL_FEATURES,
  BUILDING_AGE_OPTION,
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
import LocationPicker from "@/components/map/LocationPicker";
import ImageUploadModal from "./EnhancedImageUpload";
import apiClient from "@/api";
import { RealEstateApi } from "@/api/realEstateApi";

interface EstateFormProps {
  buildingItemId?: string;
}

export default function EstateForm({ buildingItemId }: EstateFormProps) {
  // State to store the filter configuration from API
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

  const {
    formData,
    errors,
    handleChange,
    cities,
    finalTypes,
    neighborhoods,
    finalCities,
    isLoading,
    isSubmitting,
    submitFormData,
    mainTypes,
    getPropertyType,
    isLandType,
    isRentalType,
  } = useEstateForm(buildingItemId);

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [additionalFileTypes, setAdditionalFileTypes] = useState<string[]>([]);

  // Fetch the filter configuration based on selected categories
  useEffect(() => {
    async function fetchFilterConfig() {
      try {
        const mainCategoryName =
          formData.mainCategoryId && mainTypes
            ? mainTypes.find((m) => m.id === Number(formData.mainCategoryId))?.name || ""
            : "";
        const finalTypeName =
          formData.finalTypeId && finalTypes
            ? finalTypes.find((m) => m.id === Number(formData.finalTypeId))?.name || ""
            : "";
        const subCategoryName =
          formData.subCategoryId && mainTypes
            ? mainTypes.flatMap(m => m.subtypes).find(sub => sub.id === Number(formData.subCategoryId))?.name || ""
            : "";

        const response = await RealEstateApi.fetchFilter(mainCategoryName, subCategoryName, finalTypeName);
        setFilterConfig(response);
        console.log(response);
        
      } catch (error) {
        console.error("Failed to fetch filter config:", error);
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

  }, [formData.mainCategoryId, formData.subCategoryId, formData.finalTypeId, mainTypes]);

  const handleFormChange = (field: string, value: any) => {
    if (field === "location") {
      const locationString = `${value.latitude},${value.longitude}`;
      handleChange(field, locationString);
      return;
    }
    if (field === "bedrooms" || field === "bathrooms") {
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

      handleChange("files", files);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCoverImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      handleChange("coverImage", file);
    }
  };


  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitFormData();
    if (success) {
      setAdditionalFileTypes([]);
      setAdditionalImagePreviews([]);
      setCoverImagePreview(null);
    }
  };

  // Wait until filterConfig is fetched
  if (!filterConfig) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={onSubmitForm}>
      <h2 className="text-xl font-semibold mb-6">إضافة عقار جديد</h2>
      <div className="space-y-4">
        {filterConfig.title && (
          <FormField label="عنوان العقار" error={errors.title}>
            <div className="space-y-1">
              <InputField
                type="text"
                value={formData.title}
                onChange={(value: any) => {
                  // Limit to 100 characters
                  if (value.length <= 100) {
                    handleFormChange("title", value);
                  }
                }}
                placeholder="أدخل عنوان العقار"
                required
                error={!!errors.title}
                maxLength={100}
              />
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">الحد الأقصى 100 حرف</span>
                <span className={`${formData.title.length > 90 ? 'text-amber-600' : ''} ${formData.title.length >= 100 ? 'text-red-500' : ''}`}>
                  {formData.title.length}/100
                </span>
              </div>
            </div>
          </FormField>
        )}


        {filterConfig.description && (
          <FormField label="وصف العقار" error={errors.description}>
            <div className="space-y-1">
              <InputField
                type="textArea"
                value={formData.description}
                onChange={(value: any) => {
                  // Limit to 1000 characters
                  if (value.length <= 1000) {
                    handleFormChange("description", value);
                  }
                }}
                placeholder="أدخل وصف العقار"
                required
                error={!!errors.description}
                maxLength={1000}
              />
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">الحد الأقصى 1000 حرف</span>
                <span className={`${formData.description.length > 900 ? 'text-amber-600' : ''} ${formData.description.length >= 1000 ? 'text-red-500' : ''}`}>
                  {formData.description.length}/1000
                </span>
              </div>
            </div>
          </FormField>
        )}


        {filterConfig.price && (
          <FormField label="السعر" error={errors.price}>
            <InputField
              type="text"
              value={formData.price === 0 ? "" : formData.price}
              onChange={(value) => {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                  handleFormChange("price", "");
                } else {
                  handleFormChange("price", numValue);
                }
              }}
              placeholder="أدخل السعر"
              required
              error={!!errors.price}
            />
          </FormField>
        )}

        {filterConfig.viewTime && (
          <FormField label="وقت المشاهدة">
            <InputField
              type="textArea"
              value={formData.viewTime || ''}
              onChange={(value) => handleChange("viewTime", value)}
              placeholder="أدخل وقت المشاهدة (مثال: من الساعة 9 صباحًا إلى 5 مساءً)"
            />
          </FormField>
        )}

        {filterConfig.paymentMethod && (
          <FormField label="طريقة الدفع">
            <FeaturesSelect
              features={PAYMENT_OPTIONS}
              selectedFeatures={formData.paymentMethod.split("، ").filter(Boolean)}
              onChange={(selected) => handleFormChange("paymentMethod", selected.join("، "))}
              placeholder="اختر طريقة الدفع"
              selectionText={{
                single: "طريقة دفع",
                multiple: "طرق دفع",
              }}
              error={!!errors.paymentMethod}
              errorMessage={errors.paymentMethod}
              minCount={1}
            />
          </FormField>
        )}

        {filterConfig.mainCategoryId && (
          <FormField label="التصنيف الرئيسي" error={errors.mainCategoryId}>
            <SelectField
              value={formData.mainCategoryId}
              onChange={(value) => {
                handleFormChange("mainCategoryId", Number(value));
                handleFormChange("subCategoryId", 0);
                handleFormChange("finalTypeId", 0);
                handleFormChange("mainFeatures", "");
              }}
              options={
                mainTypes?.map((type) => ({
                  value: type.id,
                  label: type.name,
                })) || []
              }
              placeholder="اختر الصنف الرئيسي"
              error={!!errors.mainCategoryId}
            />
          </FormField>
        )}

        {filterConfig.subCategoryId && formData.mainCategoryId > 0 && (
          <FormField label="التصنيف الفرعي" error={errors.subCategoryId}>
            <SelectField
              value={formData.subCategoryId}
              onChange={(value) => handleFormChange("subCategoryId", Number(value))}
              options={
                mainTypes
                  ?.find((m) => m.id === formData.mainCategoryId)
                  ?.subtypes.map((sub) => ({
                    value: sub.id,
                    label: sub.name,
                  })) || []
              }
              placeholder="اختر الصنف الفرعي"
              error={!!errors.subCategoryId}
            />
          </FormField>
        )}

        {filterConfig.finalTypeId && formData.subCategoryId > 0 && (
          <FormField label="التصنيف النهائي" error={errors.finalTypeId}>
            <SelectField
              value={formData.finalTypeId}
              onChange={(value) => handleFormChange("finalTypeId", Number(value))}
              options={finalTypes.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              placeholder="اختر الصنف النهائي"
              error={!!errors.finalTypeId}
            />
          </FormField>
        )}

        {filterConfig.cityId && (
          <FormField label="المحافظة" error={errors.cityId}>
            <SelectField
              value={formData.cityId}
              onChange={(value) => {
                handleFormChange("cityId", Number(value));
                handleFormChange("neighborhoodId", 0);
              }}
              options={cities.map((city) => ({
                value: city.id,
                label: city.name,
              }))}
              placeholder="اختر المحافظة"
              error={!!errors.cityId}
            />
          </FormField>
        )}

        {filterConfig.neighborhoodId && (
          <FormField label="المدينة" error={errors.neighborhoodId}>
            <SelectField
              value={formData.neighborhoodId}
              onChange={(value) => handleFormChange("neighborhoodId", Number(value))}
              options={neighborhoods.map((nb) => ({
                value: nb.id,
                label: nb.name,
              }))}
              placeholder="اختر المدينة"
              error={!!errors.neighborhoodId}
            />
          </FormField>
        )}

        {filterConfig.finalCityId && (
          <FormField label="المنطقة" error={errors.neighborhoodId}>
            <SelectField
              value={formData.finalCityId}
              onChange={(value) => handleFormChange("finalCityId", Number(value))}
              options={finalCities.map((nb) => ({
                value: nb.id,
                label: nb.name,
              }))}
              placeholder="اختر المنطقة"
              error={!!errors.neighborhoodId}
            />
          </FormField>
        )}

        {filterConfig.nearbyLocations && (
          <FormField label="الأماكن القريبة">
            <FeaturesSelect
              features={NEARBY_LOCATION}
              selectedFeatures={formData.nearbyLocations.split("، ").filter(Boolean)}
              onChange={(features) => handleFormChange("nearbyLocations", features.join("، "))}
              placeholder="اختر الأماكن القريبة"
              selectionText={{
                single: "مكان قريبة",
                multiple: "أماكن قريب",
              }}
              error={!!errors.nearbyLocations}
              errorMessage={errors.nearbyLocations}
              minCount={1}
            />
          </FormField>
        )}

        {filterConfig.location && (
          <FormField label="تحديد الموقع على الخريطة" error={errors.location}>
            <LocationPicker
              initialLatitude={
                formData.location
                  ? parseFloat(formData.location.split(",")[0])
                  : undefined
              }
              initialLongitude={
                formData.location
                  ? parseFloat(formData.location.split(",")[1])
                  : undefined
              }
              onLocationSelect={(latitude, longitude) => {
                handleFormChange("location", { latitude, longitude });
              }}
            />
          </FormField>
        )}

        {(
          <>
            {filterConfig.bedrooms && (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="عدد الغرف" error={errors.bedrooms}>
                  <InputField
                    type="number"
                    value={formData.bedrooms}
                    onChange={(value) => handleFormChange("bedrooms", Number(value))}
                    min={1}
                    error={!!errors.bedrooms}
                  />
                </FormField>
                {filterConfig.bathrooms && (
                  <FormField label="عدد الحمامات" error={errors.bathrooms}>
                    <InputField
                      type="number"
                      value={formData.bathrooms}
                      onChange={(value) => handleFormChange("bathrooms", Number(value))}
                      min={1}
                      error={!!errors.bathrooms}
                    />
                  </FormField>
                )}
              </div>
            )}

            {filterConfig.totalFloors && (
              <FormField label="عدد الطوابق" error={errors.totalFloors}>
                <InputField
                  type="number"
                  value={formData.totalFloors}
                  onChange={(value) => handleFormChange("totalFloors", Number(value))}
                  min={1}
                  error={!!errors.totalFloors}
                />
              </FormField>
            )}

            {filterConfig.floorNumber && (
              <FormField label="الطابق" error={errors.floorNumber}>
                <SelectField
                  value={formData.floorNumber}
                  onChange={(value) => handleFormChange("floorNumber", Number(value))}
                  options={FLOOR_OPTIONS}
                  placeholder="اختر الطابق"
                  error={!!errors.floorNumber}
                />
              </FormField>
            )}

            {filterConfig.buildingAge && (
              <FormField label="عمر البناء">
                <SelectField
                  value={formData.buildingAge}
                  onChange={(value) => handleChange("buildingAge", value)}
                  options={BUILDING_AGE_OPTION}
                  placeholder="اختر عمر المبنى"
                />
              </FormField>
            )}

            {filterConfig.ceilingHeight && (
              <FormField label="إرتفاع السقف" error={errors.ceilingHeight}>
                <InputField
                  type="number"
                  value={formData.ceilingHeight}
                  onChange={(value) => handleFormChange("ceilingHeight", Number(value))}
                  min={1}
                  error={!!errors.ceilingHeight}
                />
              </FormField>
            )}

            {filterConfig.furnished && (
              <FormField label="مفروشة" error={errors.furnished}>
                <SelectField
                  value={formData.furnished}
                  onChange={(value) => handleFormChange("furnished", Number(value))}
                  options={FURNISHED_OPTIONS}
                  placeholder="اختر حالة الفرش"
                  error={!!errors.furnished}
                />
              </FormField>
            )}

            {filterConfig.facade && (
              <FormField label="الإطلالة" error={errors.facade}>
                <SelectField
                  value={formData.facade}
                  onChange={(value) => handleFormChange("facade", value)}
                  options={VIEW_OPTIONS}
                  placeholder="اختر الإطلالة"
                  error={!!errors.facade}
                />
              </FormField>
            )}
          </>
        )}

        {filterConfig.rentalDuration && (
          <FormField label="مدة العقد" error={errors.rentalDuration}>
            <SelectField
              value={formData.rentalDuration}
              onChange={(value) => handleFormChange("rentalDuration", value)}
              options={RENTAL_DURATION_OPTIONS}
              placeholder="اختر مدة العقد"
              error={!!errors.rentalDuration}
            />
          </FormField>
        )}

        {filterConfig.buildingArea && (
          <FormField label="المساحة" error={errors.buildingArea}>
            <InputField
              type="text"
              value={formData.buildingArea}
              onChange={(value) => {
                if (Number(value) > 0) {
                  handleFormChange("buildingArea", value);
                } else {
                  handleFormChange("buildingArea", "");
                }
              }}
              placeholder="المساحة بالمتر المربع"
              error={!!errors.buildingArea}
            />
          </FormField>
        )}

        {filterConfig.mainFeatures && (
          <FormField label="الميزات الاساسية">
            <FeaturesSelect
              features={FEATURES_BY_TYPE[getPropertyType()]}
              selectedFeatures={formData.mainFeatures.split("، ").filter(Boolean)}
              onChange={(features) => handleFormChange("mainFeatures", features.join("، "))}
              placeholder="اختر الميزات الأساسية"
              selectionText={{
                single: "ميزة أساسية",
                multiple: "ميزات أساسية",
              }}
              error={!!errors.mainFeatures}
              errorMessage={errors.mainFeatures}
              minCount={1}
            />
          </FormField>
        )}

        {filterConfig.additionalFeatures && (
          <FormField label="الميزات الإضافية">
            <FeaturesSelect
              features={ADDITIONAL_FEATURES}
              selectedFeatures={formData.additionalFeatures.split("، ").filter(Boolean)}
              onChange={(features) => handleFormChange("additionalFeatures", features.join("، "))}
              placeholder="اختر الميزات الإضافية"
              selectionText={{
                single: "ميزة إضافية",
                multiple: "ميزات إضافية",
              }}
              error={!!errors.additionalFeatures}
              errorMessage={errors.additionalFeatures}
              minCount={1}
            />
          </FormField>
        )}

        {filterConfig.coverImage && (
          <FormField label="صور العقار" error={errors.coverImage || errors.files}>
            <ImageUploadModal
              additionalImagePreviews={additionalImagePreviews}
              additionalFileTypes={additionalFileTypes}
              handleFileUpload={handleFileUpload}
              coverImagePreview={coverImagePreview}
              handleImageUpload={handleImageUpload}
            />
          </FormField>
        )}

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
