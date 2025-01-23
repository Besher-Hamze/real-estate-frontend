import React, { useState } from "react";
import { Plus } from "lucide-react";
import { CreateFinalTypeForm } from "@/lib/types/create";
import { useMainType } from "@/lib/hooks/useMainType";
import { finalTypeTypeApi } from "@/api/finalTypeApi";
import { useQueryClient } from "@tanstack/react-query";
import { finalTypeQuery } from "@/lib/constants/queryNames";
import { toast } from "react-toastify";

export default function FinalTypeForm() {
  const [finalTypeForm, setFinalTypeForm] = useState<CreateFinalTypeForm>({
    name: "",
    subId: 0,
  });

  const { mainTypes } = useMainType();
  const allSubTypes = mainTypes?.flatMap((main) => main.subtypes) || [];
  const client = useQueryClient();
  const handleCreateFinalType = async () => {
    try {
      await finalTypeTypeApi.addFinalTypeType({
        name: finalTypeForm.name,
        subId: finalTypeForm.subId, 
      });
      client.invalidateQueries({ queryKey: [finalTypeQuery] });
      toast.success("تم إضافة النوع النهائي بنجاح!");
      setFinalTypeForm({ name: "", subId: 0 });
    } catch (error) {
      toast.error("فشل في إضافة النوع النهائي");
      console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateFinalType();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">إضافة نوع نهائي</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التصنيف الفرعي
          </label>
          <select
            value={finalTypeForm.subId}
            onChange={(e) =>
              setFinalTypeForm({ ...finalTypeForm, subId: Number(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>اختر التصنيف الفرعي</option>
            {allSubTypes.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            اسم النوع النهائي
          </label>
          <input
            type="text"
            value={finalTypeForm.name}
            onChange={(e) =>
              setFinalTypeForm({ ...finalTypeForm, name: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل الاسم"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة نوع نهائي
        </button>
      </div>
    </form>
  );
}
