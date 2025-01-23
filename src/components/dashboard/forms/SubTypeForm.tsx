import React, { useState } from "react";
import { Plus } from "lucide-react";
import { CreateSubTypeForm } from "@/lib/types/create";
import { subMainTypeApi } from "@/api/subMainTypeApi";
import { useMainType } from "@/lib/hooks/useMainType";
import { useQueryClient } from "@tanstack/react-query";
import { mainTypeQuery, subTypesQuery } from "@/lib/constants/queryNames";
import { toast } from "react-toastify";

export default function SubTypeForm() {
  const [subTypeForm, setSubTypeForm] = useState<CreateSubTypeForm>({
    name: "",
    mainId: 0,
  });

  const { mainTypes } = useMainType();
  const client = useQueryClient();

  const handleCreateSubType = async () => {
    try {
      await subMainTypeApi.addSubMainType(subTypeForm);
      client.invalidateQueries({ queryKey: [mainTypeQuery] });
      toast.success("تم إضافة التصنيف الفرعي بنجاح!");
      setSubTypeForm({ name: "", mainId: 0 });
    } catch (error) {
      toast.error("فشل في إضافة التصنيف الفرعي");
      console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateSubType();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">إضافة تصنيف فرعي</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التصنيف الرئيسي
          </label>
          <select
            value={subTypeForm.mainId}
            onChange={(e) =>
              setSubTypeForm({
                ...subTypeForm,
                mainId: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>اختر التصنيف الرئيسي</option>
            {mainTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            اسم التصنيف الفرعي
          </label>
          <input
            type="text"
            value={subTypeForm.name}
            onChange={(e) =>
              setSubTypeForm({ ...subTypeForm, name: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل اسم التصنيف الفرعي"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة تصنيف فرعي
        </button>
      </div>
    </form>
  );
}
