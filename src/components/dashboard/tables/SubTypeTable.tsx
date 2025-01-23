"use client";

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Edit2, Trash2, Check, X } from "lucide-react";

import { MainType, SubType } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";
import { subMainTypeApi } from "@/api/subMainTypeApi";
import { useQueryClient } from "@tanstack/react-query";
import { subTypesQuery } from "@/lib/constants/queryNames";

// If you want a refetch or error fallback from a custom hook, 
// you can pass them as props or get them from a parent.

type Props = {
  mainTypes: MainType[] | undefined;
  isLoading: boolean;
  onRefetch: () => void;
};

export default function SubTypeTable({ mainTypes, isLoading ,onRefetch}: Props) {
  // 1) State for inline editing
  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editMainId, setEditMainId] = useState<number | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // 2) State for deletion
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 3) Headless UI Dialog for deletion
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  if (isLoading) return <Spinner />;
  if (!mainTypes) return null;

  // Flatten the subtypes for rendering. Each row in the table represents one SubType,
  // but we also need access to its parent MainType for display.
  const allSubTypes: Array<{ main: MainType; sub: SubType }> = mainTypes.flatMap((main) =>
    main.subtypes.map((sub) => ({ main, sub }))
  );

  // ---------------------------
  // EDIT Logic
  // ---------------------------
  const handleEdit = (main: MainType, sub: SubType) => {
    setEditingSubId(sub.id);
    setEditName(sub.name);
    setEditMainId(main.id);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingSubId(null);
    setEditName("");
    setEditMainId(null);
    setEditError(null);
  };


  const handleSaveEdit = async (subId: number) => {
    if (!editName.trim() || !editMainId) {
      setEditError("الرجاء إدخال الاسم واختيار التصنيف الرئيسي");
      return;
    }

    try {
      await subMainTypeApi.updateSubMainType(subId, {
        name: editName,
        mainId: editMainId,
      });
   
      // Optionally refetch or trigger onRefetch()
      onRefetch();

      // Exit edit mode
      setEditingSubId(null);
      setEditName("");
      setEditMainId(null);
    } catch (err) {
      console.error(err);
      setEditError("حدث خطأ أثناء تحديث التصنيف الفرعي");
    }
  };

  // ---------------------------
  // DELETE Logic w/ Dialog
  // ---------------------------
  const openDeleteDialog = (subId: number) => {
    setPendingDeleteId(subId);
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

      await subMainTypeApi.deleteSubMainType(pendingDeleteId);

      // Optionally refetch or trigger onRefetch()
      onRefetch();
    } catch (err) {
      console.error(err);
      setDeleteError("حدث خطأ أثناء حذف التصنيف الفرعي");
    } finally {
      setDeletingId(null);
      closeDeleteDialog();
    }
  };

  return (
    <div className="relative w-full" dir="rtl">
      {/* Error messages for editing or deleting */}
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
              التصنيف الرئيسي
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
          {allSubTypes.map(({ main, sub }) => {
            const isEditing = editingSubId === sub.id;
            const isDeleting = deletingId === sub.id;

            return (
              <tr key={sub.id} className="hover:bg-gray-50">
                {/* subType name (inline edit if editing) */}
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
                    <div className="text-sm font-medium text-gray-900">{sub.name}</div>
                  )}
                </td>

                {/* mainType name (inline edit if editing => select) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <select
                      className="border rounded p-1 text-sm w-full"
                      value={editMainId ?? ""}
                      onChange={(e) => setEditMainId(Number(e.target.value))}
                    >
                      <option value="">اختر التصنيف الرئيسي</option>
                      {mainTypes.map((mt) => (
                        <option key={mt.id} value={mt.id}>
                          {mt.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500">{main.name}</div>
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
                          onClick={() => handleSaveEdit(sub.id)}
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
                          onClick={() => handleEdit(main, sub)}
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete button => open dialog */}
                        <button
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(sub.id)}
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
 * Delete confirmation dialog using Headless UI
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
                هل أنت متأكد أنك تريد حذف هذا التصنيف الفرعي؟
                لا يمكن التراجع عن هذا القرار.
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
