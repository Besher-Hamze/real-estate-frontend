import React from 'react';
import { Home, ShoppingBag, Edit2, Trash2, BuildingIcon, Eye } from 'lucide-react';
import { BuildingItem } from '@/lib/types';

interface BuildingItemListProps {
  items: BuildingItem[];
  editingItemId: string | null;
  onEdit: (item: BuildingItem) => void;
  onDelete: (id: string) => void;
  onAddEstate: (item: BuildingItem) => void;
  onViewRealEstate?: (item: BuildingItem) => void;
}

export const BuildingItemList: React.FC<BuildingItemListProps> = ({
  items,
  editingItemId,
  onEdit,
  onDelete,
  onAddEstate,
  onViewRealEstate
}) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div
        key={item.id}
        className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200
          ${editingItemId === item.id ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="flex items-center gap-3">
          {item.type === 'apartment' ? (
            <Home className="w-5 h-5 text-blue-600" />
          ) : (
            <ShoppingBag className="w-5 h-5 text-green-600" />
          )}
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-600">
              {item.price} ر.ع · {item.area} م²
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onViewRealEstate && (
            <button
              onClick={() => onViewRealEstate(item)}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="عرض العقارات"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onAddEstate(item)}
            className="text-purple-600 hover:text-purple-700 transition-colors p-1"
            title="إضافة عقار"
          >
            <BuildingIcon className="w-5 h-5" />
          </button>
          {editingItemId !== item.id && (
            <>
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="text-blue-600 hover:text-blue-700 transition-colors p-1"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-700 transition-colors p-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    ))}

    {items.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        لا توجد وحدات. انقر على إضافة وحدة لإضافة وحدة جديدة.
      </div>
    )}
  </div>
);

