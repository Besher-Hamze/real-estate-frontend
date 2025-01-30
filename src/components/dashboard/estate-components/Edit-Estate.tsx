import { FinalType, MainType, SubType } from '@/lib/types';
import React from 'react';
import AdditionalFeaturesSelection from './AdditionalSelectionProps';
import FeaturesSelection from './FeaturesSelectionProps ';

interface EditEstateFormProps {
    editingEstate: any;
    setEditingEstate: (estate: any) => void;
    cities: any[];
    neighborhood: any[];
    mainTypes: any[];
    finalTypes: any[];
}

const EditEstateForm: React.FC<EditEstateFormProps> = ({
    editingEstate,
    setEditingEstate,
    cities,
    neighborhood,
    mainTypes,
    finalTypes,
}) => {
    const getPropertyType = (): 'residential' | 'commercial' | 'industrial' | "others" => {
        const mainType = mainTypes?.find((m: MainType) => m.id === editingEstate.mainCategoryId);
        const subType = mainType?.subtypes.find((st: SubType) => st.id === editingEstate.subCategoryId);
        const finalType = finalTypes?.find((f: FinalType) => f.id === editingEstate.finalTypeId);
    
        if (subType?.name.includes('سكني') || finalType?.name.includes('سكني')) {
          return 'residential';
        } else if (subType?.name.includes('تجاري') || finalType?.name.includes('تجاري')) {
          return 'commercial';
        } else if (subType?.name.includes('صناعي') || finalType?.name.includes('صناعي')) {
          return 'industrial';
        }
        return 'others';
      };
    
    

    const handleFeaturesChange = (features: string[]) => {
        setEditingEstate({
            ...editingEstate,
            mainFeatures: features.join('، ')
        });
    };

    const handleAdditionalFeaturesChange = (features: string[]) => {
        setEditingEstate({
            ...editingEstate,
            additionalFeatures: features.join('، ')
        });
    };

    return (
        <div className="space-y-4 max-h-[70vh] overflow-auto" dir="rtl">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان
                </label>
                <input
                    type="text"
                    value={editingEstate.title}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Price */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر
                </label>
                <input
                    type="number"
                    value={editingEstate.price}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, price: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* City */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    المدينة
                </label>
                <select
                    value={editingEstate.cityId}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, cityId: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={0}>اختر المدينة</option>
                    {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Neighborhood */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحي
                </label>
                <select
                    value={editingEstate.neighborhoodId}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, neighborhoodId: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={0}>اختر الحي</option>
                    {neighborhood.map((nb) => (
                        <option key={nb.id} value={nb.id}>
                            {nb.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Main Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    التصنيف الرئيسي
                </label>
                <select
                    value={editingEstate.mainCategoryId}
                    onChange={(e) =>
                        setEditingEstate({
                            ...editingEstate,
                            mainCategoryId: Number(e.target.value),
                            subCategoryId: 0,
                        })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={0}>اختر التصنيف الرئيسي</option>
                    {mainTypes?.map((mainType) => (
                        <option key={mainType.id} value={mainType.id}>
                            {mainType.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sub Category */}
            {editingEstate.mainCategoryId > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        التصنيف الفرعي
                    </label>
                    <select
                        value={editingEstate.subCategoryId}
                        onChange={(e) =>
                            setEditingEstate({ ...editingEstate, subCategoryId: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={0}>اختر التصنيف الفرعي</option>
                        {mainTypes
                            ?.find((m) => m.id === editingEstate.mainCategoryId)
                            ?.subtypes.map((subType:any) => (
                                <option key={subType.id} value={subType.id}>
                                    {subType.name}
                                </option>
                            ))}
                    </select>
                </div>
            )}

            {/* Final Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    التصنيف النهائي
                </label>
                <select
                    value={editingEstate.finalTypeId}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, finalTypeId: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={0}>اختر التصنيف النهائي</option>
                    {finalTypes.map((finalType) => (
                        <option key={finalType.id} value={finalType.id}>
                            {finalType.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        عدد الغرف
                    </label>
                    <input
                        type="number"
                        value={editingEstate.bedrooms}
                        onChange={(e) =>
                            setEditingEstate({ ...editingEstate, bedrooms: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        عدد الحمامات
                    </label>
                    <input
                        type="number"
                        value={editingEstate.bathrooms}
                        onChange={(e) =>
                            setEditingEstate({ ...editingEstate, bathrooms: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Furnished */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    حالة الفرش
                </label>
                <select
                    value={editingEstate.furnished ? 1 : 0}
                    onChange={(e) =>
                        setEditingEstate({
                            ...editingEstate,
                            furnished: Number(e.target.value) === 1,
                        })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={1}>مفروشة</option>
                    <option value={0}>غير مفروشة</option>
                </select>
            </div>

            {/* Building Area */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    المساحة
                </label>
                <input
                    type="text"
                    value={editingEstate.buildingArea}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, buildingArea: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Floor Number */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    الطابق
                </label>
                <select
                    value={editingEstate.floorNumber}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, floorNumber: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={0}>اختر الطابق</option>
                    {[
                        { value: 0, label: "أرضي" },
                        { value: 1, label: "أول" },
                        { value: 2, label: "ثاني" },
                        { value: 3, label: "ثالث" },
                        { value: 4, label: "رابع" },
                        { value: 5, label: "خامس" },
                    ].map((floor) => (
                        <option key={floor.value} value={floor.value}>
                            {floor.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Facade */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    الإطلالة
                </label>
                <select
                    value={editingEstate.facade}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, facade: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">اختر الإطلالة</option>
                    {[
                        { value: "بحرية", label: "بحرية" },
                        { value: "جبلية", label: "جبلية" },
                        { value: "على الشارع", label: "على الشارع" },
                        { value: "حديقة داخلية", label: "حديقة داخلية" },
                        { value: "داخلية", label: "داخلية" },
                    ].map((facade) => (
                        <option key={facade.value} value={facade.value}>
                            {facade.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    طريقة الدفع
                </label>
                <input
                    type="text"
                    value={editingEstate.paymentMethod}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, paymentMethod: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Features */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    الميزات الأساسية
                </label>
                <FeaturesSelection
                    propertyType={getPropertyType()}
                    selectedFeatures={editingEstate.mainFeatures.split('، ').filter(Boolean)}
                    onChange={handleFeaturesChange}
                />
            </div>

            {/* Additional Features */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    الميزات الإضافية
                </label>
                <AdditionalFeaturesSelection
                    selectedFeatures={editingEstate.additionalFeatures.split('، ').filter(Boolean)}
                    onChange={handleAdditionalFeaturesChange}
                />
            </div>

            {/* Nearby Locations */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    المواقع القريبة
                </label>
                <textarea
                    value={editingEstate.nearbyLocations}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, nearbyLocations: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                />
            </div>

            {/* Rental Duration */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    مدة الإيجار
                </label>
                <select
                    value={editingEstate.rentalDuration}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, rentalDuration: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={0}>اختر مدة الإيجار</option>
                    {[
                        { value: 1, label: "شهر" },
                        { value: 3, label: "ثلاث شهور" },
                        { value: 6, label: "ستة شهور" },
                        { value: 12, label: "سنة" },
                    ].map((duration) => (
                        <option key={duration.value} value={duration.value}>
                            {duration.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ceiling Height */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    ارتفاع السقف
                </label>
                <input
                    type="number"
                    value={editingEstate.ceilingHeight}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, ceilingHeight: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Total Floors */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    إجمالي الطوابق
                </label>
                <input
                    type="number"
                    value={editingEstate.totalFloors}
                    onChange={(e) =>
                        setEditingEstate({ ...editingEstate, totalFloors: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
};

export default EditEstateForm;