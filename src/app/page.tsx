"use client";
import { useState, useEffect, useMemo, JSX } from "react";
import { motion } from "framer-motion";
import { Filters, SortOption, FinalType } from "@/lib/types";
import { useMainType } from "@/lib/hooks/useMainType";
import { useRealEstate } from "@/lib/hooks/useRealEstate";
import { finalTypeTypeApi } from "@/api/finalTypeApi";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/home/Footer";
import FilterSection from "@/components/home/FilterSection";
import CategorySelector from "@/components/widgets/CategorySelector";
import SubTypeSelector from "@/components/widgets/SubTypeSelector";
import ScrollToTop from "@/components/widgets/ScrollToTop";
import { filterRealEstateData, initialFilterState, initialSortOption } from "@/utils/filterUtils";
import PropertyMapGrid from "@/components/widgets/PropertyGrid/PropertyMapGrid";
import FinalTypeSelector from "@/components/widgets/FinalTypeButton";

export default function PremiumLanding(): JSX.Element {
  const [selectedMainTypeId, setSelectedMainTypeId] = useState<number | null>(null);
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<number | null>(null);
  const [selectedFinalTypeId, setSelectedFinalTypeId] = useState<number | null>(null); // New state
  const [finalTypes, setFinalTypes] = useState<FinalType[]>([]); // New state
  const [isLoadingFinalTypes, setIsLoadingFinalTypes] = useState(false); // New state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [filters, setFilters] = useState<Filters>(initialFilterState);
  const [sortOption, setSortOption] = useState<SortOption>(initialSortOption);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

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

  const resetFilters = () => {
    setFilters(initialFilterState);
    setPriceRange([0, 1000000]);
    setSortOption(initialSortOption);
    setSelectedFinalTypeId(null); // Reset final type selection
  };

  // Auto-select first main type and sub type
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

  // Fetch final types when sub type changes
  useEffect(() => {
    const fetchFinalTypes = async () => {
      if (selectedSubTypeId) {
        setIsLoadingFinalTypes(true);
        setSelectedFinalTypeId(null); // Reset final type selection
        try {
          const types = await finalTypeTypeApi.fetchFinalTypeBySubId(selectedSubTypeId);
          setFinalTypes(types || []);
        } catch (error) {
          console.error('Failed to fetch final types:', error);
          setFinalTypes([]);
        } finally {
          setIsLoadingFinalTypes(false);
        }
      } else {
        setFinalTypes([]);
        setSelectedFinalTypeId(null);
      }
    };

    fetchFinalTypes();
  }, [selectedSubTypeId]);

  // Update filters when final type changes
  useEffect(() => {
    if (selectedFinalTypeId) {
      setFilters(prev => ({
        ...prev,
        finalType: selectedFinalTypeId.toString()
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        finalType: ''
      }));
    }
  }, [selectedFinalTypeId]);

  const currentMainType = mainTypes.find(
    (type) => type.id === selectedMainTypeId
  );
  const currentSubType = currentMainType?.subtypes?.find(
    (subType) => subType.id === selectedSubTypeId
  );

  const filteredRealEstateData = useMemo(() => {
    return filterRealEstateData(realEstateData, {
      selectedMainTypeId,
      selectedSubTypeId,
      priceRange,
      filters
    }, sortOption);
  }, [realEstateData, selectedMainTypeId, selectedSubTypeId, priceRange, filters, sortOption]);

  const isRentalType = useMemo(() => {
    return currentMainType?.name?.includes("إيجار") || false;
  }, [selectedMainTypeId]);

  useEffect(() => {
    if (!isRentalType && filters.rentalPeriod) {
      setFilters(prev => ({ ...prev, rentalPeriod: "" }));
    }
  }, [isRentalType, filters.rentalPeriod]);

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

          {/* Category Selector */}
          <CategorySelector
            mainTypes={mainTypes}
            selectedMainTypeId={selectedMainTypeId}
            setSelectedMainTypeId={(id: number | null) => {
              setSelectedMainTypeId(id);
              resetFilters()
            }}
            setSelectedSubTypeId={setSelectedSubTypeId}
            isLoading={isLoadingMainTypes}
          />

          {/* SubType Selector */}
          <SubTypeSelector
            currentMainType={currentMainType}
            selectedSubTypeId={selectedSubTypeId}
            setSelectedSubTypeId={setSelectedSubTypeId}
            isLoading={isLoadingMainTypes}
          />

          {/* Final Type Selector - New Component */}
          <FinalTypeSelector
            currentSubType={currentSubType}
            finalTypes={finalTypes}
            selectedFinalTypeId={selectedFinalTypeId}
            setSelectedFinalTypeId={setSelectedFinalTypeId}
            isLoading={isLoadingFinalTypes}
          />

          {/* Filter Section */}
          <FilterSection
            filters={filters}
            setFilters={setFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            subId={selectedSubTypeId}
            isRental={isRentalType}
            currentMainType={currentMainType}
            currentSubType={currentSubType}
            selectedMainTypeId={selectedMainTypeId}
            setSelectedMainTypeId={setSelectedMainTypeId}
            selectedSubTypeId={selectedSubTypeId}
            setSelectedSubTypeId={setSelectedSubTypeId}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />

          {/* Property Grid */}
          <PropertyMapGrid
            filteredData={filteredRealEstateData}
            isLoading={isLoadingRealEstate}
            resetFilters={resetFilters}
            currentMainType={currentMainType}
            currentSubType={currentSubType}
          />
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}