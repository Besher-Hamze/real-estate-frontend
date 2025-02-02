import { useEffect, useState } from "react";
import { AddItemForm } from "@/components/ui/form/AddItemForm";
import { CreateNeighborhood } from "@/lib/types/create";
import apiClient from "@/api"; // Your API client
import { neighborhoodApi } from "@/api/NeighborhoodApi";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { CityType } from "@/lib/types";

export default function NeighborhoodForm() {
  const [cities, setCities] = useState<CityType[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/api/cities");
        setCities(response.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  const handleAddNeighborhood = async (formData: CreateNeighborhood) => {
    try {
      await neighborhoodApi.addNeighborhood(formData);
      queryClient.invalidateQueries({ queryKey: ["neighborhoods"] });
      toast.success("تم إضافة الحي بنجاح");
    } catch (error) {
      toast.error("فشل في إضافة الحي");
      console.error(error);
    }
  };

  const fields = [
    {
      name: "cityId",
      label: "المدينة",
      type: "select" as const, 
      placeholder: "اختر المدينة",
      options: cities.map((city) => ({
        value: city.id,
        label: city.name,
      })),
    },
    {
      name: "name",
      label: "اسم الحي",
      type: "text" as const, 
      placeholder: "أدخل اسم الحي",
    },
  ];

  return (
    <AddItemForm
      title="إضافة حي"
      buttonText="إضافة حي"
      fields={fields}
      onSubmit={handleAddNeighborhood}
    />
  );
}
