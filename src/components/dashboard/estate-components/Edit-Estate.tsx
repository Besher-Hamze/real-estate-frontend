import React from "react";
import { Plus, X } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { ADDITIONAL_FEATURES, FEATURES_BY_TYPE, FLOOR_OPTIONS, FURNISHED_OPTIONS, NEARBY_LOCATION, PAYMENT_OPTIONS, RENTAL_DURATION_OPTIONS, VIEW_OPTIONS } from "@/components/ui/constants/formOptions";
import FeaturesSelect from "@/components/ui/FeaturesSelect";
import RangeInput from "@/components/ui/form/RangePriceInput";
import LocationPicker from "@/components/map/LocationPicker";

interface EditEstateFormProps {
    editingEstate: any;
    setEditingEstate: (estate: any) => void;
    onSubmit: (estate: any) => Promise<void>;
    cities: any[];
    neighborhoods: any[];
    mainTypes: any[];
    finalTypes: any[];
}

const EditEstateForm: React.FC<EditEstateFormProps> = ({
    editingEstate,
    setEditingEstate,
    onSubmit,
    cities,
    neighborhoods,
    mainTypes,
    finalTypes,
}) => {
    const isLandType = () => {
        const mainType = mainTypes?.find((m: any) => m.id === editingEstate.mainCategoryId);
        const subType = mainType?.subtypes.find((st: any) => st.id === editingEstate.subCategoryId);
        const finalType = finalTypes?.find((f: any) => f.id === editingEstate.finalTypeId);

        return subType?.name.includes("أرض") || finalType?.name.includes("أرض");
    };


    const isRentalType = () => {
        const mainType = mainTypes?.find((m: any) => m.id === editingEstate.mainCategoryId);
        return mainType?.name.includes("إيجار");
    }

    const getPropertyType = (): "residential" | "commercial" | "industrial" | "others" => {
        const mainType = mainTypes?.find((m: any) => m.id === editingEstate.mainCategoryId);
        const subType = mainType?.subtypes.find((st: any) => st.id === editingEstate.subCategoryId);
        const finalType = finalTypes?.find((f: any) => f.id === editingEstate.finalTypeId);

        if (subType?.name.includes("سكني") || finalType?.name.includes("سكني")) {
            return "residential";
        } else if (subType?.name.includes("تجاري") || finalType?.name.includes("تجاري")) {
            return "commercial";
        } else if (subType?.name.includes("صناعي") || finalType?.name.includes("صناعي")) {
            return "industrial";
        }
        return "others";
    };

    const shouldHideResidentialFields = isLandType();
    const shouldShowRentalField = isRentalType();

    const handleChange = (field: string, value: any) => {
        if (field === 'location') {
            const locationString = `${value.latitude},${value.longitude}`;
            setEditingEstate((prev: any) => ({ ...prev, [field]: locationString }));
            return;
        }
        if (field === "title") {
            const cleanedValue = value.replace(/\d/g, '');
            setEditingEstate((prev: any) => ({ ...prev, [field]: cleanedValue }));
            return;
        }
        if ((field === "bedrooms" || field === "bathrooms")) {
            const numValue = Number(value);
            if (numValue <= 0) {
                return;
            }
        }
        setEditingEstate((prev: any) => ({ ...prev, [field]: value }));
    };



    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleChange("coverImage", file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : null;
        handleChange("files", files);
    };

    return (
        <form
            onSubmit={onSubmit}
            className="space-y-6"
            dir="rtl"
        >
            <h2 className="text-xl font-semibold mb-6">تعديل العقار</h2>

            {/* Basic Info */}
            <FormField label="عنوان العقار">
                <InputField
                    type="text"
                    value={editingEstate.title}
                    onChange={(value) => handleChange("title", value)}
                    placeholder="أدخل عنوان العقار"
                    required
                />
            </FormField>

            <FormField label="السعر">

                <InputField
                    type="number"
                    value={editingEstate.price}
                    onChange={(value) => handleChange("price", Number(value))}
                    placeholder="أدخل السعر"
                    required
                />
                {/* <RangeInput
                    minValue={0}
                    maxValue={1000}
                    step={10}
                    onChange={(value) => {
                        handleChange('price', value);
                    }}
                    initialMax={Number(editingEstate.price.split("-")[0])}
                    initialMin={Number(editingEstate.price.split("-")[1])}
                /> */}
            </FormField>


            <FormField label="وقت المشاهدة">
                <InputField
                    type="text"
                    value={editingEstate.viewTime}
                    onChange={(value) => handleChange("viewTime", value)}
                    placeholder="أدخل وقت المشاهدة"
                    required
                />
            </FormField>


            <FormField label="طريقة الدفع">
                <FeaturesSelect
                    features={PAYMENT_OPTIONS}
                    selectedFeatures={editingEstate.paymentMethod.split("، ").filter(Boolean)}
                    onChange={(selected) => handleChange('paymentMethod', selected.join("، "))}
                    placeholder="اختر طريقة الدفع"
                    selectionText={{
                        single: "طريقة دفع",
                        multiple: "طرق دفع"
                    }}
                />
            </FormField>



            {/* Categories */}
            <FormField label="التصنيف الرئيسي">
                <SelectField
                    value={editingEstate.mainCategoryId}
                    onChange={(value) => {
                        handleChange("mainCategoryId", Number(value));
                        handleChange("subCategoryId", 0);
                        handleChange("mainFeatures", "");
                    }}
                    options={mainTypes?.map((type: any) => ({
                        value: type.id,
                        label: type.name,
                    })) || []}
                    placeholder="اختر التصنيف الرئيسي"
                />
            </FormField>

            {editingEstate.mainCategoryId > 0 && (
                <FormField label="التصنيف الفرعي">
                    <SelectField
                        value={editingEstate.subCategoryId}
                        onChange={(value) => handleChange("subCategoryId", Number(value))}
                        options={mainTypes
                            ?.find((m: any) => m.id === editingEstate.mainCategoryId)
                            ?.subtypes.map((sub: any) => ({
                                value: sub.id,
                                label: sub.name,
                            })) || []}
                        placeholder="اختر التصنيف الفرعي"
                    />
                </FormField>
            )}

            {editingEstate.subCategoryId > 0 && (
                <FormField label="التصنيف النهائي">
                    <SelectField
                        value={editingEstate.finalTypeId}
                        onChange={(value) => handleChange("finalTypeId", Number(value))}
                        options={finalTypes.map((type: any) => ({
                            value: type.id,
                            label: type.name,
                        }))}
                        placeholder="اختر التصنيف النهائي"
                    />
                </FormField>
            )}

            {/* Location */}
            <FormField label="المدينة">
                <SelectField
                    value={editingEstate.cityId}
                    onChange={(value) => handleChange("cityId", Number(value))}
                    options={cities.map((city: any) => ({
                        value: city.id,
                        label: city.name,
                    }))}
                    placeholder="اختر المدينة"
                />
            </FormField>

            <FormField label="الحي">
                <SelectField
                    value={editingEstate.neighborhoodId}
                    onChange={(value) => handleChange("neighborhoodId", Number(value))}
                    options={neighborhoods.map((nb: any) => ({
                        value: nb.id,
                        label: nb.name,
                    }))}
                    placeholder="اختر الحي"
                />
            </FormField>

            <FormField label="الأماكن القريبة">
                <FeaturesSelect
                    features={NEARBY_LOCATION}
                    selectedFeatures={editingEstate.nearbyLocations.split('، ').filter(Boolean)}
                    onChange={(features) => handleChange('nearbyLocations', features.join('، '))}
                    placeholder="اختر الأماكن القريبة"
                    selectionText={{
                        single: "مكان قريبة",
                        multiple: "أماكن قريب"
                    }}
                />
            </FormField>
            <FormField label="تحديد الموقع على الخريطة">
                <LocationPicker
                    initialLatitude={editingEstate.location ? parseFloat(editingEstate.location.split(',')[0]) : undefined}
                    initialLongitude={editingEstate.location ? parseFloat(editingEstate.location.split(',')[1]) : undefined}
                    onLocationSelect={(latitude, longitude) => {
                        handleChange('location', { latitude, longitude });
                    }}
                />
            </FormField>

            {/* Property Details - Only show if not land type */}
            {!shouldHideResidentialFields && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="عدد الغرف">
                            <InputField
                                type="number"
                                value={editingEstate.bedrooms}
                                onChange={(value) => handleChange("bedrooms", Number(value))}
                                min={1}
                            />
                        </FormField>
                        <FormField label="عدد الحمامات">
                            <InputField
                                type="number"
                                value={editingEstate.bathrooms}
                                onChange={(value) => handleChange("bathrooms", Number(value))}
                                min={1}
                            />
                        </FormField>
                    </div>

                    <FormField label="عدد الطوابق">
                        <InputField
                            type="number"
                            value={editingEstate.totalFloors}
                            onChange={(value) => handleChange('totalFloors', Number(value))}
                            min={1}
                        />
                    </FormField>


                    <FormField label="الطابق">
                        <SelectField
                            value={editingEstate.floorNumber}
                            onChange={(value) => handleChange("floorNumber", Number(value))}
                            options={FLOOR_OPTIONS}
                            placeholder="اختر الطابق"
                        />
                    </FormField>


                    <FormField label="إرتفاع السقف">
                        <InputField
                            type="number"
                            value={editingEstate.ceilingHeight}
                            onChange={(value) => handleChange('ceilingHeight', Number(value))}
                            min={1}
                        />
                    </FormField>


                    <FormField label="مفروشة">
                        <SelectField
                            value={editingEstate.furnished}
                            onChange={(value) => handleChange("furnished", Number(value))}
                            options={FURNISHED_OPTIONS}
                            placeholder="اختر حالة الفرش"
                        />

                        <FormField label="الإطلالة">
                            <SelectField
                                value={editingEstate.facade}
                                onChange={(value) => handleChange('facade', value)}
                                options={VIEW_OPTIONS}
                                placeholder="اختر الإطلالة"
                            />
                        </FormField>

                    </FormField>
                </>
            )}



            {shouldShowRentalField && < FormField label="مدة العقد">
                <SelectField
                    value={editingEstate.rentalDuration}
                    onChange={(value) => handleChange('rentalDuration', Number(value))}
                    options={RENTAL_DURATION_OPTIONS}
                    placeholder="اختر مدة العقد"
                />
            </FormField>
            }
            {/* Always show area */}
            <FormField label="المساحة">
                <InputField
                    type="number"
                    value={editingEstate.buildingArea}
                    onChange={(value) => handleChange("buildingArea", value)}
                    placeholder="المساحة بالمتر المربع"
                />
            </FormField>

            {/* Features */}
            <FormField label="الميزات الاساسية">
                <FeaturesSelect
                    features={FEATURES_BY_TYPE[getPropertyType()]}
                    selectedFeatures={editingEstate.mainFeatures.split("، ").filter(Boolean)}
                    onChange={(features) => handleChange("mainFeatures", features.join("، "))}
                    placeholder="اختر الميزات الأساسية"
                    selectionText={{
                        single: "ميزة أساسية",
                        multiple: "ميزات أساسية"
                    }}
                />
            </FormField>

            <FormField label="الميزات الإضافية">
                <FeaturesSelect
                    features={ADDITIONAL_FEATURES}
                    selectedFeatures={editingEstate.additionalFeatures.split("، ").filter(Boolean)}
                    onChange={(features) => handleChange("additionalFeatures", features.join("، "))}
                    placeholder="اختر الميزات الإضافية"
                    selectionText={{
                        single: "ميزة إضافية",
                        multiple: "ميزات إضافية"
                    }}
                />
            </FormField>

            {/* Image Preview Section */}
            <FormField label="صورة الغلاف الحالية">
                {editingEstate.coverImage ? (
                    <div className="relative inline-block">
                        <a href={`${process.env.NEXT_PUBLIC_API_URL}/${editingEstate.coverImage}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${editingEstate.coverImage}`}
                                alt="Cover Image"
                                className="w-32 h-32 object-cover rounded-md"
                            />
                        </a>
                    </div>
                ) : (
                    <p>لا توجد صورة غلاف</p>
                )}
            </FormField>

            <FormField label="الصور الإضافية الحالية">
                {editingEstate.files && editingEstate.files.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {editingEstate.files.map((file: string, index: number) => (
                            <div key={index} className="relative inline-block">
                                <a href={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
                                        alt={`Additional Image ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>لا توجد صور إضافية</p>
                )}
            </FormField>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                حفظ التعديلات
            </button>
        </form >
    );
};

export default EditEstateForm;