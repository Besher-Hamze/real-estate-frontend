import React, { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import your forms 
import MainTypeForm from "./forms/MainTypeForm";
import SubTypeForm from "./forms/SubTypeForm";
import FinalTypeForm from "./forms/FinalTypeForm";
import CityForm from "./forms/CityForm";
import NeighborhoodForm from "./forms/NeighborhoodForm";
import EstateForm from "./forms/EstateForm";
import BuildingForm from "./forms/BuildingForm";
import FinalCityForm from "./forms/FinalCityForm";

// Define the available dashboard tabs
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

type Props = {
    activeTab: DashboardTab;
};

export default function FloatingAddButton({ activeTab }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Keyboard handling (Escape key closes modal)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isModalOpen) {
                setModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen]);

    // Render the appropriate form based on active tab
    const renderForm = () => {
        switch (activeTab) {
            case "mainType": return <MainTypeForm />;
            case "subType": return <SubTypeForm />;
            case "finalType": return <FinalTypeForm />;
            case "city": return <CityForm />;
            case "neighborhood": return <NeighborhoodForm />;
            case "estate": return <EstateForm />;
            case "map": return <BuildingForm />;
            case "finalCity": return <FinalCityForm />;
            default: return null;
        }
    };

    return (
        <>
            {/* Floating Add Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setModalOpen(true)}
                aria-label="Add new item"
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
            >
                <Plus className="w-6 h-6" />
            </motion.button>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    >
                        <motion.div
                            ref={modalRef}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                            aria-modal="true"
                            role="dialog"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="m-8">
                                {renderForm()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}