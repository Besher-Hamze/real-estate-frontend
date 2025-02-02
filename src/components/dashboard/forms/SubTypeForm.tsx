import React from "react";
import { AddItemForm } from "@/components/ui/form/AddItemForm";
import { CreateSubTypeForm } from "@/lib/types/create";
import { subMainTypeApi } from "@/api/subMainTypeApi";
import { useMainType } from "@/lib/hooks/useMainType";
import { useQueryClient } from "@tanstack/react-query";
import { mainTypeQuery } from "@/lib/constants/queryNames";
import { toast } from "react-toastify";

export default function SubTypeForm() {
  const { mainTypes } = useMainType();
  const queryClient = useQueryClient();

  // The onSubmit handler receives the form data from AddItemForm.
  const handleCreateSubType = async (formData: CreateSubTypeForm) => {
    try {
      await subMainTypeApi.addSubMainType(formData);
      queryClient.invalidateQueries({ queryKey: [mainTypeQuery] });
      toast.success("تم إضافة التصنيف الفرعي بنجاح!");
    } catch (error) {
      toast.error("فشل في إضافة التصنيف الفرعي");
      console.error(error);
    }
  };

  const fields = [
    {
      name: "mainId",
      label: "التصنيف الرئيسي",
      type: "select" as const,
      placeholder: "اختر التصنيف الرئيسي",
      options: mainTypes?.map((type) => ({
        value: type.id,
        label: type.name,
      })) || [],
    },
    {
      name: "name",
      label: "اسم التصنيف الفرعي",
      type: "text" as const, 
      placeholder: "أدخل اسم التصنيف الفرعي",
    },
  ];

  return (
    <AddItemForm
      title="إضافة تصنيف فرعي"
      buttonText="إضافة تصنيف فرعي"
      fields={fields}
      onSubmit={handleCreateSubType}
    />
  );
}
