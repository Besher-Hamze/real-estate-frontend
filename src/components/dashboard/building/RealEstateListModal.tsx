import React, { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealEstateApi } from '@/api/realEstateApi';
import { cityApi } from '@/api/cityApi';
import { neighborhoodApi } from '@/api/NeighborhoodApi';
import { finalTypeTypeApi } from '@/api/finalTypeApi';
import { RealEstateData } from '@/lib/types';
import RealEstateCard from '@/components/widgets/PropertyGrid/PropertyCard';
import { mainTypeApi } from '@/api/mainTypeApi';
import { toast } from 'react-toastify';
import { finalCityQuery } from '@/lib/constants/queryNames';
import { finalCityApi } from '@/api/finalCityApi';
import { EditEstateForm } from '../estate-components/Edit-Estate';

interface RealEstateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildingItemId?: string;
}

export function RealEstateListModal({
    isOpen,
    onClose,
    buildingItemId
}: RealEstateListModalProps) {
    const queryClient = useQueryClient();
    const [editingEstate, setEditingEstate] = useState<RealEstateData | null>(null);

    // Fetch real estates associated with the building item
    const { data: realEstates = [], isLoading, error } = useQuery({
        queryKey: ['realEstates', buildingItemId],
        queryFn: () => buildingItemId
            ? RealEstateApi.fetchRealEstateByBuildingItemId(buildingItemId)
            : Promise.resolve([]),
        enabled: isOpen && !!buildingItemId
    });

    // Fetch data for edit form
    const { data: cities = [] } = useQuery({
        queryKey: ['cities'],
        queryFn: () => cityApi.fetchCity(),
        enabled: !!editingEstate
    });

    const { data: neighborhoods = [] } = useQuery({
        queryKey: ['neighborhoods', editingEstate?.cityId],
        queryFn: () => neighborhoodApi.fetchNeighborhoodByCityId(editingEstate?.cityId || 0),
        enabled: !!editingEstate && !!editingEstate.cityId
    });

    const { data: finalCities = [] } = useQuery({
        queryKey: [finalCityQuery, editingEstate?.neighborhoodId],
        queryFn: () => finalCityApi.fetchFinalCityByNeighborhoodId(editingEstate?.neighborhoodId || 0),
        enabled: !!editingEstate && !!editingEstate.neighborhoodId
    });


    const { data: mainTypes = [] } = useQuery({
        queryKey: ['mainTypes'],
        queryFn: () => mainTypeApi.fetchMainType(),
        enabled: !!editingEstate
    });

    const { data: finalTypes = [] } = useQuery({
        queryKey: ['finalTypes', editingEstate?.subCategoryId],
        queryFn: () => finalTypeTypeApi.fetchFinalTypeBySubId(editingEstate?.subCategoryId || 0),
        enabled: !!editingEstate && !!editingEstate.subCategoryId
    });

    const updateEstateMutation = useMutation({
        mutationFn: (updatedEstate: any) => {
            return RealEstateApi.updateRealEstate(updatedEstate.id, updatedEstate);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['realEstates', buildingItemId] });
            toast.success("تم التعديل بنجاح");
            setEditingEstate(null);
        }
    });

    const handleEditClick = (estate: RealEstateData) => {
        setEditingEstate(estate);
    };

    const handleEditSubmit = async (updatedEstate: any) => {
        await updateEstateMutation.mutateAsync(updatedEstate);
    };

    const handleCloseEdit = () => {
        setEditingEstate(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                >
                    {editingEstate ? (
                        <>
                            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                                <h2 className="text-xl font-semibold">تعديل العقار</h2>
                                <button
                                    onClick={handleCloseEdit}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <EditEstateForm
                                    editingEstate={editingEstate}
                                    setEditingEstate={setEditingEstate}
                                    onSubmit={handleEditSubmit}
                                    cities={cities}
                                    neighborhoods={neighborhoods}
                                    mainTypes={mainTypes}
                                    finalTypes={finalTypes}
                                    finalCities={finalCities} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                                <h2 className="text-xl font-semibold">الإعلانات المرتبطة</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : error ? (
                                    <p className="text-center text-red-500 py-6">حدث خطأ في جلب الإعلانات</p>
                                ) : realEstates && realEstates.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(Array.isArray(realEstates) ? realEstates : [realEstates]).map((item: RealEstateData) => (
                                            <div key={item.id} className="relative group">
                                                <RealEstateCard
                                                    item={item}
                                                    mainType={{ name: item.mainCategoryName }}
                                                />
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="تعديل العقار"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">لا توجد عقارات مرتبطة</p>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}