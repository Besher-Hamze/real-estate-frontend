"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { DataTable } from '@/components/ui/data-table/DataTable';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { MainType, SubType } from "@/lib/types";
import { subMainTypeApi } from "@/api/subMainTypeApi";
import { toast } from "react-toastify";

interface SubTypeTableProps {
  mainTypes: MainType[] | undefined;
  isLoading: boolean;
  onRefetch: () => void;
}

export default function SubTypeTable({ 
  mainTypes, 
  isLoading, 
  onRefetch 
}: SubTypeTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editMainId, setEditMainId] = useState<number | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const allSubTypes: Array<{ main: MainType; sub: SubType }> = mainTypes?.flatMap((main) =>
    main.subtypes.map((sub) => ({ main, sub }))
  ) || [];

  const handleEdit = (mainType: MainType, subType: SubType) => {
    setEditingId(subType.id);
    setEditName(subType.name);
    setEditMainId(mainType.id);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim() || !editMainId) {
      toast.error("الرجاء إدخال الاسم واختيار التصنيف الرئيسي");
      return;
    }

    try {
      await subMainTypeApi.updateSubMainType(id, {
        name: editName,
        mainId: editMainId,
      });
      onRefetch();
      setEditingId(null);
      setEditName("");
      setEditMainId(null);
      toast.success("تم تحديث التصنيف الفرعي بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث التصنيف الفرعي");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditMainId(null);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setDeletingId(pendingDeleteId);
      await subMainTypeApi.deleteSubMainType(pendingDeleteId);
      onRefetch();
      toast.success("تم حذف التصنيف الفرعي بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف التصنيف الفرعي");
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
      accessorKey: "sub.name",
      cell: (row: { main: MainType; sub: SubType }) => (
        editingId === row.sub.id ? (
          <input
            className="border rounded p-1 text-sm w-full"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
        ) : (
          <div className="text-sm font-medium text-gray-900">
            {row.sub.name}
          </div>
        )
      )
    },
    {
      header: "التصنيف الرئيسي",
      accessorKey: "main.name",
      cell: (row: { main: MainType; sub: SubType }) => (
        editingId === row.sub.id ? (
          <select
            className="border rounded p-1 text-sm w-full"
            value={editMainId ?? ""}
            onChange={(e) => setEditMainId(Number(e.target.value))}
          >
            <option value="">اختر التصنيف الرئيسي</option>
            {mainTypes?.map((mt) => (
              <option key={mt.id} value={mt.id}>
                {mt.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-gray-500">{row.main.name}</div>
        )
      )
    }
  ];

  const actions = [
    {
      icon: editingId ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />,
      label: editingId ? "حفظ" : "تعديل",
      onClick: (row: { main: MainType; sub: SubType }) => 
        editingId ? handleSaveEdit(row.sub.id) : handleEdit(row.main, row.sub),
      color: editingId ? "text-green-600" : "text-blue-600",
      show: (row: { main: MainType; sub: SubType }) => 
        editingId === null || editingId === row.sub.id
    },
    {
      icon: editingId ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />,
      label: editingId ? "إلغاء" : "حذف",
      onClick: (row: { main: MainType; sub: SubType }) => 
        editingId ? handleCancelEdit() : (() => {
          setPendingDeleteId(row.sub.id);
          setIsDeleteDialogOpen(true);
        })(),
      color: "text-red-600",
      show: (row: { main: MainType; sub: SubType }) => {
        if (deletingId === row.sub.id) return false;
        return editingId === null || editingId === row.sub.id;
      }
    }
  ];

  return (
    <div className="relative w-full" dir="rtl">
      <DataTable
        data={allSubTypes}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا التصنيف الفرعي؟ لا يمكن التراجع عن هذا القرار."
      />
    </div>
  );
}