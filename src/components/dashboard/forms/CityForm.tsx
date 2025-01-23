import React, { useState } from "react";
import { Plus } from "lucide-react";
import { CreateCity } from "@/lib/types/create";
import { cityApi } from "@/api/cityApi";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { cityQuery } from "@/lib/constants/queryNames";

export default function CityForm() {
  const [cityForm, setCityForm] = useState<CreateCity>({
    name: "",
  });

  const client = useQueryClient();
  const handleAddCity = async () => {
    try {
      await cityApi.addCity(cityForm);
      client.invalidateQueries({
        queryKey: [cityQuery]
      })
      toast.success("تم إضافة المدينة بنجاح!");
      setCityForm({ name: "" });
    } catch (error) {
      toast.error("فشل في إضافة المدينة");
      console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddCity();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">إضافة مدينة</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            اسم المدينة
          </label>
          <input
            type="text"
            value={cityForm.name}
            onChange={(e) => setCityForm({ name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل اسم المدينة"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة مدينة
        </button>
      </div>
    </form>
  );
}
