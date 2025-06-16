import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    className?: string;
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    className = '',
    message = 'جاري التحميل...',
}) => {
    return (
        <div
            className={`flex items-center justify-center p-8 ${className}`}
            dir="rtl"
            role="status"
            aria-live="polite"
        >
            <div className="text-center space-y-4">
                <Loader2
                    className="w-8 h-8 animate-spin mx-auto text-blue-600"
                    aria-hidden="true"
                />
                {message && (
                    <p className="text-gray-600 text-sm sm:text-base">{message}</p>
                )}
            </div>
        </div>
    );
};