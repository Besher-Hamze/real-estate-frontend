"use client";

import React, { useState, useEffect, useRef } from "react";
import { Edit2, Eye, Trash2, X } from "lucide-react";
import Image from "next/image";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { estateQuery } from "@/lib/constants/queryNames";
import { toast } from "react-toastify";
import { RealEstateApi } from "@/api/realEstateApi";
import apiClient from "@/api";
import { finalTypeTypeApi } from "@/api/finalTypeApi";
import { CityType, FinalType, MainType, NeighborhoodType, RealEstateData } from "@/lib/types";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import EditEstateForm from "../estate-components/Edit-Estate";

interface EstateTableProps {
  realEstateData: RealEstateData[] | undefined;
  isLoading: boolean;
  mainTypes: MainType[] | undefined;
}

export default function EstateTable({ realEstateData, isLoading, mainTypes }: EstateTableProps) {
  const [editingEstate, setEditingEstate] = useState<RealEstateData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [cities, setCities] = useState<CityType[]>([]);
  const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);

  const client = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isEditModalOpen) {
        setIsEditModalOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isEditModalOpen
      ) {
        setIsEditModalOpen(false);
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

  const columns = [
    {
      header: "العنوان",
      accessorKey: "title",
      cell: (row: RealEstateData) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/${row.coverImage}`}
              alt={row.title}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          </div>
          <div className="mr-4">
            <div className="text-sm font-medium text-gray-900">{row.title}</div>
            <div className="text-sm text-gray-500">
              {row.bedrooms} غرف · {row.bathrooms} حمام · {row.buildingArea} م²
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
      header: "المدينة",
      accessorKey: "cityName",
      cell: (row: RealEstateData) => (
        <>
          <div className="text-sm text-gray-900">{row.cityName}</div>
          <div className="text-sm text-gray-500">{row.neighborhoodName}</div>
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
    // {
    //   icon: <Eye className="w-4 h-4" />,
    //   label: "عرض",
    //   onClick: (row: RealEstateData) => { /* handle view */ },
    //   color: "text-green-600"
    // },
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
    }
  ];

  return (
    <div className="relative w-full" dir="rtl">
      <DataTable
        data={realEstateData || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
              aria-modal="true"
              role="dialog"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
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
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا العقار؟ لا يمكن التراجع عن هذا القرار."
      />
    </div>
  );
}
