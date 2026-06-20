import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-pink/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
            {
              "bg-text-primary text-bg-primary hover:bg-text-primary/95": variant === "primary",
              "bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 border border-border": variant === "secondary",
              "bg-transparent text-text-primary border border-border hover:bg-bg-tertiary": variant === "outline",
              "bg-red-500 text-white hover:bg-red-600": variant === "danger",
              "bg-transparent text-text-primary hover:bg-bg-tertiary": variant === "ghost",
              "px-3 py-1.5 text-xs": size === "sm",
              "px-4 py-2 text-sm": size === "md",
              "px-6 py-3 text-base": size === "lg",
            },
            className
          )
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
