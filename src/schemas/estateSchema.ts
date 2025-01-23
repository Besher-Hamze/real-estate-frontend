// // schemas/estateSchema.ts
// import * as yup from 'yup';

// export const estateSchema = yup.object({
//     title: yup.string().required('العنوان مطلوب'),
//     price: yup.number().required('السعر مطلوب').min(0, 'السعر يجب أن يكون أكبر من 0'),
//     city_id: yup.number().required('المدينة مطلوبة'),
//     neighborhood_id: yup.number().required('الحي مطلوب'),
//     // ... add other validations
// });