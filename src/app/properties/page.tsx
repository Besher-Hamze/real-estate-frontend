'use client';

import React, { useState, useEffect } from 'react';
import { DynamicFilter } from '@/components/dynamic-form';
import { RealEstateData, DynamicFormData } from '@/lib/types';
import { RealEstateApi } from '@/api/realEstateApi';
import { Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Spinner from '@/components/ui/Spinner';
import SearchBar from '@/components/home/SearchBar';
import PropertyCard from '@/components/widgets/PropertyGrid/PropertyCard';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'price_low' | 'price_high' | 'area_large' | 'area_small';

export default function PropertiesPage() {
    const [properties, setProperties] = useState<RealEstateData[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<RealEstateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortOption, setSortOption] = useState<SortOption>('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<DynamicFormData & {
        mainTypeId?: number;
        subTypeId?: number;
        finalTypeId?: number;
        minPrice?: number;
        maxPrice?: number;
    }>({});

    const itemsPerPage = 12;

    // جلب الإعلانات عند التحميل
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const data = await RealEstateApi.fetchAll();
                setProperties(data);
                setFilteredProperties(data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    // تطبيق الفلاتر والبحث والترتيب
    useEffect(() => {
        let filtered = [...properties];

        // البحث النصي
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(property =>
                property.title.toLowerCase().includes(query) ||
                property.description.toLowerCase().includes(query) ||
                property.cityName.toLowerCase().includes(query) ||
                property.neighborhoodName.toLowerCase().includes(query)
            );
        }

        // الفلاتر الأساسية
        if (activeFilters.mainTypeId) {
            filtered = filtered.filter(p => p.mainCategoryId === activeFilters.mainTypeId);
        }
        if (activeFilters.subTypeId) {
            filtered = filtered.filter(p => p.subCategoryId === activeFilters.subTypeId);
        }
        if (activeFilters.finalTypeId) {
            filtered = filtered.filter(p => p.finalTypeId === activeFilters.finalTypeId);
        }
        if (activeFilters.minPrice) {
            filtered = filtered.filter(p => p.price >= activeFilters.minPrice!);
        }
        if (activeFilters.maxPrice) {
            filtered = filtered.filter(p => p.price <= activeFilters.maxPrice!);
        }

        // الفلاتر الديناميكية (هنا يجب أن تطبق الفلاتر حسب الخصائص الديناميكية)
        // هذا يتطلب تحديث في API لدعم الفلاتر الديناميكية

        // الترتيب
        switch (sortOption) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'price_low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'area_large':
                filtered.sort((a, b) => {
                    const aArea = parseFloat(a.buildingArea) || 0;
                    const bArea = parseFloat(b.buildingArea) || 0;
                    return bArea - aArea;
                });
                break;
            case 'area_small':
                filtered.sort((a, b) => {
                    const aArea = parseFloat(a.buildingArea) || 0;
                    const bArea = parseFloat(b.buildingArea) || 0;
                    return aArea - bArea;
                });
                break;
        }

        setFilteredProperties(filtered);
        setCurrentPage(1); // إعادة تعيين الصفحة عند تغيير الفلاتر
    }, [properties, searchQuery, activeFilters, sortOption]);

    // حساب الإعلانات للصفحة الحالية
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProperties = filteredProperties.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

    // معالجة تغيير الفلاتر
    const handleFilterChange = (filters: typeof activeFilters) => {
        setActiveFilters(filters);
    };

    // مسح جميع الفلاتر
    const clearAllFilters = () => {
        setActiveFilters({});
        setSearchQuery('');
    };

    // حساب عدد الفلاتر النشطة
    const getActiveFiltersCount = () => {
        let count = 0;
        if (activeFilters.mainTypeId) count++;
        if (activeFilters.subTypeId) count++;
        if (activeFilters.finalTypeId) count++;
        if (activeFilters.minPrice) count++;
        if (activeFilters.maxPrice) count++;

        // عد الفلاتر الديناميكية
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (!['mainTypeId', 'subTypeId', 'finalTypeId', 'minPrice', 'maxPrice'].includes(key)) {
                if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                    count++;
                }
            }
        });

        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="ابحث عن الإعلانات..."
                        />

                        {/* Controls */}
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Toggle Filters */}
                                <Button
                                    variant={showFilters ? "default" : "outline"}
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2"
                                >
                                    <Filter className="w-4 h-4" />
                                    فلتر
                                    {activeFiltersCount > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {activeFiltersCount}
                                        </Badge>
                                    )}
                                </Button>

                                {/* Clear Filters */}
                                {activeFiltersCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        onClick={clearAllFilters}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        مسح الفلاتر
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort Options */}
                                <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="ترتيب حسب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">الأحدث أولاً</SelectItem>
                                        <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                                        <SelectItem value="price_low">السعر: الأقل أولاً</SelectItem>
                                        <SelectItem value="price_high">السعر: الأعلى أولاً</SelectItem>
                                        <SelectItem value="area_large">المساحة: الأكبر أولاً</SelectItem>
                                        <SelectItem value="area_small">المساحة: الأصغر أولاً</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* View Mode Toggle */}
                                <div className="flex border rounded-lg">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-r-none"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-l-none"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <div className="w-80 flex-shrink-0">
                            <DynamicFilter
                                onFilterChange={handleFilterChange}
                                className="sticky top-8"
                            />
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    الإعلانات المتاحة
                                </h1>
                                <Badge variant="outline" className="text-sm">
                                    {filteredProperties.length} عقار
                                </Badge>
                            </div>
                        </div>

                        {/* Properties Grid/List */}
                        {currentProperties.length > 0 ? (
                            <div className={`
                                ${viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                    : 'space-y-6'
                                }
                            `}>
                                {currentProperties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        item={property}
                                        mainType={undefined}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title={searchQuery || activeFiltersCount > 0
                                    ? "لا توجد عقارات مطابقة"
                                    : "لا توجد عقارات متاحة"
                                }
                                description={searchQuery || activeFiltersCount > 0
                                    ? "جرب تعديل معايير البحث أو الفلاتر"
                                    : "لم يتم إضافة أي عقارات بعد"
                                }
                                actionLabel={searchQuery || activeFiltersCount > 0 ? "مسح الفلاتر" : undefined}
                                onAction={searchQuery || activeFiltersCount > 0 ? clearAllFilters : undefined}
                            />
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={filteredProperties.length}
                                    itemsPerPage={itemsPerPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
