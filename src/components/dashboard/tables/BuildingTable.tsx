import React, { useEffect, useRef, useState } from "react";
import { Edit2, Trash2, X, Home, QrCode, ArrowLeft, Plus } from "lucide-react";
import { DataTable } from '@/components/ui/data-table/DataTable';
import { toast } from 'react-toastify';
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Building, RealEstateData, MainType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import BuildingForm from "../forms/BuildingForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildingApi } from "@/api/buidlingApi";
import { RealEstateApi } from "@/api/realEstateApi";
import QRCode from 'qrcode';
import { estateQuery } from "@/lib/constants/queryNames";
import EstateTable from "./EstateTable";
import { EstateFormModal } from "../building/EstateFormModal";
import { useMainType } from "@/lib/hooks/useMainType";

export default function BuildingsTable() {
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEstateFormModalOpen, setIsEstateFormModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [showBuildingRealEstates, setShowBuildingRealEstates] = useState(false);

  // Fetch buildings
  const { data: buildings, isLoading, error } = useQuery({
    queryKey: ['buildings'],
    queryFn: buildingApi.fetchBuildings
  });

  const {
    data: buildingRealEstates = [],
    isLoading: isRealEstateLoading,
    error: realEstateError,
    refetch: refetchRealEstates
  } = useQuery({
    queryKey: ['realEstate', 'building', selectedBuilding?.id],
    queryFn: () => selectedBuilding ? RealEstateApi.fetchRealEstateByBuildingId(selectedBuilding.id) : Promise.resolve([]),
    enabled: !!selectedBuilding && showBuildingRealEstates,
    refetchOnWindowFocus: false
  });

  const deleteMutation = useMutation({
    mutationFn: buildingApi.deleteBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success("تم حذف المبنى بنجاح");
      setIsDialogOpen(false);
      setPendingDeleteId(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف المبنى");
    }
  });

  const handleEdit = (building: Building) => {
    setSelectedBuilding(building);
    setEditModalOpen(true);
  };

  const handleAddRealEstate = (building: Building) => {
    setSelectedBuilding(building);
    setIsEstateFormModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['buildings'] });
    setEditModalOpen(false);
    setSelectedBuilding(null);
    toast.success("تم تحديث المبنى بنجاح");
  };

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (showQRModal && selectedBuilding && qrCanvasRef.current && !qrGenerated) {
        const url = `${process.env.NEXT_PUBLIC_FRONTEND}/buildings/${selectedBuilding.id}`;
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
  }, [showQRModal, selectedBuilding]);

  useEffect(() => {
    if (!showQRModal) {
      setQrGenerated(false);
    }
  }, [showQRModal]);

  const handleGenerateQR = (building: Building) => {
    setSelectedBuilding(building);
    setShowQRModal(true);
  };

  const handleDownloadQR = () => {
    if (qrCanvasRef.current && selectedBuilding) {
      const link = document.createElement('a');
      link.download = `building-${selectedBuilding.id}-qr.png`;
      link.href = qrCanvasRef.current.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewRealEstates = async (building: Building) => {
    setSelectedBuilding(building);
    setShowBuildingRealEstates(true);
    // The useQuery hook will automatically fetch the real estate data
    // when selectedBuilding and showBuildingRealEstates are updated
  };

  const { mainTypes } = useMainType();
  
  const columns = [
    {
      header: "اسم المبنى",
      accessorKey: "title",
      cell: (row: Building) => (
        <div className="text-sm font-medium text-gray-900">{row.title}</div>
      )
    },
    {
      header: "عدد العقارات",
      accessorKey: "realEstateCount",
      cell: (row: Building) => (
        <div className="text-sm font-medium text-gray-700">
          {row.realEstateCount || 0}
        </div>
      )
    },
    {
      header: "الموقع",
      accessorKey: "location",
      cell: (row: Building) => (
        <div className="text-sm text-gray-600">
          {row.location || "—"}
        </div>
      )
    },
    {
      header: "الحالة",
      accessorKey: "status",
      cell: (row: Building) => (
        <span className={`
          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
          ${row.status === 'مكتمل' ? 'bg-green-100 text-green-800' : ''}
          ${row.status === 'قيد الإنشاء' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${row.status === 'مخطط' ? 'bg-gray-100 text-gray-800' : ''}
        `}>
          {row.status}
        </span>
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
      icon: <Home className="w-4 h-4" />,
      label: "العقارات",
      onClick: handleViewRealEstates,
      color: "text-green-600"
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
      onClick: (row: Building) => {
        setPendingDeleteId(row.id);
        setIsDialogOpen(true);
      },
      color: "text-red-600"
    }
  ];

  // Handle going back to buildings list
  const handleBackToBuildingsList = () => {
    setShowBuildingRealEstates(false);
    setSelectedBuilding(null);
  };

  // Handle estate form modal close
  const handleEstateFormModalClose = () => {
    setIsEstateFormModalOpen(false);
    
    queryClient.invalidateQueries({ queryKey: [estateQuery] });
    queryClient.invalidateQueries({ queryKey: ['buildings'] });
    
    // If we're in the real estate view, refresh the real estate data for the selected building
    if (showBuildingRealEstates && selectedBuilding) {
      queryClient.invalidateQueries({ queryKey: ['realEstate', 'building', selectedBuilding.id] });
    }

  };

  if (showBuildingRealEstates && selectedBuilding) {
    return (
      <div className="w-full" dir="rtl">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToBuildingsList}
            className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة إلى قائمة المباني
          </button>
          <h2 className="text-xl font-semibold mr-4">
            عقارات مبنى: {selectedBuilding.title}
          </h2>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <span className="text-gray-600">إجمالي العقارات:</span>
            <span className="font-semibold text-lg mr-2">{buildingRealEstates.length}</span>
          </div>
          <div className="flex gap-2">
            {realEstateError && (
              <button
                onClick={() => refetchRealEstates()}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            )}
            <button
              onClick={() => handleAddRealEstate(selectedBuilding)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة عقار جديد
            </button>
          </div>
        </div>

        {realEstateError ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p className="font-semibold">حدث خطأ أثناء تحميل العقارات</p>
            <p className="text-sm mt-2">يرجى المحاولة مرة أخرى لاحقًا.</p>
          </div>
        ) : (
          <EstateTable
            realEstateData={buildingRealEstates}
            isLoading={isRealEstateLoading}
            mainTypes={mainTypes}
          />
        )}

        {/* Estate Form Modal */}
        {selectedBuilding && (
          <EstateFormModal
            isOpen={isEstateFormModalOpen}
            onClose={handleEstateFormModalClose}
            selectedItem={selectedBuilding}
            buildingId={selectedBuilding.id}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full" dir="rtl">
      <DataTable
        data={buildings || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        error={error}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (pendingDeleteId) {
            deleteMutation.mutate(pendingDeleteId);
          }
        }}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا المبنى؟ لا يمكن التراجع عن هذا القرار."
      />

      {/* Edit Building Modal */}
      <AnimatePresence>
        {editModalOpen && selectedBuilding && (
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
            >
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold">تعديل المبنى</h2>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedBuilding(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <BuildingForm
                  mode="edit"
                  initialData={selectedBuilding}
                  onSuccess={handleUpdateSuccess}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estate Form Modal for main table view */}
      {selectedBuilding && (
        <EstateFormModal
          isOpen={isEstateFormModalOpen}
          onClose={handleEstateFormModalClose}
          buildingId={selectedBuilding.id}
          selectedItem={selectedBuilding}
        />
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedBuilding && (
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
                  setSelectedBuilding(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">رمز QR للمبنى</h2>
                <div className="flex justify-center mb-4">
                  <canvas ref={qrCanvasRef} className="w-48 h-48" />
                </div>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  امسح الرمز للوصول إلى صفحة المبنى
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