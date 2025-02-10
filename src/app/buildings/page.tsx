"use client"
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building } from '@/lib/types';
import Link from 'next/link';
import { 
  Building2, 
  List, 
  Home, 
  ShoppingBag, 
  MapPin 
} from 'lucide-react';
import { buildingApi } from '@/api/buidlingApi';
import { motion } from 'framer-motion';

export default function BuildingsPage() {
    const { data: buildings = [], isLoading, error } = useQuery({
        queryKey: ['buildings'],
        queryFn: buildingApi.fetchBuildings
    });

    if (isLoading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">جارٍ التحميل...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center bg-red-50 p-8 rounded-xl">
                <p className="text-red-500 text-lg mb-4">حدث خطأ في جلب المباني</p>
                <p className="text-gray-600">يرجى المحاولة مرة أخرى لاحقًا</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white container mx-auto px-4 py-8">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">مجمعاتنا العقارية</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    استكشف مجموعة متنوعة من المباني والوحدات العقارية المتاحة
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {buildings.map((building) => (
                    <BuildingCard key={building.id} building={building} />
                ))}
            </div>
        </div>
    );
}

const BuildingCard: React.FC<{ building: Building }> = ({ building }) => {
    const apartmentCount = building.items?.filter(item => item.type === 'apartment').length || 0;
    const shopCount = building.items?.filter(item => item.type === 'shop').length || 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{building.title}</h2>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 ml-2" />
                            <span>{building.location}</span>
                        </div>
                    </div>
                    <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${building.status === 'مكتمل' ? 'bg-green-100 text-green-800' : ''}
                        ${building.status === 'قيد الإنشاء' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${building.status === 'مخطط' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                        {building.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Home className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600">الشقق</p>
                            <p className="text-lg font-bold text-gray-800">{apartmentCount}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600">المحلات</p>
                            <p className="text-lg font-bold text-gray-800">{shopCount}</p>
                        </div>
                    </div>
                </div>

                <Link
                    href={`/buildings/${building.id}`}
                    className="w-full block text-center bg-blue-600 text-white px-6 py-3 rounded-lg 
                    hover:bg-blue-700 transition-colors group-hover:bg-blue-700"
                >
                    <List className="inline-block ml-2 w-5 h-5" />
                    عرض الوحدات
                </Link>
            </div>
        </motion.div>
    );
}