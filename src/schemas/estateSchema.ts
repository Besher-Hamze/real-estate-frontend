import * as yup from 'yup';
import { InferType } from 'yup';

const patterns = {
  arabicText: /^[\u0600-\u06FF\s]+$/,
  numbersOnly: /^\d+$/,
};

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

/**
 * Creates a dynamic validation schema based on filter configuration
 * @param filterConfig - Configuration from the API that dictates which fields are required
 * @returns A Yup validation schema
 */
export const createDynamicEstateSchema = (filterConfig: any = null) => {
  // Default configuration that shows all fields if no filterConfig provided
  const config = filterConfig || {
    title: true,
    description: true,
    price: true,
    viewTime: true,
    paymentMethod: true,
    mainCategoryId: true,
    subCategoryId: true,
    finalTypeId: true,
    cityId: true,
    neighborhoodId: true,
    finalCityId: true,
    nearbyLocations: true,
    location: true,
    bedrooms: true,
    bathrooms: true,
    totalFloors: true,
    floorNumber: true,
    buildingAge: true,
    ceilingHeight: true,
    furnished: true,
    facade: true,
    rentalDuration: true,
    buildingArea: true,
    mainFeatures: true,
    additionalFeatures: true,
    coverImage: true,
    files: true,
  };
  
  // Start with an empty schema
  const schemaFields: Record<string, any> = {
    // Always include buildingItemId
    buildingItemId: yup.string()
  };

  // Add fields based on filter configuration
  if (config.title) {
    schemaFields.title = yup.string().required('عنوان العقار مطلوب');
  } else {
    schemaFields.title = yup.string().nullable();
  }

  if (config.description) {
    schemaFields.description = validationSchemas.requiredText;
  } else {
    schemaFields.description = validationSchemas.text.nullable();
  }

  if (config.price) {
    schemaFields.price = validationSchemas.price;
  } else {
    schemaFields.price = yup.number().nullable();
  }

  if (config.viewTime) {
    schemaFields.viewTime = validationSchemas.requiredText;
  } else {
    schemaFields.viewTime = validationSchemas.text.nullable();
  }

  if (config.paymentMethod) {
    schemaFields.paymentMethod = validationSchemas.features;
  } else {
    schemaFields.paymentMethod = yup.string().nullable();
  }

  if (config.mainCategoryId) {
    schemaFields.mainCategoryId = validationSchemas.requiredSelect;
  } else {
    schemaFields.mainCategoryId = yup.number().nullable();
  }

  if (config.subCategoryId) {
    schemaFields.subCategoryId = validationSchemas.requiredSelect;
  } else {
    schemaFields.subCategoryId = yup.number().nullable();
  }

  if (config.finalTypeId) {
    schemaFields.finalTypeId = validationSchemas.requiredSelect;
  } else {
    schemaFields.finalTypeId = yup.number().nullable();
  }

  if (config.cityId) {
    schemaFields.cityId = validationSchemas.requiredSelect;
  } else {
    schemaFields.cityId = yup.number().nullable();
  }

  if (config.neighborhoodId) {
    schemaFields.neighborhoodId = validationSchemas.requiredSelect;
  } else {
    schemaFields.neighborhoodId = yup.number().nullable();
  }

  if (config.finalCityId) {
    schemaFields.finalCityId = validationSchemas.requiredSelect;
  } else {
    schemaFields.finalCityId = yup.number().nullable();
  }

  // if (config.nearbyLocations) {
  //   schemaFields.nearbyLocations = validationSchemas.features;
  // } else {
  //   schemaFields.nearbyLocations = yup.string().nullable();
  // }
  schemaFields.nearbyLocations = yup.string().nullable();


  // Conditional fields based on whether it's a residential property
  if (config.bedrooms) {
    schemaFields.bedrooms = validationSchemas.bedroomsBathrooms
  } else {
    schemaFields.bedrooms = yup.number().nullable();
  }

  if (config.bathrooms) {
    schemaFields.bathrooms = validationSchemas.bedroomsBathrooms
  } else {
    schemaFields.bathrooms = yup.number().nullable();
  }

  if (config.totalFloors) {
    schemaFields.totalFloors = validationSchemas.positiveNumber
  } else {
    schemaFields.totalFloors = yup.number().nullable();
  }

  if (config.floorNumber) {
    schemaFields.floorNumber = yup.number().min(0, 'يجب اختيار الطابق')
  } else {
    schemaFields.floorNumber = yup.number().nullable();
  }

  if (config.buildingAge) {
    schemaFields.buildingAge = yup.string();
  } else {
    schemaFields.buildingAge = yup.string().nullable();
  }

  if (config.buildingArea) {
    schemaFields.buildingArea = yup.string().required('المساحة مطلوبة');
  } else {
    schemaFields.buildingArea = yup.string().nullable();
  }

  if (config.ceilingHeight) {
    schemaFields.ceilingHeight = validationSchemas.positiveNumber
  } else {
    schemaFields.ceilingHeight = yup.number().nullable();
  }

  if (config.furnished) {
    schemaFields.furnished = yup.number().min(0, 'يرجى تحديد حالة الفرش')
  } else {
    schemaFields.furnished = yup.number().nullable();
  }

  // if (config.facade) {
  //   schemaFields.facade =  yup.string().required('الإطلالة مطلوبة')
  // } else {
  //   schemaFields.facade = yup.string().nullable();
  // }
  schemaFields.facade = yup.string().nullable();


  // if (config.mainFeatures) {
  //   schemaFields.mainFeatures = validationSchemas.features;
  // } else {
  //   schemaFields.mainFeatures = yup.string().nullable();
  // }
  schemaFields.mainFeatures = yup.string().nullable();


  // if (config.additionalFeatures) {
  //   schemaFields.additionalFeatures = validationSchemas.features;
  // } else {
  //   schemaFields.additionalFeatures = yup.string().nullable();
  // }
  schemaFields.additionalFeatures = yup.string().nullable();


  if (config.location) {
    schemaFields.location = yup.string().required('موقع العقار مطلوب');
  } else {
    schemaFields.location = yup.string().nullable();
  }

  if (config.rentalDuration) {
    schemaFields.rentalDuration = yup.string().required('يرجى تحديد مدة العقد')
  } else {
    schemaFields.rentalDuration = yup.string().nullable();
  }

  if (config.coverImage) {
    schemaFields.coverImage = yup.mixed().required('صورة الغلاف مطلوبة');
  } else {
    schemaFields.coverImage = yup.mixed().nullable();
  }

  if (config.files) {
    schemaFields.files = yup.mixed().test({
      name: 'required-files',
      message: 'يجب إضافة صورة واحدة على الأقل',
      test: function(value) {
        // Handle both array and null values
        if (Array.isArray(value)) {
          return value.some(file => file != null);
        } else {
          return value != null;
        }
      }
    });
  } else {
    schemaFields.files = yup.mixed().nullable();
  }

  return yup.object(schemaFields);
};

export type EstateFormData = InferType<ReturnType<typeof createDynamicEstateSchema>>;