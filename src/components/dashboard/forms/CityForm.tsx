import { AddItemForm } from '@/components/ui/form/AddItemForm';
import { cityApi } from "@/api/cityApi";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { cityQuery } from "@/lib/constants/queryNames";

export default function CityForm() {
  const client = useQueryClient();

  const handleAddCity = async (formData: { name: string }) => {
    try {
      await cityApi.addCity(formData);
      client.invalidateQueries({
        queryKey: [cityQuery]
      });
      toast.success("تم إضافة المحافظة بنجاح!");
    } catch (error) {
      toast.error("فشل في إضافة المحافظة");
      console.error(error);
    }
  };

  const fields = [
    {
      name: 'name',
      label: 'اسم المحافظة',
      type: 'text' as const,
      placeholder: 'أدخل اسم المحافظة'
    }
  ];

  return (
    <AddItemForm
      title="إضافة محافظة"
      buttonText="إضافة محافظة"
      fields={fields}
      onSubmit={handleAddCity}
    />
  );
}
