// components/BulkDeleteDialog.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  count: number;
  itemName: {
    singular: string;
    plural: string;
  };
}

export function BulkDeleteDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  count,
  itemName
}: BulkDeleteDialogProps) {
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
                تأكيد الحذف
              </Dialog.Title>
              <div className="text-gray-700 mb-6">
                هل أنت متأكد أنك تريد حذف {count} {count === 1 ? itemName.singular : itemName.plural}؟ لا يمكن التراجع عن هذا القرار.
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 
                    rounded-md hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white 
                    rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>جاري الحذف...</span>
                    </>
                  ) : (
                    <span>تأكيد الحذف</span>
                  )}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}