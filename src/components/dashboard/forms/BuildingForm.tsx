"use client";

import React, { useEffect, useState } from "react";
import { Home, Plus, ShoppingBag } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { Building, BuildingItem } from "@/lib/types";
import { BuildingItemList } from "../building/BuildingItemList";
import { BuildingItemForm } from "../building/BuildingItemForm";
import { useBuildingForm } from "@/lib/hooks/useBuildingForm";
import { EstateFormModal } from "../building/EstateFormModal";
import { MapLocationSelector } from "@/components/map/MapLocationSelector";
import { BuildingItemsModal } from "../building/BuildingItemsModal";
import { BUILDING_AGE_OPTION, STATUS_OPTIONS } from "@/components/ui/constants/formOptions";



interface BuildingFormProps {
  onSuccess?: () => void;
  initialData?: Building;
  mode?: 'create' | 'edit';
}

export default function BuildingForm({
  onSuccess,
  initialData,
  mode = 'create'
}: BuildingFormProps) {
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const {
    formData,
    isLoading,
    handleChange,
    handleSubmit,
  } = useBuildingForm({ onSuccess, mode, initialData });

  const getItemsSummary = (items: BuildingItem[] = []) => {
    const apartments = items.filter(item => item.type === 'apartment').length;
    const shops = items.filter(item => item.type === 'shop').length;
    return { apartments, shops };
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">
            {mode === 'create' ? 'إضافة مبنى جديد' : 'تعديل المبنى'}
          </h2>

          <div className="space-y-4">
            <FormField label="اسم المبنى">
              <InputField
                type="text"
                value={formData.title}
                onChange={(value) => handleChange('title', value)}
                placeholder="أدخل اسم المبنى"
                required
              />
            </FormField>

            <FormField label="حالة المبنى">
              <SelectField
                value={formData.status}
                onChange={(value) => handleChange('status', value)}
                options={STATUS_OPTIONS}
                placeholder="اختر حالة المبنى"
              />
            </FormField>

            {/* Building Age  */}
            <FormField label="عمر البناء">
              <SelectField
                value={formData.buildingAge}
                onChange={(value) => handleChange('buildingAge', value)}
                options={BUILDING_AGE_OPTION}
                placeholder="اختر عمر المبنى"
              />
            </FormField>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">موقع المبنى</h3>
          <MapLocationSelector
            initialLocation={formData.location}
            onChange={(location) => handleChange('location', location)}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isLoading}
        >
          <Plus className="w-5 h-5" />
          {isLoading
            ? "جارٍ الحفظ..."
            : mode === 'create'
              ? "إضافة مبنى"
              : "تحديث المبنى"
          }
        </button>
      </form>
    </>
  );
}
