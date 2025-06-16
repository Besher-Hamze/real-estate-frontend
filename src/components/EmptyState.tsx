import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    actionLabel,
    onAction,
    icon,
    className = '',
}) => {
    return (
        <div
            className={`text-center py-12 px-4 ${className}`}
            dir="rtl"
            role="alert"
            aria-live="polite"
        >
            <div className="w-16 h-16 mx-auto mb-6 text-gray-300">
                {icon || (
                    <AlertCircle className="w-full h-full" aria-hidden="true" />
                )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    variant="outline"
                    className="min-w-[120px]"
                    aria-label={actionLabel}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};