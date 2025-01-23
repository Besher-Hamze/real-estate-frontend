"use client";

import React from "react";
import clsx from "clsx"; // For conditional classNames (optional)

type DashboardTab = 
  | "mainType"
  | "subType"
  | "finalType"
  | "city"
  | "neighborhood"
  | "estate";

type Props = {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
};

export default function Tabs({ activeTab, setActiveTab }: Props) {
  return (
    <div
      className="
        fixed top-0 right-0 w-64 h-full 
        bg-white border-l border-gray-200
        shadow-md p-4 flex flex-col gap-4
        z-50
      "
    >
      <h2 className="text-lg font-semibold mb-2">القائمة</h2>

      <TabButton
        label="التصنيفات الرئيسية"
        isActive={activeTab === "mainType"}
        onClick={() => setActiveTab("mainType")}
      />
      <TabButton
        label="التصنيفات الفرعية"
        isActive={activeTab === "subType"}
        onClick={() => setActiveTab("subType")}
      />
      <TabButton
        label="النوع النهائي"
        isActive={activeTab === "finalType"}
        onClick={() => setActiveTab("finalType")}
      />
      <TabButton
        label="المدن"
        isActive={activeTab === "city"}
        onClick={() => setActiveTab("city")}
      />
      <TabButton
        label="الأحياء"
        isActive={activeTab === "neighborhood"}
        onClick={() => setActiveTab("neighborhood")}
      />
      <TabButton
        label="العقارات"
        isActive={activeTab === "estate"}
        onClick={() => setActiveTab("estate")}
      />
    </div>
  );
}

/**
 * Renders an individual tab button.
 * Highlights if `isActive` is true.
 */
function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-4 py-2 text-right rounded-md transition-colors",
        "hover:bg-gray-100",
        isActive
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-700"
      )}
    >
      {label}
    </button>
  );
}
