import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

export function ExitConfirmationDialog({ isOpen, onClose, onConfirm }: {
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