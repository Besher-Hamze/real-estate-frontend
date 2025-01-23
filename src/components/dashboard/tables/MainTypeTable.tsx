"use client";

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Edit2, Trash2, Check, X } from "lucide-react";

import { mainTypeApi } from "@/api/mainTypeApi";
import { MainType } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";

type Props = {
  mainTypes: MainType[] | undefined;
  isLoading: boolean;
  // You might also pass a refetch callback here if needed,
  // or handle it via a custom hook. e.g. onUpdate, onDelete
  onRefetch: () => void;
};

export default function MainTypeTable({ mainTypes, isLoading , onRefetch }: Props) {
  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Deletion state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Dialog for confirming deletion
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // If data is still loading, show spinner
  if (isLoading) return <Spinner />;
  if (!mainTypes) return null; // or an empty state message

  // ---------------------------
  // EDIT LOGIC
  // ---------------------------
  const handleEdit = (type: MainType) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditIcon(type.icon);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
    setEditError(null);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await mainTypeApi.updateMainType(id, {
        name: editName,
        // icon: editIcon,
      });
      // Optionally refetch data if needed
      onRefetch(); 
      setEditingId(null);
      setEditName("");
      setEditIcon("");
    } catch (err) {
      console.error(err);
      setEditError("حدث خطأ أثناء تحديث التصنيف الرئيسي");
    }
  };

  // ---------------------------
  // DELETE LOGIC
  // ---------------------------
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

      await mainTypeApi.deleteMainType(pendingDeleteId);
      // Optionally refetch data
      onRefetch();
    } catch (err) {
      console.error(err);
      setDeleteError("حدث خطأ أثناء حذف التصنيف الرئيسي");
    } finally {
      setDeletingId(null);
      closeDeleteDialog();
    }
  };

  return (
    <div className="relative w-full" dir="rtl">
      {/* If there's an edit or delete error, show them */}
      {editError && (
        <div className="bg-red-50 text-red-600 border border-red-300 p-3 mb-4 rounded-md">
          {editError}
        </div>
      )}
      {deleteError && (
        <div className="bg-red-50 text-red-600 border border-red-300 p-3 mb-4 rounded-md">
          {deleteError}
        </div>
      )}

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
              الأيقونة
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
          {mainTypes.map((type) => {
            const isEditing = editingId === type.id;
            const isDeleting = deletingId === type.id;

            return (
              <tr key={type.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      className="border rounded p-1 text-sm w-full"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      {type.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    // Example select for icons
                    <select
                      className="border rounded p-1 text-sm w-full"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                    >
                      <option value="Building2">Building2</option>
                      <option value="Home">Home</option>
                      {/* Add more icon options if needed */}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500">{type.icon}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        {/* Save button */}
                        <button
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleSaveEdit(type.id)}
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
                          onClick={() => handleEdit(type)}
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete button with dialog */}
                        <button
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(type.id)}
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
      <DeleteDialog
        isDialogOpen={isDialogOpen}
        closeDialog={closeDeleteDialog}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}

/** 
 * A separate component for the delete confirmation dialog 
 * using Headless UI
 */
function DeleteDialog({
  isDialogOpen,
  closeDialog,
  handleConfirmDelete,
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  handleConfirmDelete: () => void;
}) {
  return (
    <Transition appear show={isDialogOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeDialog}>
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
                هل أنت متأكد أنك تريد حذف هذا التصنيف الرئيسي؟ لا يمكن التراجع
                عن هذا القرار.
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 
                    rounded-md hover:bg-gray-200 transition-colors"
                  onClick={closeDialog}
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
  );
}
