import React from 'react';
import { Calendar, Send, Plus } from 'lucide-react';

interface FloatingActionButtonsProps {
    onReservationClick: () => void;
    onFeedbackClick: () => void;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
    onReservationClick,
    onFeedbackClick
}) => {
    return (
        <div className="fixed bottom-6 left-6 z-30 flex flex-col space-y-4">
            {/* المجموعة الأساسية للأزرار التي تظهر دائمًا */}
            <div className="group relative">
                <button
                    onClick={onReservationClick}
                    className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                    aria-label="حجز العقار"
                    title="حجز العقار"
                >
                    <Calendar className="w-6 h-6" />
                </button>
                <span className="opacity-0 group-hover:opacity-100 absolute right-full top-1/2 transform -translate-y-1/2 -translate-x-2 bg-gray-800 text-white text-sm py-2 px-4 rounded-lg transition-opacity whitespace-nowrap mr-3">
                    حجز العقار
                </span>
            </div>

            <div className="group relative">
                <button
                    onClick={onFeedbackClick}
                    className="flex items-center justify-center w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                    aria-label="طلب عرض"
                    title="طلب عرض"
                >
                    <Send className="w-6 h-6" />
                </button>
                <span className="opacity-0 group-hover:opacity-100 absolute right-full top-1/2 transform -translate-y-1/2 -translate-x-2 bg-gray-800 text-white text-sm py-2 px-4 rounded-lg transition-opacity whitespace-nowrap mr-3">
                    طلب عرض
                </span>
            </div>
        </div>
    );
};