"use client";

import { useState } from "react";
import { Building2, Home, Loader2, Plus } from "lucide-react";

import { useMainType } from "@/lib/hooks/useMainType";
import { useRealEstate } from "@/lib/hooks/useRealEstate";

import Tabs from "./Tabs";
import SearchFilterBar from "./SearchFilterBar";

// Forms
import MainTypeForm from "./forms/MainTypeForm";
import SubTypeForm from "./forms/SubTypeForm";
import FinalTypeForm from "./forms/FinalTypeForm";
import CityForm from "./forms/CityForm";
import NeighborhoodForm from "./forms/NeighborhoodForm";
import EstateForm from "./forms/EstateForm";

// Tables
import MainTypeTable from "./tables/MainTypeTable";
import SubTypeTable from "./tables/SubTypeTable";
import FinalTypeTable from "./tables/FinalTypeTable";
import CityTable from "./tables/CityTable";
import NeighborhoodTable from "./tables/NeighborhoodTable";
import EstateTable from "./tables/EstateTable";

/**
 * Main Dashboard component: includes:
 *  - A drawer-like Tabs component on the right (responsive).
 *  - Main content (header, forms, data tables) on the left.
 */
export default function DashboardComponent() {
  const [activeTab, setActiveTab] = useState<
    "mainType" | "subType" | "finalType" | "city" | "neighborhood" | "estate"
  >("mainType");

  const { mainTypes, isLoading: isLoadingMainTypes, refetch: refetchMain } = useMainType();
  const { realEstateData, isLoading: isLoadingEstate } = useRealEstate();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Combined loading state
  const isLoading = isLoadingMainTypes || isLoadingEstate;

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-800" dir="rtl">
      {/* Drawer-like Tabs on the right */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content area. On desktop, margin-right so content won't hide behind drawer */}
      <div className="p-6 md:p-8 md:mr-64 transition-all">

        {/* Content Grid: Forms sidebar + Data display */}
        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {/* Sidebar - Forms */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {activeTab === "mainType" && <MainTypeForm />}
              {activeTab === "subType" && <SubTypeForm />}
              {activeTab === "finalType" && <FinalTypeForm />}
              {activeTab === "city" && <CityForm />}
              {activeTab === "neighborhood" && <NeighborhoodForm />}
              {activeTab === "estate" && <EstateForm />}
            </div>
          </div>

          {/* Main Data Display */}
          <div className="col-span-12 md:col-span-8 bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Search & Filter Bar */}
            <SearchFilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            {/* Data Table */}
            <div className="max-h-[80vh]  overflow-y-auto  ">
              {activeTab === "mainType" && (
                <MainTypeTable
                  mainTypes={mainTypes}
                  isLoading={isLoadingMainTypes}
                  onRefetch={refetchMain}
                />
              )}
              {activeTab === "subType" && (
                <SubTypeTable
                  mainTypes={mainTypes}
                  isLoading={isLoadingMainTypes}
                  onRefetch={refetchMain}
                />
              )}
              {activeTab === "finalType" && <FinalTypeTable />}
              {activeTab === "city" && <CityTable />}
              {activeTab === "neighborhood" && <NeighborhoodTable />}
              {activeTab === "estate" && (
                <EstateTable
                  mainTypes={mainTypes}
                  realEstateData={realEstateData}
                  isLoading={isLoadingEstate}
                />
              )}

              {/* Loading Spinner */}
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-black">جاري التحميل...</span>
                  </div>
                </div>
              )}

              {/* Empty States - MainType */}
              {!isLoading &&
                activeTab === "mainType" &&
                (!mainTypes || mainTypes.length === 0) && (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      لا توجد تصنيفات رئيسية
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      ابدأ بإضافة تصنيف رئيسي جديد
                    </p>
                    <div className="mt-6">
                      <button
                        className="inline-flex items-center px-4 py-2 border 
                          border-transparent shadow-sm text-sm font-medium rounded-md 
                          text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="-mr-1 ml-2 h-5 w-5" />
                        إضافة تصنيف رئيسي
                      </button>
                    </div>
                  </div>
                )}

              {/* Empty States - Estate */}
              {!isLoading &&
                activeTab === "estate" &&
                (!realEstateData || realEstateData.length === 0) && (
                  <div className="text-center py-8">
                    <Home className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      لا توجد عقارات
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      ابدأ بإضافة عقار جديد
                    </p>
                    <div className="mt-6">
                      <button
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
                          transition-colors flex items-center justify-center gap-2
                          hover:bg-blue-700"
                      >
                        <Plus className="w-5 h-5" />
                        إضافة عقار
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
