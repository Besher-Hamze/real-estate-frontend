import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
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
import { RealEstateApi } from "@/api/realEstateApi";
import { useQueryClient } from "@tanstack/react-query";
import ViewingTimeSelector from "@/components/forms/ViewingTimeSelector";

interface EstateFormProps {
  buildingId?: string;
  onSuccess?: () => void;
}

// Create an interface for error field references
interface ErrorFieldRefs {
  [key: string]: React.RefObject<HTMLDivElement>;
}

export default function EstateForm({ buildingId, onSuccess }: EstateFormProps) {
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
    isSubmitting,
    submitFormData,
    mainTypes,
    getPropertyType,
  } = useEstateForm(buildingId);

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [additionalFileTypes, setAdditionalFileTypes] = useState<string[]>([]);

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
  }, [formData.mainCategoryId, formData.subCategoryId, formData.finalTypeId, mainTypes, finalTypes]);

  useEffect(() => {
    if (formData.finalCityId) {
      const selectedFinalCity = finalCities.find(c => c.id === formData.finalCityId);

      if (selectedFinalCity && selectedFinalCity.location) {
        const [lat, lng] = selectedFinalCity.location.split(",");

        if (lat && lng) {
          // Important: First clear the current location so the map doesn't try to use both values
          handleChange("location", ""); // Reset location

          // Then in the next render cycle, set the new location
          setTimeout(() => {
            handleFormChange("location", {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng)
            });
          }, 0);

          console.log("Updated location based on selected finalCity:", {
            finalCityId: formData.finalCityId,
            location: selectedFinalCity.location
          });
        }
      }
    }
  }, [formData.finalCityId]);

  const handleFormChange = (field: string, value: any) => {
    if (field === "location") {
      const locationString = `${value.latitude},${value.longitude}`;
      handleChange(field, locationString);
      return;
    }
    if (field === "bedrooms" || field === "bathrooms" || field === "totalFloors") {
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

  // Function to scroll to the first error
  const scrollToFirstError = () => {
    // Get all field names with errors
    const errorFields = Object.keys(errors).filter(key => !!errors[key]);

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

  const queryClient = useQueryClient();
  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitFormData();

    if (!success) {
      // If submission failed, there are errors - scroll to the first one
      setTimeout(() => {
        scrollToFirstError();
      }, 100); // Small delay to ensure DOM updates
      return;
    }

    if (success) {
      setAdditionalFileTypes([]);
      setAdditionalImagePreviews([]);
      setCoverImagePreview(null);
      if (buildingId) {
        queryClient.invalidateQueries({ queryKey: ['realEstate', 'building', buildingId] });
        queryClient.invalidateQueries({ queryKey: ['buildings'] });
      }

      if (onSuccess) {
        onSuccess();
      }
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
          <div ref={errorFieldRefs.title}>
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
          </div>
        )}


        {filterConfig.description && (
          <div ref={errorFieldRefs.description}>
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
          </div>
        )}


        {filterConfig.price && (
          <div ref={errorFieldRefs.price}>
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
          </div>
        )}

        {filterConfig.viewTime && (
          <div ref={errorFieldRefs.viewTime}>
            <FormField label="وقت المشاهدة">
              <ViewingTimeSelector
                value={formData.viewTime}
                onChange={(value) => handleChange('viewTime', value)}
                error={errors.viewTime}
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
          </div>
        )}

        {filterConfig.mainCategoryId && (
          <div ref={errorFieldRefs.mainCategoryId}>
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
          </div>
        )}

        {filterConfig.subCategoryId && formData.mainCategoryId > 0 && (
          <div ref={errorFieldRefs.subCategoryId}>
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
          </div>
        )}

        {/* Continue with other form fields... (adding ref to each one) */}
        {filterConfig.finalTypeId && formData.subCategoryId > 0 && (
          <div ref={errorFieldRefs.finalTypeId}>
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
          </div>
        )}

        {filterConfig.cityId && (
          <div ref={errorFieldRefs.cityId}>
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
          </div>
        )}

        {filterConfig.neighborhoodId && (
          <div ref={errorFieldRefs.neighborhoodId}>
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
          </div>
        )}

        {filterConfig.finalCityId && (
          <div ref={errorFieldRefs.finalCityId}>
            <FormField label="المنطقة" error={errors.finalCityId}>
              <SelectField
                value={formData.finalCityId}
                onChange={(value) => {
                  handleFormChange("finalCityId", Number(value));
                }}
                options={finalCities.map((nb) => ({
                  value: nb.id,
                  label: nb.name,
                }))}
                placeholder="اختر المنطقة"
                error={!!errors.finalCityId}
              />
            </FormField>
          </div>
        )}


        {filterConfig.nearbyLocations && (
          <div ref={errorFieldRefs.nearbyLocations}>
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
          </div>
        )}

        {filterConfig.location && (
          <div ref={errorFieldRefs.location}>
            <FormField label="تحديد الموقع على الخريطة" error={errors.location}>
              <LocationPicker
                key={formData.finalCityId || 'default'} // Add this key to force remount
                initialLatitude={
                  formData.location
                    ? parseFloat(formData.location.split(",")[0])
                    : parseFloat(finalCities.find(c => c.id === formData.finalCityId)?.location?.split(",")[0] ?? "0")
                }
                initialLongitude={
                  formData.location
                    ? parseFloat(formData.location.split(",")[1])
                    : parseFloat(finalCities.find(c => c.id === formData.finalCityId)?.location?.split(",")[1] ?? "0")
                }
                onLocationSelect={(latitude, longitude) => {
                  handleFormChange("location", { latitude, longitude });
                }}
              />
            </FormField>
          </div>
        )}

        {/* Bedrooms and Bathrooms Group */}
        {(
          <>
            {filterConfig.bedrooms && (
              <div className="grid grid-cols-2 gap-4">
                <div ref={errorFieldRefs.bedrooms}>
                  <FormField label="عدد الغرف" error={errors.bedrooms}>
                    <InputField
                      type="number"
                      value={formData.bedrooms}
                      onChange={(value) => handleFormChange("bedrooms", Number(value))}
                      min={1}
                      error={!!errors.bedrooms}
                    />
                  </FormField>
                </div>
                {filterConfig.bathrooms && (
                  <div ref={errorFieldRefs.bathrooms}>
                    <FormField label="عدد الحمامات" error={errors.bathrooms}>
                      <InputField
                        type="number"
                        value={formData.bathrooms}
                        onChange={(value) => handleFormChange("bathrooms", Number(value))}
                        min={1}
                        error={!!errors.bathrooms}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            )}

            {filterConfig.totalFloors && (
              <div ref={errorFieldRefs.totalFloors}>
                <FormField label="عدد الطوابق" error={errors.totalFloors}>
                  <InputField
                    type="number"
                    value={formData.totalFloors}
                    onChange={(value) => handleFormChange("totalFloors", Number(value))}
                    min={1}
                    error={!!errors.totalFloors}
                  />
                </FormField>
              </div>
            )}

            {filterConfig.floorNumber && (
              <div ref={errorFieldRefs.floorNumber}>
                <FormField label="الطابق" error={errors.floorNumber}>
                  <SelectField
                    value={formData.floorNumber}
                    onChange={(value) => handleFormChange("floorNumber", Number(value))}
                    options={FLOOR_OPTIONS.slice(0, Number(formData.totalFloors) + 1)}
                    placeholder="اختر الطابق"
                    error={!!errors.floorNumber}
                  />
                </FormField>
              </div>
            )}

            {filterConfig.buildingAge && (
              <div ref={errorFieldRefs.buildingAge}>
                <FormField label="عمر البناء">
                  <SelectField
                    value={formData.buildingAge}
                    onChange={(value) => handleChange("buildingAge", value)}
                    options={BUILDING_AGE_OPTION}
                    placeholder="اختر عمر المبنى"
                  />
                </FormField>
              </div>
            )}

            {filterConfig.ceilingHeight && (
              <div ref={errorFieldRefs.ceilingHeight}>
                <FormField label="إرتفاع السقف" error={errors.ceilingHeight}>
                  <InputField
                    type="number"
                    value={formData.ceilingHeight}
                    onChange={(value) => handleFormChange("ceilingHeight", Number(value))}
                    min={1}
                    error={!!errors.ceilingHeight}
                  />
                </FormField>
              </div>
            )}

            {filterConfig.furnished && (
              <div ref={errorFieldRefs.furnished}>
                <FormField label="مفروشة" error={errors.furnished}>
                  <SelectField
                    value={formData.furnished}
                    onChange={(value) => handleFormChange("furnished", Number(value))}
                    options={FURNISHED_OPTIONS}
                    placeholder="اختر حالة الفرش"
                    error={!!errors.furnished}
                  />
                </FormField>
              </div>
            )}

            {filterConfig.facade && (

              <div ref={errorFieldRefs.facade}>
                <FormField label="الإطلالة" error={errors.facade}>
                  <FeaturesSelect
                    features={VIEW_OPTIONS.map(value => value.value)}
                    selectedFeatures={formData.facade.split("، ").filter(Boolean)}
                    onChange={(features) => handleFormChange("facade", features.join("، "))}
                    placeholder="اختر الإطلالة"
                    selectionText={{
                      single: "إطلالة",
                      multiple: "إطلالات",
                    }}
                    error={!!errors.facade}
                    errorMessage={errors.facade}
                    minCount={1}
                  />

                </FormField>
              </div>
            )}
          </>
        )}

        {filterConfig.rentalDuration && (
          <div ref={errorFieldRefs.rentalDuration}>
            <FormField label="مدة العقد" error={errors.rentalDuration}>
              <SelectField
                value={formData.rentalDuration}
                onChange={(value) => handleFormChange("rentalDuration", value)}
                options={RENTAL_DURATION_OPTIONS}
                placeholder="اختر مدة العقد"
                error={!!errors.rentalDuration}
              />
            </FormField>
          </div>
        )}

        {filterConfig.buildingArea && (
          <div ref={errorFieldRefs.buildingArea}>
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
          </div>
        )}

        {filterConfig.mainFeatures && (
          <div ref={errorFieldRefs.mainFeatures}>
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
          </div>
        )}

        {filterConfig.additionalFeatures && (
          <div ref={errorFieldRefs.additionalFeatures}>
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
          </div>
        )}

        {filterConfig.coverImage && (
          <div ref={errorFieldRefs.coverImage}>
            <FormField label="صور العقار" error={errors.coverImage || errors.files}>
              <ImageUploadModal
                additionalImagePreviews={additionalImagePreviews}
                additionalFileTypes={additionalFileTypes}
                handleFileUpload={handleFileUpload}
                coverImagePreview={coverImagePreview}
                handleImageUpload={handleImageUpload}
              />
            </FormField>
          </div>
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