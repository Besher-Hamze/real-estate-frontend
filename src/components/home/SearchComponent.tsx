"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Search, Key, X } from 'lucide-react';
import Link from 'next/link'; // استيراد Link

export default function SearchComponent() {
    const [activeFilter, setActiveFilter] = useState<any>(null);
    const [selectedType, setSelectedType] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto"
        >
            <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Property Type Select */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pr-1">
                            نوع العقار
                        </label>
                        <div
                            className={`relative rounded-xl transition-all duration-200 ${activeFilter === 'type' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                }`}
                        >
                            <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                className="w-full appearance-none pr-12 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all text-gray-700 font-medium hover:border-blue-300 focus:outline-none"
                                onFocus={() => setActiveFilter('type')}
                                onBlur={() => setActiveFilter(null)}
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="">الكل</option>
                                <option value="villa">فيلا</option>
                                <option value="apartment">شقة</option>
                                <option value="land">أرض</option>
                            </select>
                            {selectedType && (
                                <button
                                    onClick={() => setSelectedType('')}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Location Select */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pr-1">
                            المنطقة
                        </label>
                        <div
                            className={`relative rounded-xl transition-all duration-200 ${activeFilter === 'location' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                }`}
                        >
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                className="w-full appearance-none pr-12 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all text-gray-700 font-medium hover:border-blue-300 focus:outline-none"
                                onFocus={() => setActiveFilter('location')}
                                onBlur={() => setActiveFilter(null)}
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">كل المناطق</option>
                                <option value="muscat">مسقط</option>
                                <option value="salalah">صلالة</option>
                                <option value="sohar">صحار</option>
                            </select>
                            {selectedLocation && (
                                <button
                                    onClick={() => setSelectedLocation('')}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Price Range Select */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pr-1">
                            نطاق السعر
                        </label>
                        <div
                            className={`relative rounded-xl transition-all duration-200 ${activeFilter === 'price' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                }`}
                        >
                            <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                className="w-full appearance-none pr-12 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all text-gray-700 font-medium hover:border-blue-300 focus:outline-none"
                                onFocus={() => setActiveFilter('price')}
                                onBlur={() => setActiveFilter(null)}
                                value={selectedPrice}
                                onChange={(e) => setSelectedPrice(e.target.value)}
                            >
                                <option value="">كل الأسعار</option>
                                <option value="100-200">100,000 - 200,000 ر.ع</option>
                                <option value="200-300">200,000 - 300,000 ر.ع</option>
                                <option value="300+">أكثر من 300,000 ر.ع</option>
                            </select>
                            {selectedPrice && (
                                <button
                                    onClick={() => setSelectedPrice('')}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="relative flex flex-col justify-end">
                        <Link href={'/properties'} passHref>
                            <motion.a
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gradient-to-l from-blue-600 to-blue-500 text-white p-4 h-[58px] rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 cursor-pointer"
                            >
                                <Search className="w-5 h-5" />
                                <span className="font-medium">بحث العقارات</span>
                            </motion.a>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}