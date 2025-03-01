import { useState } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { MainType } from "@/lib/types";

interface CategoryButtonProps {
  mainType: MainType;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ mainType, isSelected, onClick }) => {
  const [imageError, setImageError] = useState<boolean>(false);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${
        isSelected
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
      }`}
    >
      {!imageError ? (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}/${mainType.icon}`}
          alt={mainType.name}
          className="w-5 h-5 object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <Building2 className="w-5 h-5 text-white" />
      )}
      {mainType.name}
    </motion.button>
  );
};

export default CategoryButton;
