// config/dashboardConfig.ts
import { Building2, Home } from 'lucide-react';

export const DASHBOARD_TABS = {
    MAIN_TYPE: 'mainType',
    SUB_TYPE: 'subType',
    ESTATE: 'estate'
} as const;

export const INITIAL_ESTATE_FORM = {
    title: '',
    price: 0,
    city_id: 1,
    neighborhood_id: 1,
    bedrooms: 1,
    bathrooms: 1,
    furnished: false,
    building_area: '',
    floor_number: '',
    facade: '',
    payment_method: '',
    main_category_id: 1,
    sub_category_id: 2,
    main_features: '',
    additional_features: '',
    nearby_locations: '',
    cover_image: null,
    files: null
};

export const ICONS = {
    Building2,
    Home
};