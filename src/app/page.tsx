"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Home,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ArrowUp,
  Loader2,
  SearchX,
  X,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/home/Footer";
import FilterSection, { Filters } from "@/components/home/FilterSection";

import { useMainType } from "@/lib/hooks/useMainType";
import { MainType, SubType, RealEstateData } from "@/lib/types";

// UPDATED Interface reference:

import { useRealEstate } from "@/lib/hooks/useRealEstate";

// Loading Skeleton Components
const CategorySkeleton = () => (
  <div className="px-8 py-4 rounded-xl bg-gray-200 animate-pulse">
    <div className="w-24 h-6 bg-gray-300 rounded"></div>
  </div>
);

const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-lg">
    <div className="h-64 bg-gray-200 animate-pulse"></div>
    <div className="p-6 space-y-4">
      <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded"></div>
      <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
        <div className="w-24 h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    </div>
  </div>
);

// Filter Chip
const FilterChip = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
    {label}
    <button onClick={onRemove} className="hover:text-blue-900">
      <X className="w-4 h-4" />
    </button>
  </span>
);

interface PropertyCardProps {
  item: RealEstateData;
  mainType: MainType | undefined;
  selectedSubType: SubType | undefined;
}

export default function PremiumLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedMainTypeId, setSelectedMainTypeId] = useState<number | null>(
    null
  );
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<number | null>(
    null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [filters, setFilters] = useState<Filters>({
    bedrooms: "",
    propertySize: "",
    finalType: "",
    bathrooms: "",
    city: "",
    floor: "",
    isFurnished: false,
    neighborhood: "",
    rentalPeriod: "",
    view: "",
    buildingArea: "",
  });

  const {
    mainTypes = [],
    isLoading: isLoadingMainTypes,
    isError: isMainTypesError,
    refetch: refetchMainTypes,
  } = useMainType();

  const {
    realEstateData = [],
    isLoading: isLoadingRealEstate,
    isError: isRealEstateError,
    refetch: refetchRealEstate,
  } = useRealEstate();

  // Reset all filters
  const resetFilters = () => {
    setSelectedMainTypeId(null);
    setSelectedSubTypeId(null);
    setFilters({
      bedrooms: "",
      propertySize: "",
      finalType: "",
      bathrooms: "",
      city: "",
      floor: "",
      isFurnished: false,
      neighborhood: "",
      rentalPeriod: "",
      view: "",
      buildingArea: "",
    });
    setPriceRange([0, 1000000]);
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-select the first MainType if none is selected
  useEffect(() => {
    if (mainTypes?.length > 0 && !selectedMainTypeId) {
      setSelectedMainTypeId(mainTypes[0].id);
      if (mainTypes[0].subtypes[0]) {
        setSelectedSubTypeId(mainTypes[0].subtypes[0].id);
      } else {
        setSelectedSubTypeId(null);
      }
    }
  }, [mainTypes, selectedMainTypeId]);

  // Current mainType/subType objects
  const currentMainType = mainTypes.find(
    (type) => type.id === selectedMainTypeId
  );
  const currentSubType = currentMainType?.subtypes?.find(
    (subType) => subType.id === selectedSubTypeId
  );

  // Filter the realEstateData based on UI selection
  const filteredRealEstateData = useMemo(() => {
    return realEstateData.filter((item) => {

      // 1) mainCategoryId
      if (selectedMainTypeId && item.mainCategoryId !== selectedMainTypeId) {
        return false;
      }
      // 2) subCategoryId
      if (selectedSubTypeId && item.subCategoryId !== selectedSubTypeId) {
        return false;
      }
      // 3) finalTypeId
      if ((filters.finalType && filters.finalType != "") && item.finalTypeId !== parseInt(filters.finalType)) {
        return false;
      }
      // 3) priceRange
      if (item.price < priceRange[0] || item.price > priceRange[1]) {
        return false;
      }
      // 4) bedrooms
      if (filters.bedrooms && item.bedrooms.toString() !== filters.bedrooms) {
        return false;
      }
      // 5) propertySize (buildingArea)
      if (filters.propertySize) {
        const area = parseFloat(item.buildingArea);
        switch (filters.propertySize) {
          case "small":
            if (area >= 100) return false;
            break;
          case "medium":
            if (area < 100 || area >= 200) return false;
            break;
          case "large":
            if (area < 200 || area >= 300) return false;
            break;
          case "xlarge":
            if (area < 300) return false;
            break;
        }
      }
      // 6) Bathrooms
      if (filters.bathrooms && item.bathrooms.toString() !== filters.bathrooms) {
        return false;
      }
      // 8) City
      if (filters.city && filters.city !== "") {
        if (item.cityId != parseInt(filters.city)) {
          return false;
        }
      }

      // 9) Neighborhood
      if (filters.neighborhood && filters.neighborhood !== "") {
        if (item.neighborhoodId != parseInt(filters.neighborhood)) {
          return false;
        }
      }

      // 10) Furnished Status
      if (filters.isFurnished && !item.furnished) {
        return false;
      }

      // 11) Rental Period
      if (filters.rentalPeriod && filters.rentalPeriod !== "") {
        if (item.rentalDuration !== parseInt(filters.rentalPeriod)) {
          return false;
        }
      }

      // 12) Floor Number
      if (filters.floor && filters.floor !== "") {
        if (item.floorNumber !== parseInt(filters.floor)) {
          return false;
        }
      }

      // 13) View/Facade
      if (filters.view && filters.view !== "") {
        if (item.facade.toLowerCase() !== filters.view.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [realEstateData, selectedMainTypeId, selectedSubTypeId, priceRange, filters]);

  // Function to dynamically get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Building2: Building2,
      Home: Home,
    };
    return icons[iconName] || Building2;
  };

  // Category Button
  const CategoryButton = ({ mainType }: { mainType: MainType }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setSelectedMainTypeId(mainType.id);
          if (mainType.subtypes[0]) {
            setSelectedSubTypeId(mainType.subtypes[0].id);
          } else {
            setSelectedSubTypeId(null);
          }
        }}
        className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${selectedMainTypeId === mainType.id
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
          }`}
      >
        {!imageError ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${mainType.icon}`}
            alt={mainType.name}
            className="w-5 h-5 object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Building2 className="w-5 h-5 text-white" />
        )}
        {mainType.name}
      </motion.button>
    );
  };


  // Updated PropertyCard with camelCase usage
  const PropertyCard = ({
    item,
    mainType,
    selectedSubType,
  }: PropertyCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
    >
      <div className="relative h-64">
        <Image
          // coverImage instead of cover_image
          src={
            item.coverImage
              ? `${process.env.NEXT_PUBLIC_API_URL}/${item.coverImage}`
              : "/images/bg-real.jpg"
          }
          alt={item.title}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
          {mainType?.name}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span>
            {item.cityName} - {item.neighborhoodName}
          </span>
        </div>
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-4">
          {
            (item.subCategoryName != "أرض" && item.finalTypeName != "أرض") && <>
              <div className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-black font-medium">
                  {item.bedrooms}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-black font-medium">
                  {item.bathrooms}
                </span>
              </div>
            </>
          }          <div className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-black font-medium">
              {item.buildingArea} م²
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">السعر</span>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-blue-600">
                {item.price.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-gray-600">ر.ع</span>
            </div>
          </div>
          <Link
            href={`/properties/${item.id}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            التفاصيل
          </Link>
        </div>
      </div>
    </motion.div>
  );

  // Error States
  if (isMainTypesError || isRealEstateError) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 mb-4">حدث خطأ في تحميل البيانات</p>
          <button
            onClick={() => {
              refetchMainTypes();
              refetchRealEstate();
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <HeroSection />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              اكتشف عقارات مميزة
            </h2>
            <p className="text-gray-600 text-lg">
              اختر من مجموعة واسعة من العقارات المميزة
            </p>
          </motion.div>

          {/* Categories Section */}
          <div className="flex justify-center gap-4 mb-8 overflow-x-auto pb-4">
            {isLoadingMainTypes ? (
              <>
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
              </>
            ) : (
              mainTypes?.map((mainType) => (
                <CategoryButton key={mainType.id} mainType={mainType} />
              ))
            )}
          </div>

          {/* SubTypes Section */}
          {currentMainType && !isLoadingMainTypes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-lg mb-8"
            >
              <div className="flex flex-wrap gap-3 justify-center">
                {currentMainType.subtypes?.map((subType) => (
                  <motion.button
                    key={subType.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSubTypeId(subType.id)}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${selectedSubTypeId === subType.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {subType.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <FilterSection
            filters={filters}
            setFilters={setFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            subId={selectedSubTypeId}
          />

          {/* Active Filters */}
          {(selectedMainTypeId ||
            selectedSubTypeId ||
            filters.bedrooms ||
            filters.propertySize ||
            priceRange[0] > 0 ||
            priceRange[1] < 1000000) && (
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span className="text-gray-600 text-sm">الفلاتر النشطة:</span>
                {selectedMainTypeId && (
                  <FilterChip
                    label={currentMainType?.name || ""}
                    onRemove={() => setSelectedMainTypeId(null)}
                  />
                )}
                {(selectedSubTypeId && currentSubType) && (
                  <FilterChip
                    label={currentSubType?.name || ""}
                    onRemove={() => setSelectedSubTypeId(null)}
                  />
                )}
                {filters.bedrooms && (
                  <FilterChip
                    label={`${filters.bedrooms
                      } ${parseInt(filters.bedrooms) === 1 ? "غرفة" : "غرف"}`}
                    onRemove={() => setFilters({ ...filters, bedrooms: "" })}
                  />
                )}
                {filters.propertySize && (
                  <FilterChip
                    label={
                      filters.propertySize === "small"
                        ? "أقل من 100م²"
                        : filters.propertySize === "medium"
                          ? "100م² - 200م²"
                          : filters.propertySize === "large"
                            ? "200م² - 300م²"
                            : "أكثر من 300م²"
                    }
                    onRemove={() => setFilters({ ...filters, propertySize: "" })}
                  />
                )}
                {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                  <FilterChip
                    label={`${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()} ر.ع`}
                    onRemove={() => setPriceRange([0, 1000000])}
                  />
                )}
                <button
                  onClick={resetFilters}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  مسح الكل
                </button>
              </div>
            )}

          {/* Results Count */}
          <div className="mb-4 text-gray-600 text-sm">
            إجمالي النتائج: {filteredRealEstateData.length} عقار
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingRealEstate ? (
              <>
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </>
            ) : filteredRealEstateData.length > 0 ? (
              filteredRealEstateData.map((item) => (
                <PropertyCard
                  key={item.id}
                  item={item}
                  mainType={currentMainType}
                  selectedSubType={currentSubType}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <SearchX className="w-12 h-12 text-gray-400" />
                  <p className="text-gray-600 text-lg">
                    لا توجد عقارات تطابق معايير البحث
                  </p>
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 left-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
