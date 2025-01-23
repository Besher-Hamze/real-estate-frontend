import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RealEstateApi } from "@/api/realEstateApi";
import { RealEstateData } from "@/lib/types";

export default function RealEstateView() {
    const router = useRouter();
    const { id } = router.query;
    const [estate, setEstate] = useState<RealEstateData | null>(null);

    useEffect(() => {
        if (id) {
            const fetchEstate = async () => {
                try {
                    const estateData = await RealEstateApi.fetchRealEstateById(Number(id));
                    setEstate(estateData);
                } catch (error) {
                    console.error("Failed to fetch estate:", error);
                }
            };
            fetchEstate();
        }
    }, [id]);

    if (!estate) return <div>جارٍ التحميل...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{estate.title}</h1>
            <p className="text-gray-700 mb-2">السعر: {estate.price} ريال</p>
            <p className="text-gray-700 mb-2">المدينة: {estate.cityId}</p>
            <p className="text-gray-700 mb-2">الحي: {estate.neighborhoodId}</p>
            <p className="text-gray-700 mb-2">عدد الغرف: {estate.bedrooms}</p>
            <p className="text-gray-700 mb-2">عدد الحمامات: {estate.bathrooms}</p>
            <p className="text-gray-700 mb-2">المساحة: {estate.buildingArea} متر مربع</p>
            <p className="text-gray-700 mb-2">الميزات الأساسية: {estate.mainFeatures}</p>
            <p className="text-gray-700 mb-2">الميزات الإضافية: {estate.additionalFeatures}</p>
            <img src={estate.coverImage} alt="Cover" className="w-full h-64 object-cover mb-4" />
        </div>
    );
}