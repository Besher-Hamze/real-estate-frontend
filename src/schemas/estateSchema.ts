import * as yup from 'yup';
import { InferType } from 'yup';

// Common validation patterns
const patterns = {
  arabicText: /^[\u0600-\u06FF\s]+$/,
  numbersOnly: /^\d+$/,
};

// Base validation schemas that can be reused across forms
export const validationSchemas = {
  text: yup.string().trim(),
  requiredText: yup.string().trim().required('هذا الحقل مطلوب'),
  arabicText: yup.string().matches(patterns.arabicText, 'يجب إدخال نص باللغة العربية فقط'),
  requiredArabicText: yup.string().matches(patterns.arabicText, 'يجب إدخال نص باللغة العربية فقط').required('هذا الحقل مطلوب'),
  number: yup.number().typeError('يجب إدخال رقم صحيح'),
  positiveNumber: yup.number().typeError('يجب إدخال رقم صحيح').positive('يجب أن يكون الرقم موجب'),
  requiredPositiveNumber: yup.number().typeError('يجب إدخال رقم صحيح').positive('يجب أن يكون الرقم موجب').required('هذا الحقل مطلوب'),
  requiredSelect: yup.number().min(1, 'يرجى اختيار قيمة').required('هذا الحقل مطلوب'),
  price: yup.number().typeError('يجب إدخال سعر صحيح').positive('يجب أن يكون السعر موجب').required('السعر مطلوب'),
  requiredFile: yup.mixed().required('الملف مطلوب'),
  bedroomsBathrooms: yup.number().min(1, 'يجب أن لا يقل عن 1').required('هذا الحقل مطلوب'),
  features: yup.string().test({
    name: 'min-features',
    message: 'يرجى اختيار واحدة على الأقل',
    test: function (value) {
      return value ? value.split('، ').filter(Boolean).length > 0 : false;
    }
  }),

};


// City Form
export const citySchema = yup.object({
  name: validationSchemas.requiredText,
});

export type CityFormData = InferType<typeof citySchema>;

// Estate Form
export const estateSchema = yup.object({
  title: yup.string().required('عنوان العقار مطلوب'),
  description: validationSchemas.requiredText,
  price: validationSchemas.price,
  viewTime: validationSchemas.requiredText,
  paymentMethod: validationSchemas.features,
  mainCategoryId: validationSchemas.requiredSelect,
  subCategoryId: validationSchemas.requiredSelect,
  finalTypeId: validationSchemas.requiredSelect,
  cityId: validationSchemas.requiredSelect,
  neighborhoodId: validationSchemas.requiredSelect,
  finalCity:validationSchemas.requiredSelect,
  nearbyLocations: validationSchemas.features,
  bedrooms: yup.number().when('$isResidential', {
    is: true,
    then: () => validationSchemas.bedroomsBathrooms,
    otherwise: () => yup.number().nullable()
  }),
  bathrooms: yup.number().when('$isResidential', {
    is: true,
    then: () => validationSchemas.bedroomsBathrooms,
    otherwise: () => yup.number().nullable()
  }),
  totalFloors: yup.number().when('$isResidential', {
    is: true,
    then: () => validationSchemas.positiveNumber,
    otherwise: () => yup.number().nullable()
  }),
  floorNumber: yup.number().when('$isResidential', {
    is: true,
    then: () => yup.number().min(0, 'يجب اختيار الطابق'),
    otherwise: () => yup.number().nullable()
  }),
  buildingArea: yup.string().required('المساحة مطلوبة'),
  ceilingHeight: yup.number().when('$isResidential', {
    is: true,
    then: () => validationSchemas.positiveNumber,
    otherwise: () => yup.number().nullable()
  }),
  furnished: yup.number().when('$isResidential', {
    is: true,
    then: () => yup.number().min(0, 'يرجى تحديد حالة الفرش'),
    otherwise: () => yup.number().nullable()
  }),
  facade: yup.string().when('$isResidential', {
    is: true,
    then: () => yup.string().required('الإطلالة مطلوبة'),
    otherwise: () => yup.string().nullable()
  }),
  mainFeatures: validationSchemas.features,
  additionalFeatures: validationSchemas.features,
  location: yup.string().required('موقع العقار مطلوب'),
  rentalDuration: yup.string().when('$isRental', {
    is: true,
    then: () => yup.string().required('يرجى تحديد مدة العقد'),
    otherwise: () => yup.string().nullable()
  }),
  coverImage: yup.mixed().required('صورة الغلاف مطلوبة'),
  files: yup.array().min(1, 'يجب إضافة صورة واحدة على الأقل')
});

export type EstateFormData = InferType<typeof estateSchema>;

// Helper function to create context for conditional validation
export const createValidationContext = (formData: any) => {
  return {
    isResidential: !isLandType(formData),
    isRental: isRentalType(formData)
  };
};

// Helper functions for estate form
function isLandType(formData: any) {
  // This is a simplified version - adapt to your actual logic
  return formData.finalTypeId && String(formData.finalTypeId).includes('أرض');
}

function isRentalType(formData: any) {
  // This is a simplified version - adapt to your actual logic
  return formData.mainCategoryId && String(formData.mainCategoryId).includes('إيجار');
}