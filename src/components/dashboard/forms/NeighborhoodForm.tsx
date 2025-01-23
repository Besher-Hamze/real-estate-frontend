import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CreateNeighborhood } from "@/lib/types/create";
import apiClient from "@/api"; // or wherever you handle your requests
import { neighborhoodApi } from "@/api/NeighborhoodApi";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { CityType } from "@/lib/types";

export default function NeighborhoodForm() {
    const [neighborhoodForm, setNeighborhoodForm] = useState<CreateNeighborhood>({
        name: "",
        cityId: 0,
    });

    const [cities, setCities] = useState<CityType[]>([]);

    const client = useQueryClient();
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await apiClient.get("/api/cities");
                setCities(response.data);
            } catch (err) {
                console.error("Error fetching cities:", err);
            }
        };
        fetchCities();
    }, []);

    const handleAddNeighborhood = async () => {
        try {
            await neighborhoodApi.addNeighborhood(neighborhoodForm);
            client.invalidateQueries({ queryKey: ["neighborhoods"] })
            toast.success("تم إضافة الحي بنجاح");
            setNeighborhoodForm({ name: "", cityId: 0 });
        } catch (error) {
            toast.error("فشل في إضافة الحي");
            console.error(error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddNeighborhood();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-6">إضافة حي</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        المدينة
                    </label>
                    <select
                        value={neighborhoodForm.cityId}
                        onChange={(e) =>
                            setNeighborhoodForm({
                                ...neighborhoodForm,
                                cityId: Number(e.target.value),
                            })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={0}>اختر المدينة</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم الحي
                    </label>
                    <input
                        type="text"
                        value={neighborhoodForm.name}
                        onChange={(e) =>
                            setNeighborhoodForm({ ...neighborhoodForm, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="أدخل اسم الحي"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة حي
                </button>
            </div>
        </form>
    );
}
