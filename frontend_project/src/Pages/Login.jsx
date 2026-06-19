import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { CartContext } from "../Context/CartContext";
import { AlertCircle, Lock, Mail, User, ShieldAlert } from "lucide-react";

const Login = () => {
  const [isLoginState, setIsLoginState] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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
        // Run login
        const res = await login(emailVal, passVal);
        if (res.success) {
          clearCart(); // Clear old local cart to load user synced cart
          navigate("/");
        } else {
          setErrorMsg(res.error || "Failed to login. Check credentials.");
        }
      } else {
        // Run signup
        const res = await signup(emailVal, passVal, nameVal);
        if (res.success) {
          navigate("/");
        } else {
          setErrorMsg(res.error || "Failed to create account. Check inputs.");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main 
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-12) var(--space-4)"
      }}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--border-radius-lg)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)"
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "800" }}>
            {isLoginState ? "Sign In" : "Create Account"}
          </h1>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>
            {isLoginState ? "Access your cart, wishlist, and orders" : "Sign up to track purchases"}
          </p>
        </div>

        {/* Demo Details Note */}
        <div 
          style={{ 
            backgroundColor: "var(--accent-light)", 
            color: "var(--accent-pink)", 
            fontSize: "11px", 
            padding: "8px 10px", 
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "700" }}>
            <ShieldAlert size={12} />
            <span>Demo Credentials Available:</span>
          </div>
          <span>Email: <strong>user@gmail.com</strong> | Password: <strong>user123</strong></span>
          <span>Admin: <strong>admin@gmail.com</strong> | Password: <strong>admin123</strong></span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
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

          {/* Name input (only for signup) */}
          {!isLoginState && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="name" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="email" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
              <input 
                type="email" 
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Password input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="password" style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
              <input 
                type="password" 
                id="password"
                name="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={formData.password}
                onChange={handleInputChange}
                style={{ width: "100%", height: "44px", paddingLeft: "36px", paddingRight: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Submit btn */}
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

        {/* State Toggle links */}
        <div style={{ textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-4)" }}>
          <button 
            style={{ fontSize: "var(--text-xs)", color: "var(--accent-pink)", fontWeight: "600", minHeight: "auto" }}
            onClick={() => { setIsLoginState(!isLoginState); setErrorMsg(""); }}
          >
            {isLoginState ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Login;
