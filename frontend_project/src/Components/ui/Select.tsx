import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-xs font-bold text-text-primary tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={twMerge(
            clsx(
              "w-full h-11 bg-bg-primary text-text-primary border border-border rounded-md px-3 outline-none transition-all duration-200 focus:border-text-primary text-sm",
              {
                "border-red-500 focus:border-red-500": !!error,
              }
            ),
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-[11px] font-medium text-red-500 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
