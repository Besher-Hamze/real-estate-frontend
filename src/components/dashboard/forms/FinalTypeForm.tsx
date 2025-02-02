import { AddItemForm } from '@/components/ui/form/AddItemForm';
import { finalTypeTypeApi } from "@/api/finalTypeApi";
import { useMainType } from "@/lib/hooks/useMainType";
import { useQueryClient } from "@tanstack/react-query";
import { finalTypeQuery } from "@/lib/constants/queryNames";
import { toast } from "react-toastify";

export default function FinalTypeForm() {
  const { mainTypes } = useMainType();
  const client = useQueryClient();
  const allSubTypes = mainTypes?.flatMap((main) => main.subtypes) || [];

  const handleCreateFinalType = async (formData: FormData) => {
    try {
      await finalTypeTypeApi.addFinalTypeType({
        name: formData.get('name')?.toString() || '',
        subId: Number(formData.get('subId')) || 0,
      });
      client.invalidateQueries({ queryKey: [finalTypeQuery] });
      toast.success("تم إضافة النوع النهائي بنجاح!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("فشل في إضافة النوع النهائي");
    }
  };

  const fields = [
    {
      type: 'select' as const,
      name: 'subId',
      label: 'التصنيف الفرعي',
      placeholder: 'اختر التصنيف الفرعي',
      options: allSubTypes.map(sub => ({
        value: sub.id,
        label: sub.name
      })),
      required: true
    },
    {
      type: 'text' as const,
      name: 'name',
      label: 'اسم النوع النهائي',
      placeholder: 'أدخل الاسم',
      required: true
    }
  ];

  return (
    <AddItemForm
      title="إضافة نوع نهائي"
      buttonText="إضافة نوع نهائي"
      fields={fields}
      onSubmit={handleCreateFinalType}
    />
  );
}