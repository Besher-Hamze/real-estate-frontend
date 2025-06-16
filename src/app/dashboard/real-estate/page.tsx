'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RealEstateData } from '@/lib/types';
import { RealEstateApi } from '@/api/realEstateApi';
import {
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    MapPin,
    Calendar,
    DollarSign,
    Home,
    Filter,
    MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function RealEstateListPage() {
    const [realEstates, setRealEstates] = useState<RealEstateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRealEstates, setFilteredRealEstates] = useState<RealEstateData[]>([]);

    // جلب البيانات عند التحميل
    useEffect(() => {
        const fetchRealEstates = async () => {
            try {
                const data = await RealEstateApi.fetchAll();
                setRealEstates(data);
                setFilteredRealEstates(data);
            } catch (error) {
                console.error('Error fetching real estates:', error);
                toast.error('حدث خطأ في جلب العقارات');
            } finally {
                setLoading(false);
            }
        };

        fetchRealEstates();
    }, []);

    // البحث والفلترة
    useEffect(() => {
        const filtered = realEstates.filter(estate =>
            estate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            estate.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            estate.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            estate.neighborhoodName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRealEstates(filtered);
    }, [searchTerm, realEstates]);

    // حذف عقار
    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) {
            return;
        }

        try {
            await RealEstateApi.delete(id);
            setRealEstates(prev => prev.filter(estate => estate.id !== id));
            toast.success('تم حذف العقار بنجاح');
        } catch (error) {
            console.error('Error deleting real estate:', error);
            toast.error('حدث خطأ في حذف العقار');
        }
    };

    // تنسيق السعر
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(price);
    };

    // تنسيق التاريخ
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">جاري تحميل العقارات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">إدارة العقارات</h1>
                            <p className="text-gray-600">عرض وإدارة جميع العقارات المضافة</p>
                        </div>
                        <Link href="/dashboard/real-estate/create">
                            <Button className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                إضافة عقار جديد
                            </Button>
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="البحث في العقارات..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    فلتر
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Home className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">إجمالي العقارات</p>
                                    <p className="text-2xl font-bold text-gray-900">{realEstates.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">للبيع</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {realEstates.filter(e => e.mainCategoryName === 'بيع').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">للإيجار</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {realEstates.filter(e => e.mainCategoryName === 'إيجار').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">مدن مختلفة</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Set(realEstates.map(e => e.cityName)).size}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Real Estate List */}
                {filteredRealEstates.length === 0 ? (
                    <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm ? 'لا توجد عقارات مطابقة للبحث' : 'لا توجد عقارات'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm
                                    ? 'جرب البحث بكلمات مفتاحية أخرى'
                                    : 'ابدأ بإضافة أول عقار لك'
                                }
                            </p>
                            {!searchTerm && (
                                <Link href="/dashboard/real-estate/create">
                                    <Button className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        إضافة عقار جديد
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredRealEstates.map((estate) => (
                            <Card key={estate.id} className="hover:shadow-lg transition-shadow">
                                <div className="relative">
                                    {estate.coverImage ? (
                                        <img
                                            src={estate.coverImage}
                                            alt={estate.title}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                            <Home className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Actions Menu */}
                                    <div className="absolute top-3 right-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/properties/${estate.id}`} className="flex items-center gap-2">
                                                        <Eye className="w-4 h-4" />
                                                        عرض
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/real-estate/edit/${estate.id}`} className="flex items-center gap-2">
                                                        <Edit className="w-4 h-4" />
                                                        تعديل
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(estate.id)}
                                                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    حذف
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Type Badge */}
                                    <div className="absolute top-3 left-3">
                                        <Badge variant={estate.mainCategoryName === 'بيع' ? 'default' : 'secondary'}>
                                            {estate.mainCategoryName}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                                                {estate.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                {estate.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{estate.cityName} - {estate.neighborhoodName}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {formatPrice(estate.price)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatDate(estate.createdAt)}
                                            </div>
                                        </div>

                                        {/* Property Details */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                                            {estate.bedrooms && (
                                                <div className="flex items-center gap-1">
                                                    <Home className="w-4 h-4" />
                                                    <span>{estate.bedrooms} غرف</span>
                                                </div>
                                            )}
                                            {estate.bathrooms && (
                                                <div className="flex items-center gap-1">
                                                    <span>{estate.bathrooms} حمام</span>
                                                </div>
                                            )}
                                            {estate.buildingArea && (
                                                <div className="flex items-center gap-1">
                                                    <span>{estate.buildingArea} م²</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Final Type */}
                                        {estate.finalTypeName && (
                                            <div className="pt-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {estate.finalTypeName}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination - يمكن إضافة هذا لاحقاً */}
                {filteredRealEstates.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <p className="text-sm text-gray-600">
                            عرض {filteredRealEstates.length} من إجمالي {realEstates.length} عقار
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
