"use client"; 
import React from "react";
import { Loader2 } from "lucide-react";

type SpinnerProps = {
  /**
   * Text displayed next to the loading spinner
   * (default: "جاري التحميل...")
   */
  text?: string;

  /**
   * Boolean to control if the overlay (dimmed background) is shown
   */
  overlay?: boolean;

  /**
   * Additional CSS classes for the wrapper
   */
  className?: string;
};

export default function Spinner({
  text = "جاري التحميل...",
  overlay = false,
  className = "",
}: SpinnerProps) {
  if (overlay) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${className}`}
      >
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">{text}</span>
        </div>
      </div>
    );
  }

  // Non-overlay spinner
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      <span className="text-black">{text}</span>
    </div>
  );
}
