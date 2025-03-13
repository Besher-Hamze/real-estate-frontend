import React, { useState, useEffect, useRef, Fragment } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from '@headlessui/react';

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
    | "finalCity";

type Props = {
    activeTab: DashboardTab;
};

function ExitConfirmationDialog({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                {/* Centered Dialog */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <Dialog.Panel
                            className="
                w-full max-w-md p-6 overflow-hidden 
                text-right align-middle transition-all transform 
                bg-white shadow-xl rounded-2xl
              "
                        >
                            <Dialog.Title
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900 mb-4"
                            >
                                تأكيد الخروج
                            </Dialog.Title>
                            <div className="text-gray-700 mb-6">
                                هل أنت متأكد أنك تريد الخروج؟ قد تفقد البيانات غير المحفوظة.
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                    onClick={onClose}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    تأكيد الخروج
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}

export default function FloatingAddButton({ activeTab }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isExitConfirmOpen, setExitConfirmOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Keyboard handling (Escape key closes modal)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isModalOpen) {
                // Instead of closing directly, show the confirmation dialog
                setExitConfirmOpen(true);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isModalOpen]);

    // Render the appropriate form based on active tab
    const renderForm = () => {
        switch (activeTab) {
            case "mainType":
                return <MainTypeForm />;
            case "subType":
                return <SubTypeForm />;
            case "finalType":
                return <FinalTypeForm />;
            case "city":
                return <CityForm />;
            case "neighborhood":
                return <NeighborhoodForm />;
            case "estate":
                return <EstateForm />;
            case "map":
                return <BuildingForm />;
            case "finalCity":
                return <FinalCityForm />;
            default:
                return null;
        }
    };

    // Called when user confirms to exit
    const handleExitConfirm = () => {
        setExitConfirmOpen(false);
        setModalOpen(false);
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
                            <div className="m-8">{renderForm()}</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Exit Confirmation Dialog */}
            <ExitConfirmationDialog
                isOpen={isExitConfirmOpen}
                onClose={() => setExitConfirmOpen(false)}
                onConfirm={handleExitConfirm}
            />
        </>
    );
}
