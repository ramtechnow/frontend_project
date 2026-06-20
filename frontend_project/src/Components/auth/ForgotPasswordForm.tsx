import React, { useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { validateEmail } from "../../Utils/validators";
import { AlertCircle, CheckCircle2, Mail, X } from "lucide-react";

interface ForgotPasswordFormProps {
  onClose: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onClose }) => {
  const { sendForgotPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setErrorMsg("");
    setMessage("");

    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendForgotPasswordReset(email.trim());
      if (res.success) {
        setMessage(
          "Password reset link sent! Check your inbox and click the link to establish a new password."
        );
      } else {
        setErrorMsg(res.error || "Failed to dispatch reset link. Please try again.");
      }
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            right: "16px",
            top: "16px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            minHeight: "auto",
            padding: "4px"
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "850", letterSpacing: "-0.5px", margin: 0 }}>Account Recovery</h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "6px" }}>
            Receive a password reset link in your email inbox
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "#ef4444",
            fontSize: "13px",
            marginBottom: "16px"
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {message && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "#16a34a",
            fontSize: "13px",
            marginBottom: "16px"
          }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleRequestReset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="recoveryEmail" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
              <input
                type="email"
                id="recoveryEmail"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError("");
                }}
                style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none", border: "1px solid var(--border-color)", borderRadius: "8px", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
                disabled={loading || !!message}
                required
              />
            </div>
            {validationError && (
              <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "2px" }}>{validationError}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!message}
            style={{
              width: "100%",
              height: "44px",
              backgroundColor: loading || !!message ? "var(--border-color)" : "var(--accent-pink)",
              color: "white",
              fontWeight: "700",
              borderRadius: "40px",
              fontSize: "13px",
              border: "none",
              cursor: loading || !!message ? "not-allowed" : "pointer",
              transition: "opacity 0.2s"
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
