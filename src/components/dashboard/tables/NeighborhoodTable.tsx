"use client";

import React, { useState, Fragment } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

import { useNeighborhood } from "@/lib/hooks/useNeighborhood";
import { neighborhoodApi } from "@/api/NeighborhoodApi";
import Spinner from "@/components/ui/Spinner";
import ErrorFallback from "@/components/ui/ErrorFallback";
import { NeighborhoodType } from "@/lib/types"; // Adjust import to match your project

export default function NeighborhoodTable() {
  const { neighborhoods, isLoading, error, refetch } = useNeighborhood();

  // Inline edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCityId, setEditCityId] = useState<number | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete states
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Dialog for deletion
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // 1) Inline Edit Handlers
  const handleEdit = (nb: NeighborhoodType) => {
    setEditingId(nb.id);
    setEditName(nb.name);
    setEditCityId(nb.cityId); // or city_id if you use that property
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCityId(null);
    setEditError(null);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      if (editName.trim() === "" || editCityId === null) {
        setEditError("الرجاء ملء كافة الحقول");
        return;
      }

      // Payload for update
      await neighborhoodApi.updagteNeighborhood(id, {
        name: editName,
        // cityId: editCityId,
      });

      // Refetch after successful update
      refetch();

      // Exit edit mode
      setEditingId(null);
      setEditName("");
      setEditCityId(null);
    } catch (err) {
      console.error(err);
      setEditError("حدث خطأ أثناء تحديث الحي");
    }
  };

  // 2) Delete Handlers using Dialog
  const openDeleteDialog = (id: number) => {
    setPendingDeleteId(id);
    setIsDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setPendingDeleteId(null);
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setDeletingId(pendingDeleteId);
      setDeleteError(null);

      await neighborhoodApi.deleteNeighborhood(pendingDeleteId);

      // Refetch after deletion
      refetch();
    } catch (err) {
      console.error(err);
      setDeleteError("حدث خطأ أثناء حذف الحي");
    } finally {
      setDeletingId(null);
      closeDeleteDialog();
    }
  };

  // 3) Loading / Error Fallback
  if (isLoading) return <Spinner />;
  if (error) return <ErrorFallback onRefresh={refetch} />;

  return (
    <div className="relative w-full" dir="rtl">
      {/* Display errors */}
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

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 
              uppercase tracking-wider"
            >
              الحي
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 
              uppercase tracking-wider"
            >
              المدينة
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
          {neighborhoods?.map((nb) => {
            const isEditing = editingId === nb.id;
            const isDeleting = deletingId === nb.id;

            return (
              <tr key={nb.id} className="hover:bg-gray-50">
                {/* Neighborhood name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      className="border rounded p-1 text-sm w-full"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      {nb.name}
                    </div>
                  )}
                </td>
                {/* City Id */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    /* Simple text input for cityId 
                       (You can use a <select> if you want a city list) */
                    <input
                      type="number"
                      className="border rounded p-1 text-sm w-full"
                      value={editCityId ?? ""}
                      onChange={(e) => setEditCityId(Number(e.target.value))}
                    />
                  ) : (
                    <div className="text-sm text-gray-500">
                      {nb.cityId /* or nb.city_id if that's your actual field */}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        {/* Save */}
                        <button
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleSaveEdit(nb.id)}
                          title="حفظ"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        {/* Cancel */}
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
                        {/* Edit */}
                        <button
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEdit(nb)}
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete (Dialog) */}
                        <button
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(nb.id)}
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
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          {/* Centered Dialog */}
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
                  هل أنت متأكد أنك تريد حذف هذا الحي؟ لا يمكن التراجع عن هذا
                  القرار.
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
    </div>
  );
}
