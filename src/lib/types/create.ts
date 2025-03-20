export interface CreateMainTypeForm {
    name: string;
    icon: string;
}

export interface CreateCity {
    name: string;
}

export interface CreateNeighborhood {
    cityId: number;
    name: string;
}
export interface CreateFinalCity {
    neighborhoodId: number;
    name: string;
    location: string;
}

export interface CreateSubTypeForm {
    name: string;
    mainId: number;
}


export interface CreateFinalTypeForm {
    name: string;
    subId: number;
}

export interface CreateEstateForm {
    title: string;
    price: number;
    description: string;
    cityId: number;
    neighborhoodId: number;
    finalCityId: number;
    bedrooms: number;
    bathrooms: number;
    furnished: number;
    buildingArea: string;
    floorNumber: number;
    facade: string;
    paymentMethod: string;
    mainCategoryId: number;
    subCategoryId: number;
    finalTypeId: number;
    mainFeatures: string;
    additionalFeatures: string;
    nearbyLocations: string;
    coverImage: File | null;
    files: File[] | null;
    rentalDuration: string;
    ceilingHeight: number;
    buildingAge: string;
    totalFloors: number;
    viewTime: string;
    buildingItemId: string;
    location: string;
}





