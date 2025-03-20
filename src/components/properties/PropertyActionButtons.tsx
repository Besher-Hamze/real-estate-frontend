import React from 'react';
import { Calendar, Send, Heart, Share2 } from 'lucide-react';

interface ActionButtonsProps {
    onReservationClick: () => void;
    onFeedbackClick: () => void;
}

export const PropertyActionButtons: React.FC<ActionButtonsProps> = ({
    onReservationClick,
    onFeedbackClick
}) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8 mb-12">
            <h3 className="text-xl font-bold text-gray-800 mb-5">إجراءات العقار</h3>
            
            <div className="flex flex-wrap gap-4">
                {/* Main Action Buttons */}
                <button
                    onClick={onReservationClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">حجز العقار</span>
                </button>

                <button
                    onClick={onFeedbackClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                    <Send className="w-5 h-5" />
                    <span className="font-semibold">طلب عرض</span>
                </button>

                {/* Secondary Action Buttons */}
                <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-red-500 px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">المفضلة</span>
                </button>
                
                <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-500 px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">مشاركة</span>
                </button>
            </div>
        </div>
    );
};

export default PropertyActionButtons;