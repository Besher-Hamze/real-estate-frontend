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
import EditEstateForm from "../estate-components/Edit-Estate";

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
                {editingEstate && <EditEstateForm
                  editingEstate={editingEstate}
                  setEditingEstate={setEditingEstate}
                  cities={cities}
                  neighborhood={neighborhood}
                  mainTypes={mainTypes as any}
                  finalTypes={finalTypes}
                />
                }


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