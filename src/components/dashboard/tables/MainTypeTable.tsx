"use client";

import React, { useState, useRef } from "react";
import { Edit2, Trash2, Check, X, Upload } from "lucide-react";
import { DataTable } from '@/components/ui/data-table/DataTable';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { MainType } from "@/lib/types";
import { mainTypeApi } from "@/api/mainTypeApi";
import { toast } from "react-toastify";
import Image from "next/image";

interface MainTypeTableProps {
  mainTypes: MainType[] | undefined;
  isLoading: boolean;
  onRefetch: () => void;
}

export default function MainTypeTable({
  mainTypes,
  isLoading,
  onRefetch
}: MainTypeTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState<string | File>("");
  const [newIconFile, setNewIconFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (type: MainType) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditIcon(type.icon || "");
    setNewIconFile(null);
  };

  const handleIconClick = () => {
    if (editingId && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewIconFile(file);
      setEditIcon(file);
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Prepare the update object
      const updateData: any = {
        name: editName,
      };

      // If there's a new icon file, add it
      if (newIconFile) {
        updateData.icon = newIconFile;
      } else if (typeof editIcon === 'string') {
        updateData.icon = editIcon;
      }

      await mainTypeApi.updateMainType(id, updateData);
      onRefetch();
      resetEditState();
      toast.success("تم تحديث التصنيف بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث التصنيف الرئيسي");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEditState = () => {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
    setNewIconFile(null);
  };

  const handleCancelEdit = () => {
    resetEditState();
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setDeletingId(pendingDeleteId);
      await mainTypeApi.deleteMainType(pendingDeleteId);
      onRefetch();
      toast.success("تم حذف التصنيف بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف التصنيف الرئيسي");
      console.error(error);
    } finally {
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  const columns = [
    {
      header: "الاسم",
      accessorKey: "name",
      cell: (row: MainType) => (
        editingId === row.id ? (
          <input
            className="border rounded p-1 text-sm w-full"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
        ) : (
          <div className="text-sm font-medium text-gray-900">
            {row.name}
          </div>
        )
      )
    },
    {
      header: "الأيقونة",
      accessorKey: "icon",
      cell: (row: MainType) => (
        <div className="text-sm text-gray-500">
          {editingId === row.id ? (
            <div className="flex items-center space-x-2 space-x-reverse">
              <div
                className="cursor-pointer relative w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                onClick={handleIconClick}
              >
                {newIconFile ? (
                  <img
                    src={URL.createObjectURL(newIconFile)}
                    alt="New Icon Preview"
                    className="w-full h-full object-contain rounded-md"
                  />
                ) : row.icon ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${row.icon}`}
                    alt={row.name}
                    className="w-full h-full object-contain rounded-md"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="hidden"
                />
              </div>
              <span className="text-xs text-blue-600">اضغط لتغيير الأيقونة</span>
            </div>
          ) : (
            row.icon ? (
              <div className="w-12 h-12 relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${row.icon}`}
                  alt={row.name}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
            ) : (
              <span className="text-gray-400">لا توجد أيقونة</span>
            )
          )}
        </div>
      )
    }
  ];

  const actions = [
    {
      icon: editingId ? (
        isSubmitting ? (
          <div className="w-4 h-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )
      ) : (
        <Edit2 className="w-4 h-4" />
      ),
      label: editingId ? (isSubmitting ? "جاري الحفظ..." : "حفظ") : "تعديل",
      onClick: (row: MainType) => editingId ? handleSaveEdit(row.id) : handleEdit(row),
      color: editingId ? "text-green-600" : "text-blue-600",
      show: (row: MainType) => editingId === null || editingId === row.id
    },
    {
      icon: editingId ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />,
      label: editingId ? "إلغاء" : "حذف",
      onClick: (row: MainType) => editingId ? handleCancelEdit() : (() => {
        setPendingDeleteId(row.id);
        setIsDeleteDialogOpen(true);
      })(),
      color: "text-red-600",
      show: (row: MainType) => {
        if (deletingId === row.id || isSubmitting) return false;
        return editingId === null || editingId === row.id;
      }
    }
  ];

  return (
    <div className="relative w-full" dir="rtl">
      <DataTable
        data={mainTypes || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا التصنيف الرئيسي؟ لا يمكن التراجع عن هذا القرار."
      />
    </div>
  );
}