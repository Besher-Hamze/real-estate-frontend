import React, { useEffect, useRef, useState } from "react";
import { Edit2, Trash2, X, Plus, List, QrCode } from "lucide-react";
import { DataTable } from '@/components/ui/data-table/DataTable';
import { toast } from 'react-toastify';
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Building, BuildingItem, CreateBuildingItem, UpdateBuildingItem } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import BuildingForm from "../forms/BuildingForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildingApi } from "@/api/buidlingApi";
import { buildingItemApi } from "@/api/buildingItemApi";
import { BuildingItemsModal } from "../building/BuildingItemsModal";
import QRCode from 'qrcode';

export default function BuildingsTable() {
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  // Fetch buildings
  const { data: buildings, isLoading, error } = useQuery({
    queryKey: ['buildings'],
    queryFn: buildingApi.fetchBuildings
  });



  // Delete building mutation
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
  const updateBuildingItemsMutation = useMutation({
    mutationFn: (item: BuildingItem) =>
      buildingItemApi.updateBuildingItem(item.id, {
        name: item.name,
        price: item.price,
        area: item.area,
        type: item.type
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success("تم تحديث الوحدة بنجاح");
      setIsItemsModalOpen(false);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث الوحدة");
    }
  });



  const handleEdit = (building: Building) => {
    setSelectedBuilding(building);
    setEditModalOpen(true);
  };

  const handleManageItems = (building: Building) => {
    setSelectedBuilding(building);
    setIsItemsModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['buildings'] });
    setEditModalOpen(false);
    setSelectedBuilding(null);
    toast.success("تم تحديث المبنى بنجاح");
  };
  const handleUpdateItems = (item: BuildingItem) => {
    updateBuildingItemsMutation.mutate(item);
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
  



  const getApartmentCount = (items: BuildingItem[] = []) => {
    return items.filter(item => item.type === 'apartment').length;
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
  const getShopCount = (items: BuildingItem[] = []) => {
    return items.filter(item => item.type === 'shop').length;
  };

  const columns = [
    {
      header: "اسم المبنى",
      accessorKey: "title",
      cell: (row: Building) => (
        <div className="text-sm font-medium text-gray-900">{row.title}</div>
      )
    },
    {
      header: "عدد المحلات",
      accessorKey: "items",
      cell: (row: Building) => (
        <div className="text-sm font-medium text-gray-700">
          {getShopCount(row.items)}
        </div>
      )
    },
    {
      header: "عدد الشقق",
      accessorKey: "items",
      cell: (row: Building) => (
        <div className="text-sm font-medium text-gray-700">
          {getApartmentCount(row.items)}
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
      icon: <List className="w-4 h-4" />,
      label: "إدارة الوحدات",
      onClick: handleManageItems,
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

      {/* Edit Modal */}
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

      {/* Building Items Modal */}
      {selectedBuilding && (
        <BuildingItemsModal
          isOpen={isItemsModalOpen}
          onClose={() => setIsItemsModalOpen(false)}
          buildingId={selectedBuilding.id}
        />
      )}
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