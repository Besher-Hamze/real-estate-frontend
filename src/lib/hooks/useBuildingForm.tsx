// hooks/useBuildingForm.ts
import { useState } from 'react';
import { Building, BuildingItem, UpdateBuilding } from '@/lib/types';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildingApi } from '@/api/buidlingApi';

const INITIAL_BUILDING_STATE: Omit<Building, 'id'> = {
  title: '',
  items: [],
  status: 'مخطط',
  location: "23.5880,58.3829"
};

const INITIAL_ITEM_STATE: Omit<BuildingItem, 'id'> = {
  name: '',
  price: '',
  area: '',
  type: 'apartment',
  building_id: ''
};

interface UseBuildingFormProps {
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  initialData?: Building;
}

export function useBuildingForm({ onSuccess, mode = 'create', initialData }: UseBuildingFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Omit<Building, 'id'>>(
    initialData ? {
      title: initialData.title,
      status: initialData.status,
      items: initialData.items || [],
      location: initialData.location || "1,1"
    } : INITIAL_BUILDING_STATE
  );
  const [currentItem, setCurrentItem] = useState<Omit<BuildingItem, 'id'>>(INITIAL_ITEM_STATE);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isEstateModalOpen, setIsEstateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BuildingItem | null>(null);

  const createBuildingMutation = useMutation({
    mutationFn: buildingApi.createBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success("تمت إضافة المبنى بنجاح");
      setFormData(INITIAL_BUILDING_STATE);
      onSuccess?.();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة المبنى");
    }
  });

  const updateBuildingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBuilding }) =>
      buildingApi.updateBuilding(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      onSuccess?.();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث المبنى");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("يرجى ملء جميع الحقول المطلوبة وإضافة وحدة واحدة على الأقل");
      return;
    }

    const buildingData = {
      ...formData,
      items: formData.items
    };

    if (mode === 'create') {
      createBuildingMutation.mutate(buildingData);
    } else if (initialData?.id) {
      updateBuildingMutation.mutate({
        id: initialData.id,
        data: buildingData
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field: string, value: any) => {
    if (editingItemId) {
      setFormData(prev => ({
        ...prev,
        items: prev.items?.map(item =>
          item.id === editingItemId ? { ...item, [field]: value } : item
        ) || []
      }));
    } else {
      setCurrentItem(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddBuildingItem = () => {
    if (!currentItem.name || !currentItem.price) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const newItem: BuildingItem = {
      ...currentItem,
      id: Math.random().toString(36).substr(2, 9)
    };

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    setCurrentItem(INITIAL_ITEM_STATE);
    setIsAddingItem(false);
    toast.success("تمت إضافة الوحدة بنجاح");
  };

  const handleEditItem = (item: BuildingItem) => {
    setEditingItemId(item.id);
    setCurrentItem(item);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setCurrentItem(INITIAL_ITEM_STATE);
  };

  const handleUpdateItem = () => {
    if (!currentItem.name || !currentItem.price) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(item =>
        item.id === editingItemId ? { ...currentItem, id: item.id } : item
      ) || []
    }));

    setEditingItemId(null);
    setCurrentItem(INITIAL_ITEM_STATE);
    toast.success("تم تحديث الوحدة بنجاح");
  };

  const handleRemoveBuildingItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || []
    }));
    toast.success("تم حذف الوحدة بنجاح");
  };

  const handleAddEstate = (item: BuildingItem) => {
    setSelectedItem(item);
    setIsEstateModalOpen(true);
  };

  const handleCloseEstateModal = () => {
    setIsEstateModalOpen(false);
    setSelectedItem(null);
  };

  return {
    formData,
    currentItem,
    isAddingItem,
    editingItemId,
    isLoading: createBuildingMutation.isPending || updateBuildingMutation.isPending,
    isEstateModalOpen,
    selectedItem,
    setIsAddingItem,
    handleChange,
    handleItemChange,
    handleAddBuildingItem,
    handleEditItem,
    handleCancelEdit,
    handleUpdateItem,
    handleRemoveBuildingItem,
    handleAddEstate,
    handleCloseEstateModal,
    handleSubmit,
    setFormData,
  };
}