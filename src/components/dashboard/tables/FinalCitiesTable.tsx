"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Check, X, CheckSquare, Square } from "lucide-react";
import { useNeighborhood } from "@/lib/hooks/useNeighborhood";
import { DataTable } from '@/components/ui/data-table/DataTable';
import { toast } from 'react-toastify';
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useSelectionManager } from "@/lib/hooks/useSelectionManager";
import { BulkActionsBar } from "../BulkActionsBar";
import { BulkDeleteDialog } from "../BulkDeleteDialog";
import { useFinalCities } from "@/lib/hooks/useFinalCity";
import { finalCityApi } from "@/api/finalCityApi";
import { FinalCityType, NeighborhoodType } from "@/lib/types";

export default function FinalCityTable() {
  const { finalCities, isLoading, error, refetch } = useFinalCities();
  const { neighborhoods } = useNeighborhood();

  const selection = useSelectionManager({
    items: finalCities,
    idExtractor: (nb) => nb.id
  });

  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCityId, setEditCityId] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getNeighborhoodName = (neighborhoodId: number) => {
    const neighborhood = neighborhoods?.find((c) => c.id === neighborhoodId);
    return neighborhood ? neighborhood.name : "غير معروف";
  };

  const handleEdit = (nb: FinalCityType) => {
    setEditingId(nb.id);
    setEditName(nb.name);
    setEditCityId(nb.neighborhoodId);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      if (editName.trim() === "" || !editCityId) {
        toast.error("الرجاء ملء كافة الحقول");
        return;
      }

      await finalCityApi.updagteFinalCity(id, {
        name: editName,
        neighborhoodId: editCityId,
      });

      refetch();
      setEditingId(null);
      setEditName("");
      setEditCityId(null);
      toast.success("تم تحديث الحي بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الحي");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCityId(null);
  };

  const openDeleteDialog = (id: number) => {
    setPendingDeleteId(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setDeletingId(pendingDeleteId);
      await finalCityApi.deleteFinalCity(pendingDeleteId);
      refetch();
      toast.success("تم حذف الحي بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الحي");
      console.error(error);
    } finally {
      setDeletingId(null);
      setIsDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selection.selectedIds.length === 0) return;

    selection.setIsBulkDeleting(true);

    try {
      for (const id of selection.selectedIds) {
        await finalCityApi.deleteFinalCity(id);
      }

      refetch();
      selection.clearSelection();
      toast.success(`تم حذف ${selection.selectedIds.length} مدينة بنجاح`);
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف المدن المحددة");
      console.error(error);
    } finally {
      selection.setIsBulkDeleting(false);
      setIsBulkDeleteDialogOpen(false);
    }
  };

  const columns = [
    {
      header: () => (
        <div className="flex items-center">
          <button
            onClick={selection.toggleSelectAll}
            className="mr-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            {finalCities && selection.isAllSelected ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <span>تحديد</span>
        </div>
      ),
      accessorKey: "selection",
      cell: (row: FinalCityType) => (
        <button
          onClick={() => selection.toggleSelectItem(row.id)}
          className="text-gray-500 hover:text-blue-600 transition-colors"
          disabled={editingId === row.id || deletingId === row.id}
        >
          {selection.isSelected(row.id) ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
      )
    },
    {
      header: "الحي",
      accessorKey: "name",
      cell: (row: FinalCityType) => (
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
    },
    {
      header: "المدينة",
      accessorKey: "neighborhoodId",
      cell: (row: FinalCityType) => (
        editingId === row.id ? (
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={editCityId || ""}
            onChange={(e) => setEditCityId(Number(e.target.value))}
          >
            <option value="">اختر المحافظة</option>
            {neighborhoods?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-gray-500">
            {getNeighborhoodName(row.neighborhoodId)}
          </div>
        )
      )
    }
  ];

  const actions = [
    {
      icon: editingId ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />,
      label: editingId ? "حفظ" : "تعديل",
      onClick: (row: FinalCityType) =>
        editingId === row.id ? handleSaveEdit(row.id) : handleEdit(row),
      color: editingId ? "text-green-600" : "text-blue-600",
    },
    {
      icon: editingId ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />,
      label: editingId ? "إلغاء" : "حذف",
      onClick: (row: FinalCityType) =>
        editingId === row.id ? handleCancelEdit() : openDeleteDialog(row.id),
      color: "text-red-600",
      show: (row: FinalCityType) => !deletingId || deletingId !== row.id,
    }
  ];

  return (
    <div className="relative w-full" dir="rtl">
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selection.selectedIds.length}
        onClearSelection={selection.clearSelection}
        onDelete={() => setIsBulkDeleteDialogOpen(true)}
        isDeleting={selection.isBulkDeleting}
        itemName={{ singular: "حي", plural: "مدن" }}
      />

      <DataTable
        data={finalCities || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        rowClassName={(row) => selection.isSelected(row.id) ? "bg-blue-50" : ""}
      />

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا الحي؟ لا يمكن التراجع عن هذا القرار."
      />

      <BulkDeleteDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        isDeleting={selection.isBulkDeleting}
        count={selection.selectedIds.length}
        itemName={{ singular: "حي", plural: "مدن" }}
      />
    </div>
  );
}