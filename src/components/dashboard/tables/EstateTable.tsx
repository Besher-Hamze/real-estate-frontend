"use client";

import React, { useState, useEffect, useRef } from "react";
import { Edit2, Eye, Trash2, X, CheckSquare, Square, QrCode } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { estateQuery } from "@/lib/constants/queryNames";
import { toast } from "react-toastify";
import { RealEstateApi } from "@/api/realEstateApi";
import { MainType, RealEstateData } from "@/lib/types";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import QRCode from 'qrcode';

import { useSelectionManager } from "@/lib/hooks/useSelectionManager";
import { BulkActionsBar } from "../BulkActionsBar";
import { BulkDeleteDialog } from "../BulkDeleteDialog";

interface EstateTableProps {
  realEstateData: RealEstateData[] | undefined;
  isLoading: boolean;
  mainTypes: MainType[] | undefined;
}

export default function EstateTable({ realEstateData, isLoading, mainTypes }: EstateTableProps) {
  const router = useRouter();

  // Use the selection manager hook
  const selection = useSelectionManager({
    items: realEstateData,
    idExtractor: (estate) => estate.id
  });

  const [selectedProperty, setSelectedProperty] = useState<RealEstateData | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Bulk delete dialog state
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const client = useQueryClient();

  const handleGenerateQR = (property: RealEstateData) => {
    setSelectedProperty(property);
    setShowQRModal(true);
  };

  // Reset QR when modal closes
  useEffect(() => {
    if (!showQRModal) {
      setQrGenerated(false);
    }
  }, [showQRModal]);

  const handleDownloadQR = () => {
    if (qrCanvasRef.current && selectedProperty) {
      const link = document.createElement('a');
      link.download = `property-${selectedProperty.id}-qr.png`;
      link.href = qrCanvasRef.current.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const generateQR = async () => {
      if (showQRModal && selectedProperty && qrCanvasRef.current && !qrGenerated) {
        const url = `${process.env.NEXT_PUBLIC_FRONTEND}/properties/${selectedProperty.id}`;
        await QRCode.toCanvas(qrCanvasRef.current, url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000',
            light: '#fff'
          }
        });
        setQrGenerated(true);
      }
    };

    generateQR();
  }, [showQRModal, selectedProperty]);

  // Navigate to edit page
  const handleEdit = (property: RealEstateData) => {
    router.push(`/dashboard/real-estate/create?id=${property.id}`);
  };

  // View property details
  const handleView = (property: RealEstateData) => {
    router.push(`/properties/${property.id}`);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await RealEstateApi.deleteRealEstate(deletingId);
      const realEstate = realEstateData?.find(r => r.id === deletingId);
      toast.success("تم الحذف بنجاح");
      if (realEstate && realEstate.buildingItemId) {
        client.invalidateQueries({ queryKey: ['buildings'] });
        client.invalidateQueries({ queryKey: ['realEstate', 'building', realEstate.buildingItemId] });
      }
      client.invalidateQueries({ queryKey: [estateQuery] });
    } catch (error) {
      toast.error("خطأ أثناء حذف العقار");
      console.error(error);
    } finally {
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selection.selectedIds.length === 0) return;

    selection.setIsBulkDeleting(true);

    try {
      // Delete all selected properties one by one
      for (const id of selection.selectedIds) {
        await RealEstateApi.deleteRealEstate(id);
      }

      // Refetch after deletion
      client.invalidateQueries({ queryKey: [estateQuery] });
      selection.clearSelection();
      toast.success(`تم حذف ${selection.selectedIds.length} عقار بنجاح`);
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الإعلانات المحددة");
      console.error(error);
    } finally {
      selection.setIsBulkDeleting(false);
      setIsBulkDeleteDialogOpen(false);
    }
  };

  const columns = [
    // Selection column
    {
      header: () => (
        <div className="flex items-center">
          <button
            onClick={selection.toggleSelectAll}
            className="mr-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            {realEstateData && selection.isAllSelected ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <span>تحديد</span>
        </div>
      ),
      accessorKey: "selection",
      cell: (row: RealEstateData) => (
        <button
          onClick={() => selection.toggleSelectItem(row.id)}
          className="text-gray-500 hover:text-blue-600 transition-colors"
          disabled={deletingId === row.id}
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
      header: "العنوان",
      accessorKey: "title",
      cell: (row: RealEstateData) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            {row.coverImage ? (
              <Image
                src={`${row.coverImage}`}
                alt={row.title}
                width={40}
                height={40}
                className="rounded-md object-cover max-w-[40px] max-h-[40px]"
              />
            ) : (
              <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                <span className="text-xs text-gray-500">لا توجد صورة</span>
              </div>
            )}
          </div>
          <div className="mr-4">
            <div className="text-sm font-medium text-gray-900">{row.title}</div>
          </div>
        </div>
      )
    },
    {
      header: "السعر",
      accessorKey: "price",
      cell: (row: RealEstateData) => (
        <div className="text-sm font-medium text-blue-600">
          {row.price.toLocaleString()} ر.ع
        </div>
      )
    },
    {
      header: "المحافظة",
      accessorKey: "cityName",
      cell: (row: RealEstateData) => (
        <>
          <div className="text-sm text-gray-900">{row.cityName}</div>
          <div className="text-sm text-gray-500">{row.neighborhoodName}</div>
          <div className="text-sm text-gray-500">{row.finalCityName}</div>
        </>
      )
    },
    {
      header: "التصنيف",
      accessorKey: "mainCategoryId",
      cell: (row: RealEstateData) => (
        <>
          <div className="text-sm text-gray-900">{row.mainCategoryName}</div>
          <div className="text-sm text-gray-500">{row.subCategoryName}</div>
          <div className="text-sm text-gray-500">{row.finalTypeName}</div>
        </>
      )
    },
    {
      header: "تاريخ الإنشاء",
      accessorKey: "createdAt",
      cell: (row: RealEstateData) => (
        <div className="text-sm text-gray-500">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )
    }
  ];

  const actions = [
    {
      icon: <Eye className="w-4 h-4" />,
      label: "عرض",
      onClick: handleView,
      color: "text-green-600"
    },
    {
      icon: <QrCode className="w-4 h-4" />,
      label: "عرض QR",
      onClick: handleGenerateQR,
      color: "text-purple-600"
    },
    {
      icon: <Edit2 className="w-4 h-4" />,
      label: "تعديل",
      onClick: handleEdit,
      color: "text-blue-600"
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: "حذف",
      onClick: (row: RealEstateData) => {
        setDeletingId(row.id);
        setIsDeleteDialogOpen(true);
      },
      color: "text-red-600"
    },
  ];

  return (
    <div className="relative w-full" dir="rtl">
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selection.selectedIds.length}
        onClearSelection={selection.clearSelection}
        onDelete={() => setIsBulkDeleteDialogOpen(true)}
        isDeleting={selection.isBulkDeleting}
        itemName={{ singular: "عقار", plural: "عقارات" }}
      />

      {/* Data Table */}
      <DataTable
        data={realEstateData || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        rowClassName={(row) => selection.isSelected(row.id) ? "bg-blue-50" : ""}
        emptyState={{
          title: "لا توجد عقارات",
          description: "لم يتم العثور على أي عقارات. ابدأ بإضافة عقار جديد.",
          action: {
            label: "إضافة عقار جديد",
            onClick: () => router.push('/dashboard/real-estate/create')
          }
        }}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا العقار؟ لا يمكن التراجع عن هذا القرار."
        confirmText="حذف"
        cancelText="إلغاء"
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        isDeleting={selection.isBulkDeleting}
        count={selection.selectedIds.length}
        itemName={{ singular: "عقار", plural: "عقارات" }}
      />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => {
              setShowQRModal(false);
              setSelectedProperty(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedProperty(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-6 h-6 text-purple-600" />
                </div>

                <h2 className="text-xl font-semibold mb-2 text-gray-900">رمز QR للعقار</h2>
                <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                  {selectedProperty.title}
                </p>

                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <canvas
                      ref={qrCanvasRef}
                      className="border border-gray-200 rounded-md"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-6">
                  امسح الرمز للوصول إلى صفحة العقار مباشرة
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDownloadQR}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    تحميل الرمز
                  </button>

                  <button
                    onClick={() => handleView(selectedProperty)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    عرض العقار
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}