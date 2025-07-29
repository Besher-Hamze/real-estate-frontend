"use client";

import React, { useState } from "react";
import clsx from "clsx";
import {
  Building2,
  Layers,
  Grid3X3,
  MapPin,
  Landmark,
  Home,
  Menu,
  X,
  QrCode,
} from "lucide-react";

type DashboardTab =
  | "mainType"
  | "subType"
  | "finalType"
  | "city"
  | "neighborhood"
  | "estate"
  | "map"
  | "finalCity"
  ;

type TabsProps = {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
};

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className="p-2 rounded-md bg-blue-600 text-white shadow-md focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full bg-white shadow-lg border-l border-gray-300 p-6 flex flex-col gap-3 z-50 transition-transform duration-300 ease-in-out",
          "w-64",
          {
            "translate-x-0": isSidebarOpen,
            "translate-x-full": !isSidebarOpen,
            "md:translate-x-0": true, // Always show on md and above
          }
        )}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end">
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="p-2 rounded-md text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Header */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🏡 لوحة التحكم</h2>

        {/* Tab Buttons */}
        <TabButton
          label="التصنيفات الرئيسية"
          icon={<Building2 className="w-5 h-5" />}
          isActive={activeTab === "mainType"}
          onClick={() => {
            setActiveTab("mainType");
            setSidebarOpen(false);
          }}
        />
        <TabButton
          label="التصنيفات الفرعية"
          icon={<Layers className="w-5 h-5" />}
          isActive={activeTab === "subType"}
          onClick={() => {
            setActiveTab("subType");
            setSidebarOpen(false);
          }}
        />
        <TabButton
          label="النوع النهائي"
          icon={<Grid3X3 className="w-5 h-5" />}
          isActive={activeTab === "finalType"}
          onClick={() => {
            setActiveTab("finalType");
            setSidebarOpen(false);
          }}
        />
        <TabButton
          label="المحافظات"
          icon={<MapPin className="w-5 h-5" />}
          isActive={activeTab === "city"}
          onClick={() => {
            setActiveTab("city");
            setSidebarOpen(false);
          }}
        />
        <TabButton
          label="المدن"
          icon={<Landmark className="w-5 h-5" />}
          isActive={activeTab === "neighborhood"}
          onClick={() => {
            setActiveTab("neighborhood");
            setSidebarOpen(false);
          }}
        />
        <TabButton
          label="المناطق"
          icon={<Landmark className="w-5 h-5" />}
          isActive={activeTab === "finalCity"}
          onClick={() => {
            setActiveTab("finalCity");
            setSidebarOpen(false);
          }}
        />
        <TabButton
          label="الإعلانات"
          icon={<Home className="w-5 h-5" />}
          isActive={activeTab === "estate"}
          onClick={() => {
            setActiveTab("estate");
            setSidebarOpen(false);
          }}
        />
        <TabButton
          label="إنشاء QR"
          icon={<QrCode className="w-5 h-5" />}
          isActive={activeTab === "map"}
          onClick={() => {
            setActiveTab("map");
            setSidebarOpen(false);
          }}
        />

      </div>
    </>
  );
}

/**
 * Renders an individual tab button.
 */
function TabButton({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out w-full text-right",
        "hover:bg-gray-100 hover:text-blue-600",
        isActive
          ? "bg-blue-50 text-blue-600 font-semibold shadow-md"
          : "text-gray-700"
      )}
    >
      {icon}
      <span className="text-md">{label}</span>
    </button>
  );
}
