"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, Trash2, Filter, Grid3X3, List, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ScrollToTop from "@/components/widgets/ScrollToTop";
import { RealEstateData } from "@/lib/types";
import { useRealEstate } from "@/lib/hooks/useRealEstate";
import { useMainType } from "@/lib/hooks/useMainType";
import PropertyCard from "@/components/widgets/PropertyGrid/PropertyCard";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<RealEstateData[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');

  const {
    realEstateData = [],
    isLoading: isLoadingRealEstate,
  } = useRealEstate();

  const {
    mainTypes = [],
    isLoading: isLoadingMainTypes,
  } = useMainType();

  // Load favorite IDs from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      const stored = localStorage.getItem('favorites');
      const parsedFavorites = stored ? JSON.parse(stored) : [];
      setFavoriteIds(parsedFavorites);
    };

    loadFavorites();

    // Add event listener to update favorites in real-time across tabs
    window.addEventListener('storage', loadFavorites);

    return () => {
      window.removeEventListener('storage', loadFavorites);
    };
  }, []);

  // Filter real estate data to get favorites
  useEffect(() => {
    if (realEstateData.length > 0 && favoriteIds.length > 0) {
      const favoriteProperties = realEstateData.filter(item =>
        favoriteIds.includes(item.id)
      );
      setFavorites(favoriteProperties);
    } else {
      setFavorites([]);
    }
  }, [realEstateData, favoriteIds]);

  // Function to remove from favorites
  const removeFromFavorites = (id: number) => {
    const updatedFavorites = favoriteIds.filter(favId => favId !== id);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavoriteIds(updatedFavorites);

    // Dispatch storage event to update other tabs
    window.dispatchEvent(new Event('storage'));
  };

  // Clear all favorites
  const clearAllFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify([]));
    setFavoriteIds([]);

    // Dispatch storage event to update other tabs
    window.dispatchEvent(new Event('storage'));
  };

  // Get the main type for each property
  const getMainTypeForProperty = (mainTypeId: number) => {
    const mainType = mainTypes.find(type => type.id === mainTypeId);
    return mainType;
  };

  // Filter favorites by search term
  const filteredFavorites = favorites.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.neighborhoodName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort favorites
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'latest':
      default:
        // Assuming higher ID means more recent
        return b.id - a.id;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section with Gradient Overlay */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-2">
            <Link href="/" className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">العقارات المفضلة</h1>
          <p className="text-white/80 text-lg mb-8">العقارات التي اخترتها ضمن قائمة المفضلة</p>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 -mb-16 relative z-10">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن عقار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pr-10 pl-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </div>
        </div>
      </div>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {favorites.length > 0
                  ? `${favorites.length} عقار في المفضلة`
                  : 'قائمة المفضلة'
                }
              </h2>
              {filteredFavorites.length !== favorites.length && (
                <p className="text-sm text-gray-500">
                  تم عرض {filteredFavorites.length} من أصل {favorites.length}
                </p>
              )}
            </div>
          </div>

          {/* Favorites Content */}
          <AnimatePresence>
            {isLoadingRealEstate || isLoadingMainTypes ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-blue-200 rounded w-32 mb-3"></div>
                  <div className="h-3 bg-blue-100 rounded w-24"></div>
                </div>
              </div>
            ) : sortedFavorites.length > 0 ? (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col gap-4"
              }>
                {sortedFavorites.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={viewMode === 'list' ? "w-full" : ""}
                  >
                    <PropertyCard
                      key={item.id}
                      item={item}
                      mainType={getMainTypeForProperty(item.mainCategoryId)}
                    />
                    {viewMode === 'list' && <hr className="mt-6 border-gray-100" />}
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
              >
                <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-blue-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {searchTerm ? 'لا توجد نتائج مطابقة' : 'قائمة المفضلة فارغة'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? 'لا توجد عقارات تطابق معايير البحث الحالية، جرب تعديل البحث أو مسح الفلتر.'
                      : 'لم تقم بإضافة أي عقارات إلى قائمة المفضلة بعد.'}
                  </p>

                  {searchTerm ? (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      عرض جميع المفضلة
                    </button>
                  ) : (
                    <Link
                      href="/"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      تصفح العقارات
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <ScrollToTop />
    </div>
  );
}