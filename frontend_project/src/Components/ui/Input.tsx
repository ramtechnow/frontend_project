import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-xs font-bold text-text-primary tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={twMerge(
              clsx(
                "w-full h-11 bg-bg-primary text-text-primary border border-border rounded-md px-3 outline-none transition-all duration-200 focus:border-text-primary text-sm placeholder:text-text-muted/60",
                {
                  "pl-10": !!icon,
                  "border-red-500 focus:border-red-500": !!error,
                }
              ),
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-[11px] font-medium text-red-500 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
