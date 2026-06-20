import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { CartContext } from "../Context/CartContext";
import ForgotPasswordForm from "../Components/auth/ForgotPasswordForm";
import { AlertCircle, Lock, Mail, User, ShieldAlert, Sparkles } from "lucide-react";
import "../Styles/auth.css";

const Login = () => {
  const [isLoginState, setIsLoginState] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login, signup } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Reset errors on state toggles
  useEffect(() => {
    setErrorMsg("");
  }, [isLoginState]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const emailVal = formData.email.trim();
    const passVal = formData.password.trim();
    const nameVal = formData.name.trim();

    if (!emailVal || !passVal || (!isLoginState && !nameVal)) {
      setErrorMsg("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      if (isLoginState) {
        const res = await login(emailVal, passVal);
        if (res.success) {
          clearCart(); // Clear old local cart to load database cart
          const isUserAdmin = emailVal.toLowerCase() === "admin@gmail.com" || (res.user && res.user.isAdmin);
          if (isUserAdmin) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          setErrorMsg(res.errors || "Failed to login. Please check credentials.");
        }
      } else {
        const res = await signup(nameVal, emailVal, passVal);
        if (res.success) {
          clearCart();
          const isUserAdmin = emailVal.toLowerCase() === "admin@gmail.com" || (res.user && res.user.isAdmin);
          if (isUserAdmin) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          setErrorMsg(res.errors || "Failed to create account. Please try again.");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected server connection error occurred.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="login-container">
      <div className="login-card">
        {/* Title & Copy */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Sparkles size={20} style={{ color: "var(--accent-pink)" }} />
            {isLoginState ? "Welcome Back" : "Join SHOPPER"}
          </h1>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "6px" }}>
            {isLoginState 
              ? "Sign in to access your orders, cart, and exclusive rewards." 
              : "Create an account to track your orders and enjoy fast checkout."}
          </p>
        </div>

        {/* Credentials Tip */}
        <div 
          style={{ 
            backgroundColor: "var(--accent-light)", 
            color: "var(--accent-pink)", 
            fontSize: "11px", 
            padding: "10px", 
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "700" }}>
            <ShieldAlert size={12} />
            <span>Quick Login Credentials:</span>
          </div>
          <span>Email: <strong>user@gmail.com</strong> | Pass: <strong>user123</strong></span>
          <span>Admin: <strong>Admin@gmail.com</strong> | Pass: <strong>Admin@1234</strong></span>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              backgroundColor: "#fef2f2", 
              border: "1px solid #fecaca", 
              borderRadius: "var(--border-radius-sm)", 
              padding: "10px 12px",
              color: "#ef4444",
              fontSize: "13px"
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Name Input (Signup Only) */}
          {!isLoginState && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="name" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  placeholder="E.g., Shriram Kumar"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="email" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
              <input 
                type="email" 
                id="email"
                name="email"
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Password</label>
              {isLoginState && (
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{ 
                    fontSize: "11px", 
                    color: "var(--accent-pink)", 
                    fontWeight: "700",
                    background: "none", 
                    border: "none", 
                    cursor: "pointer",
                    minHeight: "auto",
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
              <input 
                type="password" 
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
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
            {loading ? "Please wait..." : isLoginState ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle sign in / sign up state links */}
        <div style={{ textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-4)" }}>
          <button 
            style={{ fontSize: "var(--text-xs)", color: "var(--accent-pink)", fontWeight: "600", minHeight: "auto" }}
            onClick={() => { setIsLoginState(!isLoginState); setErrorMsg(""); }}
          >
            {isLoginState ? "New to SHOPPER? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordForm onClose={() => setShowForgotPassword(false)} />
      )}
    </main>
  );
};

export default Login;
