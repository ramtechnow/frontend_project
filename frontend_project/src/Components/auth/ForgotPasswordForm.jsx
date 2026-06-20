import React, { useState, useRef, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { validateEmail, validatePasswordStrength } from "../../Utils/validators";
import { useOtpTimer } from "../../Hooks/useOtpTimer";
import { AlertCircle, CheckCircle2, Lock, Mail, X } from "lucide-react";

const ForgotPasswordForm = ({ onClose }) => {
  const { sendForgotPasswordOtp, resetPasswordWithOtp } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1 = Enter email, 2 = Enter OTP + New Password
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationError, setValidationError] = useState("");

  const { secondsLeft, startTimer, isTimerActive } = useOtpTimer(0);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleRequestOtp = async (e) => {
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
      const res = await sendForgotPasswordOtp(email.trim());
      if (res.success) {
        if (res.isFirebase) {
          // Firebase sends a password reset LINK (not OTP) — show done screen
          setMessage(
            res.message ||
            "Password reset email sent! Check your inbox and click the link to set a new password."
          );
          // Stay on step 1 showing the success banner — no OTP entry needed
        } else {
          // Backend OTP mode — advance to OTP + new password step
          setStep(2);
          setMessage(res.message || "Reset code dispatched successfully!");
          startTimer(60);
          setTimeout(() => {
            if (inputRefs[0].current) inputRefs[0].current.focus();
          }, 100);
        }
      } else {
        setErrorMsg(res.errors || "Failed to dispatch reset code. Please try again.");
      }
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isTimerActive) return;
    setErrorMsg("");
    setMessage("");
    setLoading(true);

    try {
      const res = await sendForgotPasswordOtp(email.trim());
      if (res.success) {
        setMessage("A fresh verification code has been dispatched to your email!");
        setOtpValues(["", "", "", "", "", ""]);
        startTimer(60);
        if (inputRefs[0].current) inputRefs[0].current.focus();
      } else {
        setErrorMsg(res.errors || "Failed to resend code.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const chars = pasteData.split("");
      setOtpValues(chars);
      inputRefs[5].current.focus();
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");

    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (!validatePasswordStrength(newPassword)) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithOtp(email.trim(), otpCode, newPassword);
      if (res.success) {
        setMessage("Password updated successfully! Redirecting you back to sign in...");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrorMsg(res.errors || "Failed to reset password. Check input and OTP.");
      }
    } catch (err) {
      setErrorMsg("An unexpected server error occurred during password reset.");
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
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800" }}>Account Recovery</h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>
            {step === 1 ? "Get a verification OTP code via email" : "Establish a new secure password"}
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
            borderRadius: "var(--border-radius-sm)",
            padding: "10px 12px",
            color: "#ef4444",
            fontSize: "13px"
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
            borderRadius: "var(--border-radius-sm)",
            padding: "10px 12px",
            color: "#16a34a",
            fontSize: "13px"
          }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
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
                  style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
                  disabled={loading}
                  required
                />
              </div>
              {validationError && (
                <span className="inline-validation-error">{validationError}</span>
              )}
            </div>

            <button
              type="submit"
              className="interactive-target"
              disabled={loading}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-secondary)",
                fontWeight: "700",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "13px",
                marginTop: "4px"
              }}
            >
              {loading ? "Requesting OTP..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {/* OTP Digit Boxes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: "700", textAlign: "center" }}>
                Enter 6-Digit Email Verification Code
              </label>
              <div className="otp-container">
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    maxLength={1}
                    className="otp-box"
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    disabled={loading}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="newPassword" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                <input
                  type="password"
                  id="newPassword"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="confirmPassword" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="interactive-target"
              disabled={loading}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-secondary)",
                fontWeight: "700",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "13px",
                marginTop: "4px"
              }}
            >
              {loading ? "Resetting Password..." : "Submit New Password"}
            </button>

            {/* Cooldown Timer */}
            <div className="resend-cooldown-text">
              {isTimerActive ? (
                <span>Resend OTP in <strong>{secondsLeft}s</strong></span>
              ) : (
                <span>
                  Didn't receive code?
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: "var(--text-muted)",
                textAlign: "center",
                cursor: "pointer",
                minHeight: "auto",
                textDecoration: "underline"
              }}
            >
              Change Email Address
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
