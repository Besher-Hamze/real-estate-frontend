import React, { useEffect, useRef, useState } from "react";
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
import { X } from "lucide-react";

interface SelectionProps {
    features: string[];                      
    selectedFeatures: string[];              
    onChange: (features: string[]) => void; 
    placeholder?: string;                    
    selectionText?: {                       
        single: string;
        multiple: string;
    };
}

const FeaturesSelect: React.FC<SelectionProps> = ({
    features,
    selectedFeatures,
    onChange,
    placeholder = "اختر الميزات",
    selectionText = {
        single: 'ميزة',
        multiple: 'ميزات'
    }
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsOpen(!isOpen);
    };

    const handleFeatureToggle = (feature: string) => {
        const updatedFeatures = selectedFeatures.includes(feature)
            ? selectedFeatures.filter((f) => f !== feature)
            : [...selectedFeatures, feature];
        onChange(updatedFeatures);
    };

    const removeFeature = (feature: string) => {
        const updatedFeatures = selectedFeatures.filter((f) => f !== feature);
        onChange(updatedFeatures);
    };

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

    const getSelectionText = () => {
        if (selectedFeatures.length === 0) return placeholder;
        return `تم اختيار ${selectedFeatures.length} ${
            selectedFeatures.length === 1 ? selectionText.single : selectionText.multiple
        }`;
    };

    return (
        <div className="w-full" dir="rtl" ref={containerRef}>
            <Select>
                <SelectTrigger 
                    className="w-full bg-white border border-gray-300 rounded-lg shadow-sm 
                              hover:border-blue-500 focus:ring-2 focus:ring-blue-500 
                              focus:border-blue-500 transition-all"
                    onClick={toggleDropdown}
                >
                    <SelectValue placeholder={placeholder}>
                        {getSelectionText()}
                    </SelectValue>
                </SelectTrigger>

                {isOpen && (
                    <SelectContent 
                        className="bg-white rounded-lg shadow-lg border border-gray-200 
                                 mt-2 w-full max-h-96">
                        <SelectGroup>
                            <ScrollArea className="h-64 w-full rounded-md">
                                <div className="p-4 space-y-4">
                                    {features.map((feature) => (
                                        <div
                                            key={feature}
                                            className="flex items-center gap-3 hover:bg-gray-100 
                                                     p-2 rounded-md transition-all"
                                        >
                                            <Checkbox
                                                id={feature}
                                                checked={selectedFeatures.includes(feature)}
                                                onChange={() => handleFeatureToggle(feature)}
                                                className="border-gray-300"
                                            />
                                            <Label
                                                htmlFor={feature}
                                                className="text-sm text-gray-700 cursor-pointer"
                                            >
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

            {selectedFeatures.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {selectedFeatures.map((feature) => (
                        <div
                            key={feature}
                            className="flex items-center bg-blue-100 text-blue-700 
                                      px-3 py-1 rounded-full text-sm"
                        >
                            <span>{feature}</span>
                            <button
                                type="button"
                                className="mr-2 text-blue-500 hover:text-blue-700 
                                         focus:outline-none"
                                onClick={() => removeFeature(feature)}
                                aria-label={`إزالة ${feature}`}
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

export default FeaturesSelect;