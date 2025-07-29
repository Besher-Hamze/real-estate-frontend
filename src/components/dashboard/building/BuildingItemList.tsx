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
            <div className="font-medium">{item.name} </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">
                {item.price} ر.ع · {item.area} م²
              </span>
              {item.realestateCount !== undefined && (
                <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                  {item.realestateCount} {item.realestateCount === 1 ? 'عقار' : 'عقارات'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onViewRealEstate && (
            <button
              onClick={() => onViewRealEstate(item)}
              className={`${item.realestateCount ? 'text-green-600 hover:text-green-800' : 'text-gray-400 cursor-not-allowed'
                } transition-colors p-1`}
              title={item.realestateCount ? "عرض الإعلانات" : "لا توجد عقارات"}
              disabled={!item.realestateCount}
            >
              <div className="relative">
                <Eye className="w-5 h-5" />
                {item.realestateCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.realestateCount > 9 ? '9+' : item.realestateCount}
                  </span>
                )}
              </div>
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
                title="تعديل الوحدة"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-700 transition-colors p-1"
                title="حذف الوحدة"
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