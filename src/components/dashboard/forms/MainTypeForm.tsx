import React, { useState } from "react";
import { Plus } from "lucide-react";
import { mainTypeApi } from "@/api/mainTypeApi";
import { useMainType } from "@/lib/hooks/useMainType";
import { CreateMainTypeForm } from "@/lib/types/create";
import { toast } from "react-toastify";

export default function MainTypeForm() {
  const [mainTypeForm, setMainTypeForm] = useState<CreateMainTypeForm>({
    name: "",
    icon: "Building2",
  });

  const { refetch: refetchMainTypes } = useMainType();
  const handleCreateMainType = async () => {
    try {
      await mainTypeApi.addMainType(mainTypeForm);
      refetchMainTypes();
      setMainTypeForm({ name: "", icon: "Building2" });
      toast.success("تم إضافة التصنيف الرئيسي بنجاح!");
    } catch (error) {
      toast.error("فشل في إضافة التصنيف الرئيسي");
      console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateMainType();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">إضافة تصنيف رئيسي</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            اسم التصنيف
          </label>
          <input
            type="text"
            value={mainTypeForm.name}
            onChange={(e) =>
              setMainTypeForm({ ...mainTypeForm, name: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل اسم التصنيف"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الأيقونة
          </label>
          <select
            value={mainTypeForm.icon}
            onChange={(e) =>
              setMainTypeForm({ ...mainTypeForm, icon: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Building2">مبنى</option>
            <option value="Home">منزل</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة تصنيف
        </button>
      </div>
    </form>
  );
}
