"use client";

import React, { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Edit2, Eye, Trash2, Check, X } from "lucide-react";
import Image from "next/image";
import { CityType, FinalType, MainType, NeighborhoodType, RealEstateData } from "@/lib/types";
import { RealEstateApi } from "@/api/realEstateApi";
import Spinner from "@/components/ui/Spinner";
import ErrorFallback from "@/components/ui/ErrorFallback";
import { useQueryClient } from "@tanstack/react-query";
import { estateQuery } from "@/lib/constants/queryNames";
import { toast } from "react-toastify";
import apiClient from "@/api";
import { finalTypeTypeApi } from "@/api/finalTypeApi";

type Props = {
  realEstateData: RealEstateData[] | undefined;
  isLoading: boolean;
  mainTypes: MainType[] | undefined;
};

const EstateTable: React.FC<Props> = ({ realEstateData, isLoading, mainTypes }) => {
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEstate, setEditingEstate] = useState<RealEstateData | null>(null);
  const [editError, setEditError] = useState<string | null>(null);


  const [cities, setCities] = useState<CityType[]>([]);
  const [finalTypes, setfinalTypes] = useState<FinalType[]>([]);
  const [neighborhood, setNeighborhood] = useState<NeighborhoodType[]>([]);

  // Deletion State
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingEstateId, setDeletingEstateId] = useState<number | null>(null);

  // Delete Confirmation Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteEstateId, setPendingDeleteEstateId] = useState<number | null>(null);



  // Fetch cities
  useEffect(() => {
    if (editingEstate) {
      console.log(editingEstate);
    }
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/api/cities");
        setCities(response.data);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchFinalType = async () => {
      try {
        if (editingEstate && editingEstate!.subCategoryId != 0) {
          const response = await finalTypeTypeApi.fetchFinalTypeBySubId(editingEstate.subCategoryId);
          setfinalTypes(response);
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };

    if (editingEstate && editingEstate.subCategoryId != 0) {
      fetchFinalType();
    }
  }, [(editingEstate && editingEstate.subCategoryId)]);

  useEffect(() => {
    const fetchNeighborhood = async () => {
      try {
        const response = await apiClient.get(
          `/api/neighborhoods/${editingEstate!.cityId}`
        );
        setNeighborhood(response.data);
      } catch (error) {
        console.error("Failed to fetch neighborhoods:", error);
      }
    };
    if (editingEstate && editingEstate.cityId)
      fetchNeighborhood();
  }, [editingEstate && editingEstate.cityId]);

  // Handle Edit Modal
  const openEditModal = (estate: RealEstateData) => {
    setEditingEstate(estate);
    console.log(estate);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingEstate(null);
    setIsEditModalOpen(false);
    setEditError(null);
  };
  const client = useQueryClient();

  const handleSaveEdit = async () => {
    if (!editingEstate) return;
    console.log(editingEstate);

    try {

      // Call the API with FormData
      await RealEstateApi.updateRealEstate(editingEstate.id, editingEstate);
      toast.success("تم التعديل بنجاح");
      client.invalidateQueries({
        queryKey: [estateQuery]
      });

      closeEditModal();
    } catch (err: any) {
      console.error(err);
      setEditError("خطأ أثناء تحديث العقار");
    }
  };

  // Handle Delete Confirmation Dialog
  const openDeleteDialog = (estateId: number) => {
    setPendingDeleteEstateId(estateId);
    setIsDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setPendingDeleteEstateId(null);
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteEstateId) return;
    try {
      setDeletingEstateId(pendingDeleteEstateId);
      setDeleteError(null);
      await RealEstateApi.deleteRealEstate(pendingDeleteEstateId);
      toast.success("تم الحذف بنجاح");

    } catch (err: any) {
      console.error(err);
      setDeleteError("خطأ أثناء حذف العقار");
    } finally {
      setDeletingEstateId(null);
      closeDeleteDialog();
    }
  };

  // Loading / Error States
  if (isLoading) return <Spinner />;
  // if (!realEstateData) return <ErrorFallback onRefresh={refetch} />;

  return (
    <div className="relative w-full">
      {/* Error Messages */}
      {deleteError && (
        <div className="bg-red-50 text-red-600 border border-red-300 p-3 mb-4 rounded-md">
          {deleteError}
        </div>
      )}
      {editError && (
        <div className="bg-red-50 text-red-600 border border-red-300 p-3 mb-4 rounded-md">
          {editError}
        </div>
      )}

      {/* Table */}
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              العنوان
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              السعر
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              المدينة
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              التصنيف
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {realEstateData != undefined && (realEstateData).map((estate) => {
            const isDeleting = deletingEstateId === estate.id;

            return (
              <tr key={estate.id} className="hover:bg-gray-50">
                {/* Title */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${estate.coverImage}`}
                        alt={estate.title}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">
                        {estate.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {estate.bedrooms} غرف · {estate.bathrooms} حمام ·{" "}
                        {estate.buildingArea} م²
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">
                    {estate.price.toLocaleString()} ر.ع
                  </div>
                </td>

                {/* City and Neighborhood */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{estate.cityName}</div>
                  <div className="text-sm text-gray-500">{estate.neighborhoodName}</div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{estate.mainCategoryId}</div>
                  <div className="text-sm text-gray-500">{estate.subCategoryId}</div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      className="text-green-600 hover:text-green-700"
                      title="عرض"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => openEditModal(estate)}
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-700"
                      onClick={() => openDeleteDialog(estate.id)}
                      disabled={isDeleting}
                      title="حذف"
                    >
                      {isDeleting ? (
                        <Spinner text="جارٍ الحذف..." className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeEditModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-2xl p-6 overflow-hidden text-right align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  تعديل العقار
                </Dialog.Title>
                {editingEstate && (
                  <div className="space-y-4  max-h-[70vh] overflow-auto">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العنوان
                      </label>
                      <input
                        type="text"
                        value={editingEstate.title}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        السعر
                      </label>
                      <input
                        type="number"
                        value={editingEstate.price}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, price: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* City ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المدينة
                      </label>
                      <select
                        value={editingEstate.cityId}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, cityId: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>اختر المدينة</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Neighborhood ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحي
                      </label>
                      <select
                        value={editingEstate.neighborhoodId}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, neighborhoodId: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>اختر الحي</option>
                        {neighborhood.map((nb) => (
                          <option key={nb.id} value={nb.id}>
                            {nb.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Bedrooms */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        عدد الغرف
                      </label>
                      <input
                        type="number"
                        value={editingEstate.bedrooms}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, bedrooms: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Bathrooms */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        عدد الحمامات
                      </label>
                      <input
                        type="number"
                        value={editingEstate.bathrooms}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, bathrooms: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Furnished */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        مفروش
                      </label>
                      <input
                        type="checkbox"
                        checked={editingEstate.furnished}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, furnished: e.target.checked })
                        }
                        className="w-4 h-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Building Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المساحة
                      </label>
                      <input
                        type="text"
                        value={editingEstate.buildingArea}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, buildingArea: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Floor Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الطابق
                      </label>
                      <select
                        value={editingEstate.floorNumber}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, floorNumber: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>اختر الطابق</option>
                        {[
                          { value: 0, label: "أرضي" },
                          { value: 1, label: "أول" },
                          { value: 2, label: "ثاني" },
                          { value: 3, label: "ثالث" },
                          { value: 4, label: "رابع" },
                          { value: 5, label: "خامس" },
                        ].map((floor, index) => (
                          <option key={index} value={floor.value}>
                            {floor.label}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Facade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الإطلالة
                      </label>
                      <select
                        value={editingEstate.facade}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, facade: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={""}>اختر الإطلالة</option>
                        {[
                          { value: "بحرية", label: "بحرية" },
                          { value: "جبلية", label: "جبلية" },
                          { value: "على الشارع", label: "على الشارع" },
                          { value: "حديقة داخلية", label: "حديقة داخلية" },
                          { value: "داخلية", label: "داخلية" },
                        ].map((facade, index) => (
                          <option key={index} value={facade.value}>
                            {facade.label}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        طريقة الدفع
                      </label>
                      <input
                        type="text"
                        value={editingEstate.paymentMethod}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, paymentMethod: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Main Category ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        التصنيف الرئيسي
                      </label>
                      <select
                        value={editingEstate.mainCategoryId}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, mainCategoryId: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>اختر التصنيف الرئيسي</option>
                        {mainTypes?.map((mainType) => (
                          <option key={mainType.id} value={mainType.id}>
                            {mainType.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Sub Category ID */}
                    {editingEstate.mainCategoryId > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          التصنيف الفرعي
                        </label>
                        <select
                          value={editingEstate.subCategoryId}
                          onChange={(e) =>
                            setEditingEstate({ ...editingEstate, subCategoryId: Number(e.target.value) })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>اختر التصنيف الفرعي</option>
                          {mainTypes
                            ?.find((m) => m.id === editingEstate.mainCategoryId)
                            ?.subtypes.map((subType) => (
                              <option key={subType.id} value={subType.id}>
                                {subType.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Final Type ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        التصنيف النهائي
                      </label>
                      <select
                        value={editingEstate.finalTypeId}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, finalTypeId: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>اختر التصنيف النهائي</option>
                        {finalTypes.map((finalType) => (
                          <option key={finalType.id} value={finalType.id}>
                            {finalType.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Main Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الميزات الأساسية
                      </label>
                      <textarea
                        value={editingEstate.mainFeatures}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, mainFeatures: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Additional Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الميزات الإضافية
                      </label>
                      <textarea
                        value={editingEstate.additionalFeatures}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, additionalFeatures: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Nearby Locations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المواقع القريبة
                      </label>
                      <textarea
                        value={editingEstate.nearbyLocations}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, nearbyLocations: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>


                    {/* Rental Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        مدة الإيجار
                      </label>
                      <select
                        value={editingEstate.rentalDuration}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, rentalDuration: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>اختر مدة الإيجار</option>
                        {[
                          { value: 1, label: "شهر" },
                          { value: 3, label: "ثلاث شهور" },
                          { value: 6, label: "ستة شهور" },
                          { value: 12, label: "سنة" },
                        ].map((duration, index) => (
                          <option key={index} value={duration.value}>
                            {duration.label}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Ceiling Height */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ارتفاع السقف
                      </label>
                      <input
                        type="number"
                        value={editingEstate.ceilingHeight}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, ceilingHeight: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Total Floors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        إجمالي الطوابق
                      </label>
                      <input
                        type="number"
                        value={editingEstate.totalFloors}
                        onChange={(e) =>
                          setEditingEstate({ ...editingEstate, totalFloors: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}


                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    onClick={closeEditModal}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Dialog */}
      <Transition appear show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeDeleteDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-right align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  تأكيد الحذف
                </Dialog.Title>
                <div className="text-gray-700 mb-6">
                  هل أنت متأكد أنك تريد حذف هذا العقار؟ لا يمكن التراجع عن هذا القرار.
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    onClick={closeDeleteDialog}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    تأكيد الحذف
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EstateTable;