// pages/main-types/MainTypeTable.tsx
"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { DataTable } from '@/components/ui/data-table/DataTable';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { MainType } from "@/lib/types";
import { mainTypeApi } from "@/api/mainTypeApi";
import { toast } from "react-toastify";

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
  const [editIcon, setEditIcon] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleEdit = (type: MainType) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditIcon(type.icon);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await mainTypeApi.updateMainType(id, {
        name: editName,
      });
      onRefetch();
      setEditingId(null);
      setEditName("");
      setEditIcon("");
      toast.success("تم تحديث التصنيف بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث التصنيف الرئيسي");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
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
        <div className="text-sm text-gray-500">{row.icon}</div>
      )
    }
  ];

  const actions = [
    {
      icon: editingId ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />,
      label: editingId ? "حفظ" : "تعديل",
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
        if (deletingId === row.id) return false;
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