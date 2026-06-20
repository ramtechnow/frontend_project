import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { auth, RecaptchaVerifier } from "../../Services/firebase";
import { validateIndianPhone, formatIndianPhone } from "../../Utils/validators";
import { useOtpTimer } from "../../Hooks/useOtpTimer";
import { CheckCircle2, User } from "lucide-react";

const PhoneOtpForm = ({ isSignup, onSuccess, onError }) => {
  const { sendLoginOtp, verifyLoginOtp, isFirebaseSimulated } = useContext(AuthContext);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1); // 1 = Enter phone, 2 = Enter OTP
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const { secondsLeft, startTimer, isTimerActive } = useOtpTimer(0);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Reset state when switching between login/signup tabs
  useEffect(() => {
    setStep(1);
    setPhoneNumber("");
    setName("");
    setOtpValues(["", "", "", "", "", ""]);
    setMessage("");
    setValidationError("");
    setConfirmationResult(null);
  }, [isSignup]);

  // Setup reCAPTCHA Verifier for Firebase Phone Auth
  useEffect(() => {
    if (!isFirebaseSimulated && auth) {
      if (!window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: (response) => {
              // reCAPTCHA solved
            }
          });
        } catch (error) {
          console.error("reCAPTCHA initialization failed:", error);
        }
      }
    }
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isFirebaseSimulated]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setValidationError("");
    onError("");
    setMessage("");

    if (!validateIndianPhone(phoneNumber)) {
      setValidationError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    const formattedPhone = formatIndianPhone(phoneNumber);
    try {
      const verifier = !isFirebaseSimulated ? window.recaptchaVerifier : null;
      const res = await sendLoginOtp(formattedPhone, verifier);
      if (res.success) {
        setStep(2);
        if (res.isFirebase) {
          setConfirmationResult(res.confirmationResult);
          setMessage(`Verification code sent to ${formattedPhone} via Firebase`);
        } else {
          setMessage(`OTP sent successfully to ${formattedPhone}`);
        }
        startTimer(60);
        // Focus first OTP input on next render tick
        setTimeout(() => {
          if (inputRefs[0].current) inputRefs[0].current.focus();
        }, 100);
      } else {
        onError(res.errors || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      onError("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isTimerActive) return;
    onError("");
    setMessage("");
    setLoading(true);

    const formattedPhone = formatIndianPhone(phoneNumber);
    try {
      const verifier = !isFirebaseSimulated ? window.recaptchaVerifier : null;
      const res = await sendLoginOtp(formattedPhone, verifier);
      if (res.success) {
        setMessage("A fresh verification code has been sent!");
        setOtpValues(["", "", "", "", "", ""]);
        if (res.isFirebase) {
          setConfirmationResult(res.confirmationResult);
        }
        startTimer(60);
        if (inputRefs[0].current) inputRefs[0].current.focus();
      } else {
        onError(res.errors || "Failed to resend OTP.");
      }
    } catch (err) {
      onError("Failed to resend OTP due to network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    // Auto-focus next input box if typed
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Navigate backwards on Backspace
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    onError("");
    setMessage("");

    const fullOtp = otpValues.join("");
    if (fullOtp.length !== 6) {
      onError("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (isSignup && !name.trim()) {
      onError("Full Name is required for registration.");
      return;
    }

    setLoading(true);
    const formattedPhone = formatIndianPhone(phoneNumber);
    try {
      const verifierResult = !isFirebaseSimulated ? confirmationResult : null;
      const res = await verifyLoginOtp(formattedPhone, fullOtp, isSignup ? name.trim() : "", verifierResult);
      if (res.success) {
        onSuccess(res);
      } else {
        onError(res.errors || "Incorrect verification code. Please try again.");
      }
    } catch (err) {
      onError("OTP verification failed due to network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Invisible Recaptcha Anchor for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

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
        <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Phone Input with +91 block */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="phoneNumber" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>
              Mobile Number (Indian Accounts)
            </label>
            <div className="phone-input-group">
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                id="phoneNumber"
                className="phone-number-field"
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (validationError) setValidationError("");
                }}
                disabled={loading}
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
            id="send-otp-btn"
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
            {loading ? "Initializing..." : "Request 6-Digit OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Full Name (Only for signup) */}
          {isSignup && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="fullName" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          {/* OTP Digit Boxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--text-xs)", fontWeight: "700", textAlign: "center" }}>
              Enter 6-Digit Verification Code
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
              fontSize: "13px"
            }}
          >
            {loading ? "Verifying..." : isSignup ? "Verify & Register" : "Verify & Sign In"}
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
                  Resend OTP
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
            Change Mobile Number
          </button>
        </form>
      )}
    </div>
  );
};

export default PhoneOtpForm;
