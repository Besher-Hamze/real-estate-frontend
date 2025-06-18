import React from "react";
import { motion } from "framer-motion";
import { FinalType, SubType } from "@/lib/types";
import { Building2, CheckCircle } from "lucide-react";

interface FinalTypeSelectorProps {
    currentSubType: SubType | undefined;
    finalTypes: FinalType[];
    selectedFinalTypeId: number | null;
    setSelectedFinalTypeId: (id: number | null) => void;
    isLoading: boolean;
}

// FinalTypeButton component similar to CategoryButton
const FinalTypeButton: React.FC<{
    finalType: FinalType;
    isSelected: boolean;
    onClick: () => void;
}> = ({ finalType, isSelected, onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                relative min-w-[160px] px-6 py-4 rounded-xl border-2 transition-all duration-300 
                ${isSelected
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                }
            `}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`
                        p-2 rounded-lg transition-colors duration-300
                        ${isSelected
                            ? 'bg-white/20'
                            : 'bg-gray-100'
                        }
                    `}>
                        <Building2 className={`
                            w-5 h-5 transition-colors duration-300
                            ${isSelected ? 'text-white' : 'text-blue-600'}
                        `} />
                    </div>
                    <span className="font-medium text-sm">{finalType.name}</span>
                </div>

                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-white/20 rounded-full p-1"
                    >
                        <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                )}
            </div>
        </motion.button>
    );
};

// FinalTypeSkeleton component
const FinalTypeSkeleton: React.FC = () => {
    return (
        <div className="min-w-[160px] px-6 py-4 rounded-xl border-2 border-gray-200 bg-white">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
            </div>
        </div>
    );
};

const FinalTypeSelector: React.FC<FinalTypeSelectorProps> = ({
    currentSubType,
    finalTypes,
    selectedFinalTypeId,
    setSelectedFinalTypeId,
    isLoading
}) => {
    // Don't render if no sub type is selected
    if (!currentSubType) {
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
            transition={{ duration: 0.5 }}
            className="mb-8"
        >
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    اختر التصنيف النهائي
                </h3>
                <p className="text-gray-600">
                    التصنيفات المتاحة لـ {currentSubType.name}
                </p>
            </div>

            <div className="flex justify-center gap-4 overflow-x-auto pb-4">
                {isLoading ? (
                    // Loading skeletons
                    Array(3).fill(0).map((_, index) => (
                        <FinalTypeSkeleton key={index} />
                    ))
                ) : finalTypes.length > 0 ? (
                    // FinalType buttons
                    finalTypes.map((finalType) => (
                        <FinalTypeButton
                            key={finalType.id}
                            finalType={finalType}
                            isSelected={selectedFinalTypeId === finalType.id}
                            onClick={() => handleFinalTypeSelect(finalType)}
                        />
                    ))
                ) : (
                    // No final types available
                    <div className="text-center py-8">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            لا توجد تصنيفات نهائية متاحة لـ {currentSubType.name}
                        </p>
                    </div>
                )}
            </div>

            {/* Selected final type indicator */}
            {selectedFinalTypeId && finalTypes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mt-4"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            تم اختيار: {finalTypes.find(f => f.id === selectedFinalTypeId)?.name}
                        </span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default FinalTypeSelector;