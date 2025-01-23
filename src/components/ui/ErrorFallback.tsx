"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

type ErrorFallbackProps = {
  /**
   * The error message to display
   */
  errorMessage?: string;

  /**
   * A callback to handle refreshing or retrying
   * (e.g., `() => window.location.reload()` or React Query's `refetch()`)
   */
  onRefresh?: () => void;
};

/**
 * Displays an error message with an icon and a button to refresh or retry.
 */
export default function ErrorFallback({
  errorMessage = "حدث خطأ أثناء تنفيذ العملية",
  onRefresh,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 border border-red-300 rounded-md bg-red-50">
      <AlertTriangle className="w-8 h-8 text-red-500" />

      <p className="text-red-600 font-semibold text-center">{errorMessage}</p>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                     text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          إعادة التحميل
        </button>
      )}
    </div>
  );
}
