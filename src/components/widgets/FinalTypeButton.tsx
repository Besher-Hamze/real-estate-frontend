import React from "react";
import { motion } from "framer-motion";
import { FinalType, SubType } from "@/lib/types";

interface FinalTypeSelectorProps {
    currentSubType: SubType | undefined;
    finalTypes: FinalType[];
    selectedFinalTypeId: number | null;
    setSelectedFinalTypeId: (id: number | null) => void;
    isLoading: boolean;
}

const FinalTypeSelector: React.FC<FinalTypeSelectorProps> = ({
    currentSubType,
    finalTypes,
    selectedFinalTypeId,
    setSelectedFinalTypeId,
    isLoading
}) => {
    // Don't render if no sub type is selected, loading, or no final types
    if (!currentSubType || isLoading || !finalTypes?.length) {
        return null;
    }

    const handleFinalTypeSelect = (finalType: FinalType): void => {
        // Toggle selection - if already selected, deselect it
        if (selectedFinalTypeId === finalType.id) {
            setSelectedFinalTypeId(null);
        } else {
            setSelectedFinalTypeId(finalType.id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg mb-8"
        >
            <div className="flex flex-wrap gap-3 justify-center">
                {finalTypes.map((finalType) => (
                    <motion.button
                        key={finalType.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFinalTypeSelect(finalType)}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${selectedFinalTypeId === finalType.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {finalType.name}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default FinalTypeSelector;