import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildingItem, RealEstateData } from '@/lib/types';
import { toast } from 'react-toastify';
import EstateForm from '../forms/EstateForm';



interface EstateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: BuildingItem | null;
  buildingItemId?: string;
}

export const EstateFormModal: React.FC<EstateFormModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  buildingItemId
}) => {

  return (
    <AnimatePresence>
      {isOpen && selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
          >
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold">
                إضافة عقار لـ {selectedItem.name}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <EstateForm
                buildingItemId={buildingItemId}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

