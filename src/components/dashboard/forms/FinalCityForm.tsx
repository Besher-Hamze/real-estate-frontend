import { useEffect, useState } from "react";
import { AddItemForm } from "@/components/ui/form/AddItemForm";
import { CreateFinalCity, CreateNeighborhood } from "@/lib/types/create";
import apiClient from "@/api"; // Your API client
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { CityType } from "@/lib/types";
import { useNeighborhood } from "@/lib/hooks/useNeighborhood";
import { finalCityApi } from "@/api/finalCityApi";
import { finalCityQuery } from "@/lib/constants/queryNames";

export default function FinalCityForm() {
    const { neighborhoods } = useNeighborhood();
    const queryClient = useQueryClient();


    const handleAddFinalCity = async (formData: CreateFinalCity) => {
        try {
            await finalCityApi.addFinalCity(formData);
            queryClient.invalidateQueries({ queryKey: [finalCityQuery] });
            toast.success("تم إضافة الحي بنجاح");
        } catch (error) {
            toast.error("فشل في إضافة الحي");
            console.error(error);
        }
    };

    const fields = [
        {
            name: "neighborhoodId",
            label: "المدينة",
            type: "select" as const,
            placeholder: "اختر المدينة",
            options: neighborhoods?.map((city) => ({
                value: city.id,
                label: city.name,
            })) || [],
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
            onSubmit={handleAddFinalCity}
        />
    );
}
