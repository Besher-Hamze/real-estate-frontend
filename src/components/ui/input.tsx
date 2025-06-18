import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, dir = "rtl", onKeyDown, onWheel, ...props }, ref) => {
        // Handle keydown to prevent arrow key increments on number inputs
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                e.preventDefault();
            }
            // Call the original onKeyDown if provided
            onKeyDown?.(e);
        };

        // Handle wheel event to prevent scroll increment/decrement on number inputs
        const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
            if (type === "number") {
                // Blur the input to prevent increment/decrement
                (e.target as HTMLInputElement).blur();
                e.preventDefault();
            }
            // Call the original onWheel if provided
            onWheel?.(e);
        };

        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    // Hide spinner arrows for number inputs
                    type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    className
                )}
                dir={dir}
                onKeyDown={handleKeyDown}
                onWheel={handleWheel}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };