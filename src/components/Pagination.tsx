import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    className = '',
}) => {
    const startItem = Math.max((currentPage - 1) * itemsPerPage + 1, 1);
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getVisiblePages = (): (number | string)[] => {
        const delta = 2;
        const range: number[] = [];
        const rangeWithDots: (number | string)[] = [];

        const start = Math.max(2, currentPage - delta);
        const end = Math.min(totalPages - 1, currentPage + delta);

        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        rangeWithDots.push(1);
        if (start > 2) {
            rangeWithDots.push('...');
        }

        rangeWithDots.push(...range);

        if (end < totalPages - 1) {
            rangeWithDots.push('...');
        }
        if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    if (totalPages <= 1 || totalItems === 0) return null;

    return (
        <div className={`flex flex-col items-center space-y-4 ${className}`} dir="rtl">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
                عرض {startItem} إلى {endItem} من إجمالي {totalItems} عنصر
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2 space-x-reverse">
                {/* Next Button (appears first in RTL) */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2"
                    aria-label="الصفحة التالية"
                >
                    التالي
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1 space-x-reverse">
                    {getVisiblePages().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-2 py-1 text-gray-500 select-none"
                                    aria-hidden="true"
                                >
                                    ...
                                </span>
                            );
                        }

                        const pageNumber = page as number;
                        return (
                            <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onPageChange(pageNumber)}
                                className="w-10 h-10"
                                aria-label={`الصفحة ${pageNumber}`}
                                aria-current={currentPage === pageNumber ? 'page' : undefined}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })}
                </div>

                {/* Previous Button (appears last in RTL) */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                    aria-label="الصفحة السابقة"
                >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    السابق
                </Button>
            </div>
        </div>
    );
};