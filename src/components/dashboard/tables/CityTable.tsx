"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { useCity } from "@/lib/hooks/useCity";
import { cityApi } from "@/api/cityApi";
import { DataTable } from '@/components/ui/data-table/DataTable';
import { toast } from 'react-toastify';
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

export default function CityTable() {
  const { cities, isLoading, error, refetch } = useCity();

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // Delete Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleEdit = (city: any) => {
    setEditingId(city.id);
    setEditName(city.name);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await cityApi.updateCity(id, { name: editName });
      refetch();
      setEditingId(null);
      setEditName("");
      toast.success("تم تحديث المدينة بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث المدينة");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const openDeleteDialog = (id: number) => {
    setPendingDeleteId(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setDeletingId(pendingDeleteId);
      await cityApi.deleteCity(pendingDeleteId);
      refetch();
      toast.success("تم حذف المدينة بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف المدينة");
      console.error(error);
    } finally {
      setDeletingId(null);
      setIsDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  const columns = [
    {
      header: "الاسم",
      accessorKey: "name",
      cell: (row: any) => (
        editingId === row.id ? (
          <input
            className="border rounded p-1 text-sm w-full"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
        ) : (
          <div className="text-sm font-medium text-gray-900">{row.name}</div>
        )
      )
    }
  ];

  const actions = [
    {
      icon: editingId ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />,
      label: editingId ? "حفظ" : "تعديل",
      onClick: (row: any) => editingId ? handleSaveEdit(row.id) : handleEdit(row),
      color: editingId ? "text-green-600" : "text-blue-600",
    },
    {
      icon: editingId ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />,
      label: editingId ? "إلغاء" : "حذف",
      onClick: (row: any) => editingId ? handleCancelEdit() : openDeleteDialog(row.id),
      color: "text-red-600",
      show: (row: any) => !deletingId || deletingId !== row.id,
    }
  ];

  return (
    <div className="relative w-full" dir="rtl">
      <DataTable
        data={cities || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
      />

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذه المدينة؟ لا يمكن التراجع عن هذا القرار."
      />
    </div>
  );
}
