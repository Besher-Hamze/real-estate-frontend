// lib/types/filterProperties.ts

export interface FilterProperty {
    id: number;
    finalTypeId: number;
    propertyKey: string;
    propertyName: string;
    groupName: string;
    dataType: 'text' | 'number' | 'single_choice' | 'multiple_choice' | 'boolean' | 'date' | 'file';
    allowedValues: string[] | null;
    isFilter: boolean;
    displayOrder: number;
    isRequired: boolean;
    placeholder: string | null;
    groupSelect: boolean;
    unit: string | null;
    createdAt: string;
    updatedAt: string;
    finalType: {
        id: number;
        subId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
        subType: {
            id: number;
            mainId: number;
            name: string;
            createdAt: string;
            updatedAt: string;
            mainType: {
                id: number;
                name: string;
                icon: string;
                createdAt: string;
                updatedAt: string;
            };
        };
    };
}

export interface FilterGroup {
    groupName: string;
    displayOrder: number;
    properties: FilterProperty[];
}

export interface FilterPropertiesResponse {
    finalTypeId: number;
    finalTypeName: string;
    groups: FilterGroup[];
    totalProperties: number;
    filterableProperties: number;
}
