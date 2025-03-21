import { useEffect, useState } from "react";
import { CreateFinalCity } from "@/lib/types/create";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useNeighborhood } from "@/lib/hooks/useNeighborhood";
import { finalCityApi } from "@/api/finalCityApi";
import { finalCityQuery } from "@/lib/constants/queryNames";
import { FormField } from "@/components/ui/form/FormField";
import LocationPicker from "@/components/map/LocationPicker";
import { useFinalCities } from "@/lib/hooks/useFinalCity";
import { Loader2, MapPin } from "lucide-react";

export default function FinalCityForm() {
    const { neighborhoods } = useNeighborhood();
    const { finalCities } = useFinalCities();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateFinalCity>({
        name: "",
        neighborhoodId: 0,
        location: ""
    });
    
    // State for manual coordinate entry
    const [latitude, setLatitude] = useState<string>("");
    const [longitude, setLongitude] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update manual coordinate inputs when location changes from map
    useEffect(() => {
        if (formData.location) {
            const [lat, lng] = formData.location.split(",");
            setLatitude(lat);
            setLongitude(lng);
        }
    }, [formData.location]);

    const handleFormChange = (field: string, value: any) => {
        if (field === "location" && typeof value === "object") {
            const { latitude, longitude } = value;
            setFormData(prev => ({
                ...prev,
                location: `${latitude},${longitude}`
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
        
        // Clear error for this field when it changes
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Function to update location from manual latitude/longitude inputs
    const updateLocationFromCoordinates = () => {
        if (!latitude || !longitude) {
            toast.error("يرجى إدخال قيم صحيحة للإحداثيات");
            return;
        }

        try {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            
            // Basic validation for coordinate ranges
            if (lat < -90 || lat > 90) {
                setErrors(prev => ({ ...prev, latitude: "قيمة خط العرض يجب أن تكون بين -90 و 90" }));
                return;
            }
            
            if (lng < -180 || lng > 180) {
                setErrors(prev => ({ ...prev, longitude: "قيمة خط الطول يجب أن تكون بين -180 و 180" }));
                return;
            }
            
            handleFormChange("location", { latitude: lat, longitude: lng });
            toast.success("تم تحديث الموقع");
        } catch (error) {
            toast.error("حدث خطأ في تحديث الموقع");
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name) {
            newErrors.name = "اسم المنطقة مطلوب";
        }
        
        if (!formData.neighborhoodId) {
            newErrors.neighborhoodId = "يجب اختيار المدينة";
        }
        
        if (!formData.location) {
            newErrors.location = "يجب تحديد الموقع على الخريطة";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddFinalCity = async () => {
        if (!validateForm()) {
            toast.error("يرجى تصحيح الأخطاء في النموذج");
            return;
        }
        
        setIsLoading(true);
        
        try {
            await finalCityApi.addFinalCity(formData);
            queryClient.invalidateQueries({ queryKey: [finalCityQuery] });
            toast.success("تم إضافة المنطقة بنجاح");
            
            // Reset form
            setFormData({
                name: "",
                neighborhoodId: 0,
                location: ""
            });
            setLatitude("");
            setLongitude("");
        } catch (error) {
            toast.error("فشل في إضافة المنطقة");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">إضافة منطقة</h2>
            
            <div className="space-y-6">
                <FormField 
                    label="المدينة" 
                    error={errors.neighborhoodId}
                >
                    <select
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={formData.neighborhoodId || ""}
                        onChange={(e) => handleFormChange("neighborhoodId", Number(e.target.value))}
                        disabled={isLoading}
                    >
                        <option value="">اختر المدينة</option>
                        {neighborhoods?.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </FormField>
                
                <FormField 
                    label="اسم المنطقة" 
                    error={errors.name}
                >
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="أدخل اسم المنطقة"
                        value={formData.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        disabled={isLoading}
                    />
                </FormField>
                
                {/* Coordinate input fields */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField 
                        label="خط العرض (Latitude)" 
                        error={errors.latitude}
                    >
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="مثال: 23.5880"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            disabled={isLoading}
                        />
                    </FormField>
                    
                    <FormField 
                        label="خط الطول (Longitude)" 
                        error={errors.longitude}
                    >
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="مثال: 58.4059"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            disabled={isLoading}
                        />
                    </FormField>
                </div>
                
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        onClick={updateLocationFromCoordinates}
                        disabled={isLoading}
                    >
                        <MapPin className="w-4 h-4" />
                        تحديث الموقع على الخريطة
                    </button>
                </div>
                
                <FormField 
                    label="تحديد الموقع على الخريطة" 
                    error={errors.location}
                >
                    <LocationPicker
                        key={`map-${latitude}-${longitude}`}
                        initialLatitude={
                            formData.location
                                ? parseFloat(formData.location.split(",")[0])
                                : undefined
                        }
                        initialLongitude={
                            formData.location
                                ? parseFloat(formData.location.split(",")[1])
                                : undefined
                        }
                        onLocationSelect={(latitude, longitude) => {
                            handleFormChange("location", { latitude, longitude });
                        }}
                    />
                </FormField>
                
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    onClick={handleAddFinalCity}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            جاري الإضافة...
                        </>
                    ) : (
                        "إضافة منطقة"
                    )}
                </button>
            </div>
        </div>
    );
}