"use client";

import { useState } from "react";
import { Building2, Home, Loader2, Plus } from "lucide-react";
import { useMainType } from "@/lib/hooks/useMainType";
import { useRealEstate } from "@/lib/hooks/useRealEstate";
import Tabs from "./Tabs";
import MainTypeTable from "./tables/MainTypeTable";
import SubTypeTable from "./tables/SubTypeTable";
import FinalTypeTable from "./tables/FinalTypeTable";
import CityTable from "./tables/CityTable";
import NeighborhoodTable from "./tables/NeighborhoodTable";
import EstateTable from "./tables/EstateTable";
import BuildingTable from "./tables/BuildingTable";
import FloatingAddButton from "./FloatingAddButton";

export default function DashboardComponent() {
  const [activeTab, setActiveTab] = useState<
    "mainType" | "subType" | "finalType" | "city" | "neighborhood" | "estate" | "map"
  >("mainType");

  const { mainTypes, isLoading: isLoadingMainTypes, refetch: refetchMain } = useMainType();
  const { realEstateData, isLoading: isLoadingEstate } = useRealEstate();

  const [searchTerm, setSearchTerm] = useState("");

  const isLoading = isLoadingMainTypes || isLoadingEstate;

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-800" dir="rtl">
      {/* Sidebar Navigation */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="p-6 md:p-8 md:mr-64 transition-all">
        <div className="flex flex-col md:flex-row gap-6">
          <FloatingAddButton activeTab={activeTab} />

          {/* Main Data Table Section */}
          <div className="w-full ">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 ">
              {/* Search & Filter Bar */}
              {/* <div className="sticky top-0 bg-white z-10 rounded-lg shadow-sm mb-4">
                <SearchFilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </div> */}

              {/* Data Table */}
              <div className="max-h-[90vh] overflow-y-auto">
                {activeTab === "mainType" && (
                  <MainTypeTable mainTypes={mainTypes} isLoading={isLoadingMainTypes} onRefetch={refetchMain} />
                )}
                {activeTab === "map" && (
                  <div className="w-full">
                    <BuildingTable />
                  </div>
                )}

                {activeTab === "subType" && (
                  <SubTypeTable mainTypes={mainTypes} isLoading={isLoadingMainTypes} onRefetch={refetchMain} />
                )}
                {activeTab === "finalType" && <FinalTypeTable />}
                {activeTab === "city" && <CityTable />}
                {activeTab === "neighborhood" && <NeighborhoodTable />}
                {activeTab === "estate" && (
                  <EstateTable mainTypes={mainTypes} realEstateData={realEstateData} isLoading={isLoadingEstate} />
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-black">جاري التحميل...</span>
                  </div>
                )}

                {/* Empty States */}
                {!isLoading && activeTab === "mainType" && (!mainTypes || mainTypes.length === 0) && (
                  <EmptyState
                    icon={<Building2 className="mx-auto h-12 w-12 text-gray-400" />}
                    title="لا توجد تصنيفات رئيسية"
                    description="ابدأ بإضافة تصنيف رئيسي جديد"
                    buttonText="إضافة تصنيف رئيسي"
                  />
                )}

                {!isLoading && activeTab === "estate" && (!realEstateData || realEstateData.length === 0) && (
                  <EmptyState
                    icon={<Home className="mx-auto h-12 w-12 text-gray-400" />}
                    title="لا توجد عقارات"
                    description="ابدأ بإضافة عقار جديد"
                    buttonText="إضافة عقار"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description, buttonText }: { icon: React.ReactNode; title: string; description: string; buttonText: string }) {
  return (
    <div className="text-center py-8">
      {icon}
      <h3 className="mt-2 text-md font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6">
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg 
            text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="-mr-1 ml-2 h-5 w-5" />
          {buttonText}
        </button>
      </div>
    </div>
  );
}
