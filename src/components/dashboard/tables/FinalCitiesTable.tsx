"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Check, X, CheckSquare, Square, MapPin } from "lucide-react";
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
import LocationPicker from "@/components/map/LocationPicker";
import { Modal } from "@/components/ui/modal/Modal";

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
  const [editLocation, setEditLocation] = useState("");
  const [manualLatitude, setManualLatitude] = useState<string>("");
  const [manualLongitude, setManualLongitude] = useState<string>("");
  const [coordinateErrors, setCoordinateErrors] = useState<{ latitude?: string, longitude?: string }>({});

  // State for location editing modal
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const getNeighborhoodName = (neighborhoodId: number) => {
    const neighborhood = neighborhoods?.find((c) => c.id === neighborhoodId);
    return neighborhood ? neighborhood.name : "غير معروف";
  };

  const handleEdit = (nb: FinalCityType) => {
    setEditingId(nb.id);
    setEditName(nb.name);
    setEditCityId(nb.neighborhoodId);
    setEditLocation(nb.location || "");
  };

  const handleSaveEdit = async (id: number) => {
    try {
      if (editName.trim() === "" || !editCityId) {
        toast.error("الرجاء ملء كافة الحقول");
        return;
      }

      setUpdatingId(id);

      await finalCityApi.updagteFinalCity(id, {
        name: editName,
        neighborhoodId: editCityId,
        location: editLocation
      });

      refetch();
      setEditingId(null);
      setEditName("");
      setEditCityId(null);
      setEditLocation("");
      toast.success("تم تحديث المنطقة بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث المنطقة");
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCityId(null);
    setEditLocation("");
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
      toast.success("تم حذف المنطقة بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف المنطقة");
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

  // Open location modal
  const openLocationModal = (item: FinalCityType) => {
    setEditingItemId(item.id);
    setEditLocation(item.location || "");

    // Extract coordinates for the manual inputs
    if (item.location) {
      const [lat, lng] = item.location.split(",");
      setManualLatitude(lat || "");
      setManualLongitude(lng || "");
    } else {
      setManualLatitude("");
      setManualLongitude("");
    }

    setCoordinateErrors({});
    setIsLocationModalOpen(true);
  };


  // Handle location selection
  const handleLocationSelect = (latitude: number, longitude: number) => {
    setEditLocation(`${latitude},${longitude}`);
    setManualLatitude(latitude.toString());
    setManualLongitude(longitude.toString());
  };

  const updateLocationFromCoordinates = () => {
    // Reset errors
    setCoordinateErrors({});

    // Validate inputs
    let hasError = false;
    const errors: { latitude?: string, longitude?: string } = {};

    if (!manualLatitude) {
      errors.latitude = "خط العرض مطلوب";
      hasError = true;
    } else {
      const lat = parseFloat(manualLatitude);
      if (isNaN(lat)) {
        errors.latitude = "يرجى إدخال رقم صحيح";
        hasError = true;
      } else if (lat < -90 || lat > 90) {
        errors.latitude = "يجب أن تكون القيمة بين -90 و 90";
        hasError = true;
      }
    }

    if (!manualLongitude) {
      errors.longitude = "خط الطول مطلوب";
      hasError = true;
    } else {
      const lng = parseFloat(manualLongitude);
      if (isNaN(lng)) {
        errors.longitude = "يرجى إدخال رقم صحيح";
        hasError = true;
      } else if (lng < -180 || lng > 180) {
        errors.longitude = "يجب أن تكون القيمة بين -180 و 180";
        hasError = true;
      }
    }

    if (hasError) {
      setCoordinateErrors(errors);
      return;
    }

    // Update location
    setEditLocation(`${parseFloat(manualLatitude)},${parseFloat(manualLongitude)}`);
    toast.success("تم تحديث الموقع على الخريطة");
  };



  // Save location changes
  const saveLocationChanges = async () => {
    if (!editingItemId) return;

    try {
      setUpdatingId(editingItemId);

      const itemToUpdate = finalCities?.find(item => item.id === editingItemId);
      if (!itemToUpdate) return;

      await finalCityApi.updagteFinalCity(editingItemId, {
        name: itemToUpdate.name,
        neighborhoodId: itemToUpdate.neighborhoodId,
        location: editLocation
      });

      refetch();
      toast.success("تم تحديث الموقع بنجاح");
      setIsLocationModalOpen(false);
      setEditingItemId(null);
      setEditLocation("");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الموقع");
      console.error(error);
    } finally {
      setUpdatingId(null);
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
      header: "المنطقة",
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
    },
    {
      header: "الإحداثيات",
      accessorKey: "location",
      cell: (row: FinalCityType) => (
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 ml-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
            onClick={() => openLocationModal(row)}
            type="button"
            disabled={editingId !== null && editingId !== row.id}
            title="تغيير الإحداثيات"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-medium">تغيير الإحداثيات</span>
          </button>
        </div>
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
      show: (row: any) =>
        editingId === null || editingId === row.id

    },
    {
      icon: editingId ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />,
      label: editingId ? "إلغاء" : "حذف",
      onClick: (row: FinalCityType) =>
        editingId === row.id ? handleCancelEdit() : openDeleteDialog(row.id),
      color: "text-red-600",
      show: (row: any) =>
        editingId === null || editingId === row.id

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

      {/* Location Picker Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="تحديد الموقع على الخريطة"
      >
        <div className="p-4">
          {/* Manual coordinate inputs */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  خط العرض (Latitude)
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border ${coordinateErrors.latitude ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                  placeholder="مثال: 23.5880"
                  value={manualLatitude}
                  onChange={(e) => setManualLatitude(e.target.value)}
                />
                {coordinateErrors.latitude && (
                  <p className="text-red-500 text-xs mt-1">{coordinateErrors.latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  خط الطول (Longitude)
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border ${coordinateErrors.longitude ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                  placeholder="مثال: 58.4059"
                  value={manualLongitude}
                  onChange={(e) => setManualLongitude(e.target.value) }
                />
                {coordinateErrors.longitude && (
                  <p className="text-red-500 text-xs mt-1">{coordinateErrors.longitude}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              onClick={updateLocationFromCoordinates}
            >
              <MapPin className="w-4 h-4" />
              تحديث الموقع على الخريطة
            </button>
          </div>

          <LocationPicker
            key={`location-${editLocation}`}
            initialLatitude={
              editLocation
                ? parseFloat(editLocation.split(",")[0])
                : undefined
            }
            initialLongitude={
              editLocation
                ? parseFloat(editLocation.split(",")[1])
                : undefined
            }
            onLocationSelect={handleLocationSelect}
          />

          <div className="mt-6 flex justify-between">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              onClick={() => setIsLocationModalOpen(false)}
            >
              إلغاء
            </button>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              onClick={saveLocationChanges}
              disabled={updatingId !== null}
            >
              {updatingId !== null ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>حفظ الموقع</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>


      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا المنطقة؟ لا يمكن التراجع عن هذا القرار."
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