import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, BuildingItem, RealEstateData } from '@/lib/types';
import { toast } from 'react-toastify';
import EstateForm from '../forms/EstateForm';
import { ExitConfirmationDialog } from '@/components/forms/ExitConfirmationDialog';



interface EstateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: Building | null;
  buildingId?: string;
}

export const EstateFormModal: React.FC<EstateFormModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  buildingId: buildingItemId
}) => {
  const [isExitConfirmOpen, setExitConfirmOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard handling (Escape key closes modal)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setExitConfirmOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleExitConfirm = () => {
    setExitConfirmOpen(false);
    onClose();
  };
  return (
    <>
      <AnimatePresence>
        {isOpen && selectedItem && (
          <motion.div
            onClick={() => setExitConfirmOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from triggering overlay click
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
              aria-modal="true"
              role="dialog"
            >
              <div className=" top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold">
                  إضافة عقار لـ {selectedItem.title}
                </h2>
              </div>

              <div className="p-6">
                <EstateForm
                  buildingId={buildingItemId}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ExitConfirmationDialog
        isOpen={isExitConfirmOpen}
        onClose={() => setExitConfirmOpen(false)}
        onConfirm={handleExitConfirm}
      />
    </>
  );
};

