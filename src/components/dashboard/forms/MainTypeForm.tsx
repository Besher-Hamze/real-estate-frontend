import { AddItemForm } from '@/components/ui/form/AddItemForm';
import { mainTypeApi } from "@/api/mainTypeApi";
import { useMainType } from "@/lib/hooks/useMainType";
import { toast } from "react-toastify";

export default function MainTypeForm() {
  const { refetch: refetchMainTypes } = useMainType();

  const handleCreateMainType = async (formData: FormData) => {
    try {
      const response = await mainTypeApi.addMainType(formData);
      refetchMainTypes();
      toast.success("تم إضافة التصنيف الرئيسي بنجاح!");
    } catch (error: any) {
      console.error("Full Error Object:", error);
      
      if (error.response) {
        console.error("Response Error:", {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      }
      
      toast.error("فشل في إضافة التصنيف الرئيسي");
    }
};



  const fields = [
    {
      type: 'text' as const,
      name: 'name',
      label: 'اسم التصنيف',
      placeholder: 'أدخل اسم التصنيف',
      required: true
    },
    {
      type: 'file' as const,
      name: 'icon',
      label: 'الأيقونة',
      accept: 'image/*',
      preview: true,
      required: true
    }
  ];

  return (
    <AddItemForm
      title="إضافة تصنيف رئيسي"
      buttonText="إضافة تصنيف"
      fields={fields}
      onSubmit={handleCreateMainType}
    />
  );
}
