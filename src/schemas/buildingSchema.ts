// schemas/buildingSchema.ts
import * as yup from 'yup';
import { InferType } from 'yup';
import { validationSchemas } from './estateSchema';

// Building schema
export const buildingSchema = yup.object({
  title: validationSchemas.requiredText
    .min(3, 'اسم المبنى يجب أن يكون على الأقل 3 أحرف')
    .max(50, 'اسم المبنى يجب أن لا يتجاوز 50 حرف'),
  status: yup.string().required('حالة المبنى مطلوبة'),
  buildingAge: yup.string(),
  location: yup.string().required('موقع المبنى مطلوب'),
  items: yup.array().of(
    yup.object({
      id: yup.string(),
      name: validationSchemas.requiredText,
      price: validationSchemas.requiredText,
      area: validationSchemas.requiredText,
      type: yup.string().required('نوع الوحدة مطلوب'),
      building_id: yup.string(),
      realestateCount: yup.number()
    })
  )
});

// Building item schema (for individual items)
export const buildingItemSchema = yup.object({
  name: validationSchemas.requiredText
    .min(2, 'اسم الوحدة يجب أن يكون على الأقل حرفين')
    .max(30, 'اسم الوحدة يجب أن لا يتجاوز 30 حرف'),
  price: validationSchemas.requiredText,
  area: validationSchemas.requiredText,
  type: yup.string().required('نوع الوحدة مطلوب')
});

export type BuildingFormData = InferType<typeof buildingSchema>;
export type BuildingItemFormData = InferType<typeof buildingItemSchema>;