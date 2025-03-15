"use client";

import React, { useState, useEffect, useRef } from "react";
import { Edit2, Eye, Trash2, X, CheckSquare, Square, QrCode } from "lucide-react";
import Image from "next/image";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { estateQuery } from "@/lib/constants/queryNames";
import { toast } from "react-toastify";
import { RealEstateApi } from "@/api/realEstateApi";
import apiClient from "@/api";
import { finalTypeTypeApi } from "@/api/finalTypeApi";
import { CityType, FinalCityType, FinalType, MainType, NeighborhoodType, RealEstateData } from "@/lib/types";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import EditEstateForm from "../estate-components/Edit-Estate";
import QRCode from 'qrcode';

import { useSelectionManager } from "@/lib/hooks/useSelectionManager";
import { BulkActionsBar } from "../BulkActionsBar";
import { BulkDeleteDialog } from "../BulkDeleteDialog";
import { finalCityApi } from "@/api/finalCityApi";

interface EstateTableProps {
  realEstateData: RealEstateData[] | undefined;
  isLoading: boolean;
  mainTypes: MainType[] | undefined;
}

export default function EstateTable({ realEstateData, isLoading, mainTypes }: EstateTableProps) {
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

  const [editingEstate, setEditingEstate] = useState<RealEstateData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // New state for edit exit confirmation dialog
  const [isEditExitConfirmOpen, setIsEditExitConfirmOpen] = useState(false);

  const [cities, setCities] = useState<CityType[]>([]);
  const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
  const [finalCities, setFinalCities] = useState<FinalCityType[]>([]);

  const client = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

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

  // When edit modal is open, attach event listeners to detect outside clicks and Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isEditModalOpen) {
        setIsEditExitConfirmOpen(true);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isEditModalOpen
      ) {
        setIsEditExitConfirmOpen(true);
      }
    };

    if (isEditModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditModalOpen]);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/api/cities");
        setCities(response.data);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchFinalType = async () => {
      if (editingEstate?.subCategoryId) {
        try {
          const response = await finalTypeTypeApi.fetchFinalTypeBySubId(editingEstate.subCategoryId);
          setFinalTypes(response);
        } catch (error) {
          console.error("Failed to fetch final types:", error);
        }
      }
    };
    fetchFinalType();
  }, [editingEstate?.subCategoryId]);

  // Fetch neighborhoods when editingEstate changes
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (editingEstate?.cityId) {
        try {
          const response = await apiClient.get(`/api/neighborhoods/${editingEstate.cityId}`);
          setNeighborhoods(response.data);
        } catch (error) {
          console.error("Failed to fetch neighborhoods:", error);
        }
      }
    };
    fetchNeighborhoods();
  }, [editingEstate?.cityId]);

  useEffect(() => {
    const fetchFinalCities = async () => {
      if (editingEstate?.neighborhoodId) {
        try {
          const response = await finalCityApi.fetchFinalCityByNeighborhoodId(editingEstate.neighborhoodId);
          setFinalCities(response);
        } catch (error) {
          console.error("Failed to fetch final cities:", error);
        }
      }
    };
    fetchFinalCities();
  }, [editingEstate?.neighborhoodId]);

  const handleEdit = async () => {
    if (!editingEstate) return;
    try {
      await RealEstateApi.updateRealEstate(editingEstate.id, editingEstate);
      toast.success("تم التعديل بنجاح");
      client.invalidateQueries({ queryKey: [estateQuery] });
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("خطأ أثناء تحديث العقار");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await RealEstateApi.deleteRealEstate(deletingId);
      toast.success("تم الحذف بنجاح");
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
      toast.error("حدث خطأ أثناء حذف العقارات المحددة");
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
                src={`${process.env.NEXT_PUBLIC_API_URL}/${row.coverImage}`}
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
            <div className="text-sm text-gray-500">
              {row.bedrooms ? `${row.bedrooms} غرف · ` : ''}
              {row.bathrooms ? `${row.bathrooms} حمام · ` : ''}
              {row.buildingArea} م²
            </div>
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
    }
  ];

  const actions = [
    {
      icon: <QrCode className="w-4 h-4" />,
      label: "عرض QR",
      onClick: handleGenerateQR,
      color: "text-purple-600"
    },
    {
      icon: <Edit2 className="w-4 h-4" />,
      label: "تعديل",
      onClick: (row: RealEstateData) => {
        setEditingEstate(row);
        setIsEditModalOpen(true);
      },
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
      />

      {/* Edit Modal using Framer Motion */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from triggering overlay click
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
              aria-modal="true"
              role="dialog"
            >
              <button
                onClick={() => setIsEditExitConfirmOpen(true)}
                aria-label="Close modal"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="m-8">
                {editingEstate && (
                  <EditEstateForm
                    onSubmit={handleEdit}
                    editingEstate={editingEstate}
                    setEditingEstate={setEditingEstate}
                    cities={cities}
                    neighborhoods={neighborhoods}
                    mainTypes={mainTypes || []}
                    finalTypes={finalTypes}
                    finalCities={finalCities}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا العقار؟ لا يمكن التراجع عن هذا القرار."
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

      {/* Edit Exit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isEditExitConfirmOpen}
        onClose={() => setIsEditExitConfirmOpen(false)}
        onConfirm={() => {
          setIsEditModalOpen(false);
          setIsEditExitConfirmOpen(false);
        }}
        title="تأكيد الخروج"
        confirmText={isEditExitConfirmOpen ? "تأكيد الخروج" : undefined}
        message="هل أنت متأكد أنك تريد الخروج من التعديل؟ البيانات غير المحفوظة قد تفقد."
      />
      <AnimatePresence>
        {showQRModal && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative"
            >
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedProperty(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">رمز QR للعقار</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedProperty.title}
                </p>
                <div className="flex justify-center mb-4">
                  <canvas ref={qrCanvasRef} className="border border-gray-200 rounded-md" />
                </div>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  امسح الرمز للوصول إلى صفحة العقار
                </p>
                <button
                  onClick={handleDownloadQR}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  تحميل رمز QR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
