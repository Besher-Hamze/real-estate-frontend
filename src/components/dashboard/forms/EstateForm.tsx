import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { RealEstateApi } from "@/api/realEstateApi";
import apiClient from "@/api";
import { CityType, FinalType, NeighborhoodType } from "@/lib/types";
import { useMainType } from "@/lib/hooks/useMainType";
import { useRealEstate } from "@/lib/hooks/useRealEstate";
import { CreateEstateForm } from "@/lib/types/create";
import { finalTypeTypeApi } from "@/api/finalTypeApi";
import { toast } from "react-toastify";
import FeaturesSelection from "../estate-components/FeaturesSelectionProps ";

export default function EstateForm() {
  const { mainTypes, refetch: refetchMainTypes } = useMainType();
  const { refetch: refetchEstates } = useRealEstate();

  const [cities, setCities] = useState<CityType[]>([]);
  const [finalTypes, setfinalTypes] = useState<FinalType[]>([]);
  const [neighborhood, setNeighborhood] = useState<NeighborhoodType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [estateForm, setEstateForm] = useState<CreateEstateForm>({
    title: "",
    price: 0,
    cityId: 1,
    neighborhoodId: 1,
    bedrooms: 1,
    bathrooms: 1,
    furnished: false,
    buildingArea: "",
    floorNumber: 0,
    facade: "",
    paymentMethod: "",
    mainCategoryId: 0,
    subCategoryId: 0,
    finalTypeId: 0,
    mainFeatures: "",
    additionalFeatures: "",
    nearbyLocations: "",
    coverImage: null,
    files: null,
    ceilingHeight: 0,
    rentalDuration: 0,
    totalFloors: null
  });

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/api/cities");
        setCities(response.data);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchFinalType = async () => {
      try {
        const response = await finalTypeTypeApi.fetchFinalTypeBySubId(estateForm.subCategoryId);
        setfinalTypes(response);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    if (estateForm.subCategoryId && estateForm.subCategoryId != 0) {
      fetchFinalType();
    }
  }, [estateForm.subCategoryId]);

  // Fetch neighborhoods whenever city changes
  useEffect(() => {
    if (!estateForm.cityId) return;
    const fetchNeighborhood = async () => {
      try {
        const response = await apiClient.get(
          `/api/neighborhoods/${estateForm.cityId}`
        );
        setNeighborhood(response.data);
      } catch (error) {
        console.error("Failed to fetch neighborhoods:", error);
      }
    };
    fetchNeighborhood();
  }, [estateForm.cityId]);


  const validateForm = () => {
    if (!estateForm.title.trim()) {
      alert("يرجى إدخال عنوان العقار");
      return false;
    }
    if (estateForm.price <= 0) {
      alert("يرجى إدخال سعر صحيح");
      return false;
    }
    if (!estateForm.mainCategoryId || !estateForm.subCategoryId) {
      alert("يرجى اختيار التصنيف الرئيسي والفرعي");
      return false;
    }
    if (!estateForm.cityId || !estateForm.neighborhoodId) {
      alert("يرجى اختيار المدينة والحي");
      return false;
    }
    if (!estateForm.coverImage) {
      alert("يرجى اختيار صورة الغلاف");
      return false;
    }
    return true;
  };

  const handleCreateEstate = async () => {

    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(estateForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === "files" && Array.isArray(value)) {
            value.forEach((file) => formData.append("files", file));
          } else if (key === "coverImage") {
            formData.append("coverImage", value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      await RealEstateApi.addRealEstate(formData);
      toast.success("تمت إضافة العقار بنجاح!");
      // Reset form
      setEstateForm({
        title: "",
        price: 0,
        cityId: 1,
        neighborhoodId: 1,
        bedrooms: 1,
        bathrooms: 1,
        furnished: false,
        buildingArea: "",
        floorNumber: 0,
        facade: "",
        paymentMethod: "",
        mainCategoryId: 0,
        subCategoryId: 0,
        finalTypeId: 0,
        mainFeatures: "",
        additionalFeatures: "",
        nearbyLocations: "",
        coverImage: null,
        files: null,
        ceilingHeight: 0,
        rentalDuration: 0,
        totalFloors: null
      });
      refetchEstates();
    } catch (error) {
      console.error("Failed to create estate:", error);
      toast.error("حدث خطأ أثناء إضافة العقار");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateEstate();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : null;
    setEstateForm({ ...estateForm, files });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEstateForm((prev) => ({ ...prev, coverImage: file }));
    }
  };
  const getPropertyType = (): 'residential' | 'commercial' | 'industrial' | "others" => {
    const subType = mainTypes
      ?.find((m) => m.id === estateForm.mainCategoryId)
      ?.subtypes.find(m => m.id === estateForm.subCategoryId);
    const finalType = finalTypes?.find(f => f.id === estateForm.finalTypeId);

    if (subType?.name.includes('سكني') || finalType?.name.includes('سكني')) {
      return 'residential';
    } else if (subType?.name.includes('تجاري') || finalType?.name.includes('تجاري')) {
      return 'commercial';
    } else if (subType?.name.includes('صناعي') || finalType?.name.includes('صناعي')) {
      return 'industrial';
    }
    return 'others';
  };

  const handleFeaturesChange = (features: string[]) => {
    setEstateForm(prev => ({
      ...prev,
      mainFeatures: features.join('، ')
    }));
  };


  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">إضافة عقار جديد</h2>
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عنوان العقار
          </label>
          <input
            type="text"
            value={estateForm.title}
            onChange={(e) =>
              setEstateForm({ ...estateForm, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل عنوان العقار"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            السعر
          </label>
          <input
            type="text"
            value={estateForm.price || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) { // Accepts only numeric values
                setEstateForm({ ...estateForm, price: Number(value) });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل السعر"
          />

        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            طريقة الدفع
          </label>
          <input
            type="text"
            value={estateForm.paymentMethod}
            onChange={(e) =>
              setEstateForm({ ...estateForm, paymentMethod: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل طريقة الدفع"
          />
        </div>
        {/* Main Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التصنيف الرئيسي
          </label>
          <select
            value={estateForm.mainCategoryId}
            onChange={(e) => {
              setEstateForm({
                ...estateForm,
                mainCategoryId: Number(e.target.value),
                subCategoryId: 0,
                mainFeatures: ""
              })
            }
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>اختر الصنف الرئيسي</option>
            {mainTypes?.map((mainType) => (
              <option key={mainType.id} value={mainType.id}>
                {mainType.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Type */}
        {estateForm.mainCategoryId > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              التصنيف الفرعي
            </label>
            <select
              value={estateForm.subCategoryId}
              onChange={(e) =>
                setEstateForm({
                  ...estateForm,
                  subCategoryId: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>اختر الصنف الفرعي</option>
              {mainTypes
                ?.find((m) => m.id === estateForm.mainCategoryId)
                ?.subtypes.map((subType) => (
                  <option key={subType.id} value={subType.id}>
                    {subType.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Final Type */}
        {estateForm.subCategoryId > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              التصنيف النهائي
            </label>
            <select
              value={estateForm.finalTypeId}
              onChange={(e) =>
                setEstateForm({
                  ...estateForm,
                  finalTypeId: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>اختر الصنف النهائي</option>
              {finalTypes.map((finalType) => (
                <option key={finalType.id} value={finalType.id}>
                  {finalType.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المدينة
          </label>
          <select
            value={estateForm.cityId}
            onChange={(e) =>
              setEstateForm({
                ...estateForm,
                cityId: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>اختر المدينة</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Neighborhood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحي
          </label>
          <select
            value={estateForm.neighborhoodId}
            onChange={(e) =>
              setEstateForm({
                ...estateForm,
                neighborhoodId: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>اختر الحي</option>
            {neighborhood.map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.name}
              </option>
            ))}
          </select>
        </div>

        {/* Floor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الطابق
          </label>
          <select
            value={estateForm.floorNumber}
            onChange={(e) =>
              setEstateForm({
                ...estateForm,
                floorNumber: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>اختر الطابق</option>
            {[
              { value: '0', label: 'أرضي' },
              { value: '1', label: 'أول' },
              { value: '2', label: 'ثاني' },
              { value: '3', label: 'ثالث' },
              { value: '4', label: 'رابع' },
              { value: '5', label: 'خامس' },
            ].map((floor, index) => (
              <option key={index} value={floor.value}>
                {floor.label}
              </option>
            ))}
          </select>
        </div>

        {/* View */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الإطلالة
          </label>
          <select
            value={estateForm.facade}
            onChange={(e) =>
              setEstateForm({
                ...estateForm,
                facade: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>اختر الإطلالة</option>
            {[
              { value: 'بحرية', label: 'بحرية' },
              { value: 'جبلية', label: 'جبلية' },
              { value: 'على الشارع', label: 'على الشارع' },
              { value: 'حديقة داخلية', label: 'حديقة داخلية' },
              { value: 'داخلية', label: 'داخلية' }
            ].map((floor, index) => (
              <option key={index} value={floor.value}>
                {floor.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rental Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            مدة الإيجار
          </label>
          <select
            value={estateForm.rentalDuration}
            onChange={(e) =>
              setEstateForm({
                ...estateForm,
                rentalDuration: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>اختر مدة الإيجار</option>
            {[
              { value: '1', label: 'شهر' },
              { value: '3', label: 'ثلاث شهور' },
              { value: '6', label: 'ستة شهور' },
              { value: '12', label: 'سنة' }
            ].map((floor, index) => (
              <option key={index} value={floor.value}>
                {floor.label}
              </option>
            ))}
          </select>
        </div>


        {/* Bedrooms / Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عدد الغرف
            </label>
            <input
              type="number"
              value={estateForm.bedrooms}
              onChange={(e) =>
                setEstateForm({ ...estateForm, bedrooms: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عدد الحمامات
            </label>
            <input
              type="number"
              value={estateForm.bathrooms}
              onChange={(e) =>
                setEstateForm({
                  ...estateForm,
                  bathrooms: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
        </div>

        {/* Building Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المساحة
          </label>
          <input
            type="text"
            value={estateForm.buildingArea}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setEstateForm({ ...estateForm, buildingArea: value });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="المساحة بالمتر المربع"
          />
        </div>

        {/* Main Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الميزات الاساسية
          </label>
          <FeaturesSelection
            propertyType={getPropertyType()}
            selectedFeatures={estateForm.mainFeatures.split('، ').filter(Boolean)}
            onChange={handleFeaturesChange}
          />
        </div>


        {/* Additional Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الميزات الإضافية
          </label>
          <textarea
            value={estateForm.additionalFeatures}
            onChange={(e) =>
              setEstateForm({
                ...estateForm,
                additionalFeatures: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="الميزات الإضافية"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            صورة الغلاف
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Additional Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ملفات إضافية
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

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
