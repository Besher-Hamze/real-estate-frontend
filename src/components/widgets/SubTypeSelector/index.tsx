import { motion } from "framer-motion";
import { MainType } from "@/lib/types";

interface SubTypeSelectorProps {
  currentMainType: MainType | undefined;
  selectedSubTypeId: number | null;
  setSelectedSubTypeId: (id: number) => void;
  isLoading: boolean;
}

const SubTypeSelector: React.FC<SubTypeSelectorProps> = ({ 
  currentMainType, 
  selectedSubTypeId, 
  setSelectedSubTypeId,
  isLoading
}) => {
  if (!currentMainType || isLoading || !currentMainType.subtypes?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg mb-8"
    >
      <div className="flex flex-wrap gap-3 justify-center">
        {currentMainType.subtypes.map((subType) => (
          <motion.button
            key={subType.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSubTypeId(subType.id)}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              selectedSubTypeId === subType.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {subType.name}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default SubTypeSelector;
