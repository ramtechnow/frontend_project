import React, { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showStrength?: boolean; // show password strength meter for signup
}

// Password strength helpers
function getStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "#e5e7eb" };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: "Weak",   color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair",   color: "#f59e0b" };
  if (score <= 3) return { score, label: "Good",   color: "#3b82f6" };
  return              { score, label: "Strong", color: "#10b981" };
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, icon, showStrength = false, onChange, ...props }, ref) => {
    const isPassword = type === "password";
    const [showPwd, setShowPwd]   = useState(false);
    const [pwdValue, setPwdValue] = useState("");

    const resolvedType = isPassword && showPwd ? "text" : type;
    const strength     = isPassword && showStrength ? getStrength(pwdValue) : null;

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isPassword && showStrength) setPwdValue(e.target.value);
      if (onChange) onChange(e);
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-xs font-bold text-text-primary tracking-wide">
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center justify-center">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={resolvedType}
            onChange={handleOnChange}
            title={isPassword ? "Password must be at least 6 characters" : props.title}
            style={{
              paddingLeft: icon ? "42px" : "14px",
              paddingRight: isPassword ? "40px" : "14px",
            }}
            className={twMerge(
              clsx(
                "w-full h-11 bg-bg-primary text-text-primary border border-border rounded-md outline-none transition-all duration-200 focus:border-text-primary text-sm placeholder:text-text-muted/60",
                {
                  "border-red-500 focus:border-red-500": !!error,
                }
              ),
              className
            )}
            {...props}
          />

          {/* Eye toggle button */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
              title={showPwd ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center justify-center rounded transition-colors duration-150 hover:text-text-primary focus:outline-none"
              style={{ width: 22, height: 22, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {/* Password strength meter */}
        {strength && pwdValue.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 3, borderRadius: 4,
                    backgroundColor: i <= Math.ceil(strength.score * 4 / 5)
                      ? strength.color
                      : "var(--border-color)",
                    transition: "background-color 0.3s ease"
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>
                {strength.label}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {strength.score < 3 && "· Add uppercase, numbers or symbols for a stronger password"}
              </span>
            </div>
          </div>
        )}

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
