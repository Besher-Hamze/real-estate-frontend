export interface UpdateMainTypeForm {
    name?: string;
    icon?: string;
}

export interface UpdateCity {
    name?: string;
}

export interface UpdateNeighborhood {
    name?: string;
}

export interface UpdateSubTypeForm {
    name?: string;
    mainId?: number;
}


export interface UpdateFinalTypeForm {
    name?: string;
}

export interface UpdateEstateForm {
    title: string;
    price: number;
    cityId: number;
    neighborhoodId: number;
    bedrooms: number;
    bathrooms: number;
    furnished: boolean;
    buildingArea: string;
    floorNumber: string;
    facade: string;
    paymentMethod: string;
    mainCategoryId: number;
    subCategoryId: number;
    mainFeatures: string;
    additionalFeatures: string;
    nearbyLocations: string;
    coverImage: File | null;
    files: File[] | null;
}





