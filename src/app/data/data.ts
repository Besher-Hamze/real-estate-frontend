// src/data/properties.ts

export const properties = [
  {
    id: '1',
    title: 'فيلا فاخرة مع مسبح',
    description: 'فيلا حديثة مع تشطيبات فاخرة وإطلالة رائعة',
    price: 2500000,
    location: {
      city: 'الرياض',
      address: 'حي النرجس',
      coordinates: {
        lat: 24.7136,
        lng: 46.6753
      }
    },
    features: {
      bedrooms: 5,
      bathrooms: 6,
      area: 450,
      parking: true
    },
    images: [
      '/images/property-1-1.jpg',
      '/images/property-1-2.jpg',
      '/images/property-1-3.jpg'
    ],
    propertyType: 'villa',
    listingType: 'sale',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'شقة وسط المدينة',
    description: 'شقة حديثة في موقع متميز',
    price: 750000,
    location: {
      city: 'جدة',
      address: 'حي الروضة',
      coordinates: {
        lat: 21.5433,
        lng: 39.1728
      }
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      parking: true
    },
    images: [
      '/images/property-2-1.jpg',
      '/images/property-2-2.jpg'
    ],
    propertyType: 'apartment',
    listingType: 'sale',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const propertyTypes = [
  { id: 'villa', label: 'فيلا' },
  { id: 'apartment', label: 'شقة' },
  { id: 'house', label: 'منزل' },
  { id: 'land', label: 'أرض' }
];

export const cities = [
  'الرياض',
  'جدة',
  'الدمام',
  'مكة',
  'المدينة',
  'الخبر',
  'الطائف',
  'تبوك'
];