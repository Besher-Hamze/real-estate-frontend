import React, { useState, useEffect, useRef } from "react";
import {
  Checkbox,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { X } from "lucide-react"; // Import the remove icon

interface FeaturesSelectionProps {
  propertyType: "residential" | "commercial" | "industrial" | "others";
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
}

const FEATURES_BY_TYPE = {
  residential: [
    "تكييف مركزي",
    "مكيف",
    "تدفئة",
    "شرفة/بلكونة",
    "غرفة خادمة",
    "غرفة غسيل",
    "خزائن حائط",
    "مسبح خاص",
    "سخان شمسي",
    "زجاج شبابيك مزدوج",
    "جاكوزي",
    "مطبخ جاهز",
    "اباجورات كهرباء",
    "تدفئة تحت البلاط",
    "عسالة",
    "جلاية صحون",
    "مايكرويف",
    "فرن",
    "ثلاجة",
  ],
  commercial: [
    "تكييف مركزي",
    "بلكونة",
    "زجاج شبابيك مزدوج",
    "مطبخ جاهز",
    "مصعد",
    "مواقف خاصة",
    "حارس",
    "مخزن",
    "انترنت",
    "تسهيل لأصحاب الهمم",
  ],
  industrial: [
    "مصعد",
    "تكييف",
    "كهرباء توتر عالي",
    "منصة تحميل",
    "مواقف خاصة",
    "غرفة حارس",
    "CCTV",
  ],
  others: [
    "مصعد",
    "حديقة",
    "موقف سيارات",
    "حارس /\ أمن وحماية",
    "درج",
    "مخزن",
    "منطقة شواء",
    "نظام كهرباء احتياطي للطوارئ",
    "بركة سباحة",
    "انتركم",
    "انترنت",
    "تسهيلات لأصحاب الهمم",
  ],
} as const;

const FeaturesSelection: React.FC<FeaturesSelectionProps> = ({
  propertyType,
  selectedFeatures,
  onChange,
}) => {
  const features = FEATURES_BY_TYPE[propertyType] || [];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFeatureToggle = (feature: string) => {
    const updatedFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];
    onChange(updatedFeatures);
  };

  const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission
    setIsOpen(!isOpen);
  };

  const removeFeature = (feature: string) => {
    const updatedFeatures = selectedFeatures.filter((f) => f !== feature);
    onChange(updatedFeatures);
  };

  // Close dropdown when clicking outside of the container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full" dir="rtl" ref={containerRef}>
      <Select>
        <SelectTrigger
          className="w-full bg-white border border-gray-300 rounded-lg shadow-md hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          onClick={toggleDropdown}
        >
          <SelectValue placeholder="اختر الميزات">
            {selectedFeatures.length > 0 ? "ميزات محددة" : "اختر الميزات"}
          </SelectValue>
        </SelectTrigger>

        {isOpen && (
          <SelectContent className="bg-white rounded-lg shadow-lg border border-gray-200 mt-2 w-full max-h-96 overflow-hidden">
            <SelectGroup>
              <ScrollArea className="h-72 w-full rounded-md overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                <div className="p-4 space-y-4">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-md transition-all"
                    >
                      <Checkbox
                        id={feature}
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={feature} className="text-sm text-gray-700">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SelectGroup>
          </SelectContent>
        )}
      </Select>

      {/* Selected Features */}
      {selectedFeatures.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedFeatures.map((feature) => (
            <div
              key={feature}
              className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm"
            >
              {feature}
              <button
                type="button"
                className="ml-2 text-blue-500 hover:text-blue-700"
                onClick={() => removeFeature(feature)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturesSelection;
