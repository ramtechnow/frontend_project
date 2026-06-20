import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className }) => {
  return (
    <div
      className={twMerge(
        clsx("animate-spin rounded-full border-2 border-t-transparent border-current text-accent-pink", {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        }),
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
