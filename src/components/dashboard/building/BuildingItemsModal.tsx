import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildingItem, CreateBuildingItem } from '@/lib/types';
import { BuildingItemForm } from './BuildingItemForm';
import { BuildingItemList } from './BuildingItemList';
import { EstateFormModal } from './EstateFormModal';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildingItemApi } from '@/api/buildingItemApi';
import { RealEstateListModal } from './RealEstateListModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

interface BuildingItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildingId: string;
}

export function BuildingItemsModal({
    isOpen,
    onClose,
    buildingId
}: BuildingItemsModalProps) {
    const queryClient = useQueryClient();
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [editingItemId, setEditingItemId] = useState<any>(null);
    const [isEstateModalOpen, setIsEstateModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<BuildingItem | null>(null);
    const [isRealEstateListModalOpen, setIsRealEstateListModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<CreateBuildingItem>>({
        name: '',
        price: '',
        area: '',
        type: 'apartment'
    });

    // إضافة حالات مربع حوار تأكيد الحذف
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Fetch building items
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['buildingItems', buildingId],
        queryFn: () => buildingItemApi.fetchBuildingItems(buildingId),
        enabled: isOpen
    });
    console.log(items);


    // Create building item mutation
    const createItemMutation = useMutation({
        mutationFn: (item: CreateBuildingItem) => buildingItemApi.createBuildingItem(item),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buildingItems', buildingId] });
            setIsAddingItem(false);
            setCurrentItem({
                name: '',
                price: '',
                area: '',
                type: 'apartment'
            });
            toast.success("تمت إضافة الوحدة بنجاح");
        },
        onError: () => {
            toast.error("فشل إضافة الوحدة");
        }
    });




    const handleCloseRealEstateListModal = () => {
        setIsRealEstateListModalOpen(false);
        setSelectedItem(null);
    };

    const handleViewRealEstate = async (item: BuildingItem) => {
        setSelectedItem(item);
        setIsRealEstateListModalOpen(true);
    };


    // Update building item mutation
    const updateItemMutation = useMutation({
        mutationFn: ({ id, ...updateData }: { id: string } & CreateBuildingItem) =>
            buildingItemApi.updateBuildingItem(id, updateData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buildingItems', buildingId] });
            setEditingItemId(null);
            setCurrentItem({
                name: '',
                price: '',
                area: '',
                type: 'apartment'
            });
            toast.success("تم تحديث الوحدة بنجاح");
        },
        onError: () => {
            toast.error("فشل تحديث الوحدة");
        }
    });

    // Delete building item mutation
    const deleteItemMutation = useMutation({
        mutationFn: (id: string) => buildingItemApi.deleteBuildingItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buildingItems', buildingId] });
            toast.success("تم حذف الوحدة بنجاح");
            // إغلاق مربع حوار التأكيد بعد الحذف
            setIsDeleteConfirmOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error("فشل حذف الوحدة");
            // إغلاق مربع حوار التأكيد في حالة الخطأ أيضًا
            setIsDeleteConfirmOpen(false);
        }
    });

    const handleAddItem = () => {
        if (!currentItem.name || !currentItem.price) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        createItemMutation.mutate({
            ...currentItem as CreateBuildingItem,
            building_id: buildingId
        });
    };

    const handleUpdateItem = () => {
        if (!currentItem.name || !currentItem.price || !editingItemId) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        updateItemMutation.mutate({
            id: editingItemId,
            ...currentItem as CreateBuildingItem,
            building_id: buildingId
        });
    };

    const handleEditItem = (item: BuildingItem) => {
        setEditingItemId(item.id);
        setCurrentItem(item);
    };

    // تعديل دالة معالجة حذف العنصر لتظهر مربع حوار التأكيد
    const handleDeleteItem = (itemId: string) => {
        setItemToDelete(itemId);
        setIsDeleteConfirmOpen(true);
    };

    // دالة جديدة لتنفيذ الحذف الفعلي بعد التأكيد
    const confirmDeleteItem = () => {
        if (itemToDelete) {
            deleteItemMutation.mutate(itemToDelete);
        }
    };

    // دالة لإغلاق مربع حوار التأكيد
    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleAddEstate = (item: BuildingItem) => {
        setSelectedItem(item);
        setIsEstateModalOpen(true);
    };

    const handleCloseEstateModal = () => {
        setIsEstateModalOpen(false);
        setSelectedItem(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
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
                    className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                        <h2 className="text-xl font-semibold">إدارة الوحدات</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">الوحدات</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    عدد الوحدات: {items.length}
                                </p>
                            </div>
                            {!isAddingItem && !editingItemId && (
                                <button
                                    type="button"
                                    onClick={() => setIsAddingItem(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة وحدة
                                </button>
                            )}
                        </div>

                        {(isAddingItem || editingItemId) && (
                            <BuildingItemForm
                                item={currentItem}
                                isEditing={!!editingItemId}
                                onItemChange={(field, value) =>
                                    setCurrentItem(prev => ({ ...prev, [field]: value }))
                                }
                                onCancel={() => {
                                    setIsAddingItem(false);
                                    setEditingItemId(null);
                                    setCurrentItem({
                                        name: '',
                                        price: '',
                                        area: '',
                                        type: 'apartment',
                                    });
                                }}
                                onSubmit={editingItemId ? handleUpdateItem : handleAddItem}
                            />
                        )}

                        <BuildingItemList
                            items={items}
                            editingItemId={editingItemId}
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                            onAddEstate={handleAddEstate}
                            onViewRealEstate={handleViewRealEstate}
                        />

                    </div>
                </motion.div>
            </motion.div>

            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={closeDeleteConfirm}
                onConfirm={confirmDeleteItem}
                title="تأكيد حذف الوحدة"
                message="هل أنت متأكد من رغبتك في حذف هذه الوحدة؟ لا يمكن التراجع عن هذه العملية."
                confirmText="حذف"
                cancelText="إلغاء"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />

            <EstateFormModal
                isOpen={isEstateModalOpen}
                onClose={handleCloseEstateModal}
                selectedItem={selectedItem}
                buildingItemId={selectedItem?.id}
            />
            <RealEstateListModal
                isOpen={isRealEstateListModalOpen}
                onClose={handleCloseRealEstateListModal}
                buildingItemId={selectedItem?.id}
            />

        </AnimatePresence>
    );
}