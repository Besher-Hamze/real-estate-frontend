import React from 'react';
import { BuildingIcon, Check, X } from 'lucide-react';
import { FormField } from '@/components/ui/form/FormField';
import { InputField } from '@/components/ui/form/InputField';
import { SelectField } from '@/components/ui/form/SelectField';
import { BuildingItem } from '@/lib/types';

interface BuildingItemFormProps {
  item: Partial<BuildingItem>;
  isEditing: boolean;
  onItemChange: (field: string, value: any) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onAddEstate?: (item: BuildingItem) => void;
}

export const BuildingItemForm: React.FC<BuildingItemFormProps> = ({
  item,
  isEditing,
  onItemChange,
  onCancel,
  onSubmit,
  onAddEstate
}) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div className="grid grid-cols-2 gap-4 mb-4">
      <FormField label="نوع الوحدة">
        <SelectField
          value={item.type || 'apartment'}
          onChange={(value) => onItemChange('type', value)}
          options={[
            { value: 'apartment', label: 'شقة' },
            { value: 'shop', label: 'محل تجاري' }
          ]}
          placeholder="اختر نوع الوحدة"
        />
      </FormField>

      <FormField label="اسم الوحدة">
        <InputField
          type="text"
          value={item.name!}
          onChange={(value) => onItemChange('name', value)}
          placeholder={item.type === 'apartment' ? 'مثال: شقة 101' : 'مثال: محل 1'}
          required
        />
      </FormField>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <FormField label="السعر">
        <InputField
          type="text"
          value={item.price!}
          onChange={(value) => onItemChange('price', value)}
          placeholder="أدخل السعر"
          required
        />
      </FormField>

      <FormField label="المساحة">
        <InputField
          type="text"
          value={item.area!}
          onChange={(value) => onItemChange('area', value)}
          placeholder="المساحة بالمتر المربع"
        />
      </FormField>
    </div>

    <div className="flex justify-between items-center">
      {item.id && onAddEstate && (
        <button
          type="button"
          onClick={() => onAddEstate(item as BuildingItem)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
        >
          <BuildingIcon className="w-4 h-4" />
          إضافة عقار
        </button>
      )}

      <div className="flex gap-2 mr-auto">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          إلغاء
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
        >
          <Check className="w-4 h-4" />
          {isEditing ? 'تحديث' : 'إضافة'}
        </button>
      </div>
    </div>
  </div>
);
