"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Check, X, CheckSquare, Square } from "lucide-react";
import { useCity } from "@/lib/hooks/useCity";
import { cityApi } from "@/api/cityApi";
import { DataTable } from '@/components/ui/data-table/DataTable';
import { toast } from 'react-toastify';
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

import { useSelectionManager } from "@/lib/hooks/useSelectionManager";
import { BulkActionsBar } from "../BulkActionsBar";
import { BulkDeleteDialog } from "../BulkDeleteDialog";

export default function CityTable() {
  const { cities, isLoading, error, refetch } = useCity();

  const selection = useSelectionManager({
    items: cities,
    idExtractor: (city) => city.id
  });

  // Bulk delete dialog state
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

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

  // Single delete handlers
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

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selection.selectedIds.length === 0) return;

    selection.setIsBulkDeleting(true);

    try {
      // Delete all selected cities one by one
      for (const id of selection.selectedIds) {
        await cityApi.deleteCity(id);
      }

      // Refetch after deletion
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

  // Add selection column
  const columns = [
    {
      header: () => (
        <div className="flex items-center">
          <button
            onClick={selection.toggleSelectAll}
            className="mr-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            {cities && selection.isAllSelected ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <span>تحديد</span>
        </div>
      ),
      accessorKey: "selection",
      cell: (row: any) => (
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
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selection.selectedIds.length}
        onClearSelection={selection.clearSelection}
        onDelete={() => setIsBulkDeleteDialogOpen(true)}
        isDeleting={selection.isBulkDeleting}
        itemName={{ singular: "مدينة", plural: "مدن" }}
      />

      <DataTable
        data={cities || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        rowClassName={(row) => selection.isSelected(row.id) ? "bg-blue-50" : ""}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذه المدينة؟ لا يمكن التراجع عن هذا القرار."
      />

      <BulkDeleteDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        isDeleting={selection.isBulkDeleting}
        count={selection.selectedIds.length}
        itemName={{ singular: "مدينة", plural: "مدن" }}
      />
    </div>
  );
}