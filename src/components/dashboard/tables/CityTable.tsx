"use client";

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Edit2, Trash2, Check, X } from "lucide-react";

import { useCity } from "@/lib/hooks/useCity";
import { cityApi } from "@/api/cityApi"; // Or wherever your API client is
import Spinner from "@/components/ui/Spinner";
import ErrorFallback from "@/components/ui/ErrorFallback";

export default function CityTable() {
  // Fetch city list
  const { cities, isLoading: isLoadingCities, error, refetch } = useCity();

  // Inline Edit State
  const [editingCityId, setEditingCityId] = useState<number | null>(null);
  const [editCityName, setEditCityName] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);

  // Deletion State
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingCityId, setDeletingCityId] = useState<number | null>(null);

  // ** Dialog State ** for Delete Confirmation
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteCityId, setPendingDeleteCityId] = useState<number | null>(
    null
  );

  // Loading states to show spinners (edit or delete)
  // We already have `deletingCityId`. We can do a similar approach for editing if needed.

  // 1) Inline Edit Logic
  const handleEdit = (cityId: number, currentName: string) => {
    setEditingCityId(cityId);
    setEditCityName(currentName);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingCityId(null);
    setEditCityName("");
    setEditError(null);
  };

  const handleSaveEdit = async (cityId: number) => {
    try {
      // Example: call your update API
      await cityApi.updateCity(cityId, { name: editCityName });

      // Refetch to see updated data
      refetch();

      // Exit edit mode
      setEditingCityId(null);
      setEditCityName("");
    } catch (err: any) {
      console.error(err);
      setEditError("خطأ أثناء تحديث المدينة");
    }
  };

  // 2) Delete Logic with Dialog
  const openDeleteDialog = (cityId: number) => {
    // Save the city ID to be deleted, then open the dialog
    setPendingDeleteCityId(cityId);
    setIsDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setPendingDeleteCityId(null);
    setIsDialogOpen(false);
  };

  // Actual "delete" after user confirms
  const handleConfirmDelete = async () => {
    if (!pendingDeleteCityId) return;
    try {
      setDeletingCityId(pendingDeleteCityId);
      setDeleteError(null);

      await cityApi.deleteCity(pendingDeleteCityId);
      refetch();
    } catch (err: any) {
      console.error(err);
      setDeleteError("خطأ أثناء حذف المدينة");
    } finally {
      setDeletingCityId(null);
      closeDeleteDialog(); // close the dialog after finishing
    }
  };

  // 3) Loading / Error States
  if (isLoadingCities) return <Spinner />;
  if (error) return <ErrorFallback onRefresh={refetch} />;

  return (
    <div className="relative w-full">
      {/* If there's a deleteError, display an error message */}
      {deleteError && (
        <div className="bg-red-50 text-red-600 border border-red-300 p-3 mb-4 rounded-md">
          {deleteError}
        </div>
      )}

      {/* If there's an editError, display it */}
      {editError && (
        <div className="bg-red-50 text-red-600 border border-red-300 p-3 mb-4 rounded-md">
          {editError}
        </div>
      )}

      {/* The Table */}
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 
              uppercase tracking-wider"
            >
              الاسم
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 
              uppercase tracking-wider"
            >
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cities?.map((city) => {
            const isEditing = editingCityId === city.id;
            const isDeleting = deletingCityId === city.id;

            return (
              <tr key={city.id} className="hover:bg-gray-50">
                {/* City Name / Inline Edit */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      className="border rounded p-1 text-sm w-full"
                      type="text"
                      value={editCityName}
                      onChange={(e) => setEditCityName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      {city.name}
                    </div>
                  )}
                </td>
                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        {/* Save button */}
                        <button
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleSaveEdit(city.id)}
                          title="حفظ"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        {/* Cancel button */}
                        <button
                          className="text-red-600 hover:text-red-700"
                          onClick={handleCancelEdit}
                          title="إلغاء"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Edit button */}
                        <button
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEdit(city.id, city.name)}
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete button uses the new dialog approach */}
                        <button
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(city.id)}
                          disabled={isDeleting}
                          title="حذف"
                        >
                          {isDeleting ? (
                            <Spinner text="جارٍ الحذف..." className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* -- Delete Confirmation Dialog -- */}
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
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          {/* Centered Dialog Panel */}
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
              <Dialog.Panel
                className="
                  w-full max-w-md p-6 overflow-hidden 
                  text-right align-middle transition-all transform 
                  bg-white shadow-xl rounded-2xl
                "
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  تأكيد الحذف
                </Dialog.Title>
                <div className="text-gray-700 mb-6">
                  هل أنت متأكد أنك تريد حذف هذه المدينة؟ لا يمكن التراجع عن
                  هذا القرار.
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 
                      rounded-md hover:bg-gray-200 transition-colors"
                    onClick={closeDeleteDialog}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white 
                      rounded-md hover:bg-red-700 transition-colors"
                  >
                    تأكيد الحذف
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      {/* -- End Delete Confirmation Dialog -- */}
    </div>
  );
}
