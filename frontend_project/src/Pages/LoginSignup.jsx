import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LoginSignup.css';
import useAuth from '../Hooks/useAuth';

export const LoginSignup = () => {
  const [state, setState] = useState("Login"); // "Login", "Sign Up", "Phone Login", "Forgot Password"
  const { login, signup, sendPasswordReset, loginWithPhone, verifyPhoneOTP } = useAuth();
  const navigate = useNavigate();
  
  // Credentials States
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });
  
  // Phone OTP States
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [activeOtp, setActiveOtp] = useState("");

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Please fill in all credentials");
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate("/");
    } else {
      alert(result.errors || "Failed to log in");
    }
  };

  const handleSignup = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert("Please fill in all registration fields");
      return;
    }

    const result = await signup(formData.username, formData.email, formData.password);
    if (result.success) {
      navigate("/");
    } else {
      alert(result.errors || "Failed to sign up");
    }
  };

  // Password reset trigger
  const handlePasswordReset = async () => {
    if (!formData.email) {
      alert("Please enter your registered Email Address first!");
      return;
    }
    
    const result = await sendPasswordReset(formData.email);
    if (result.success) {
      alert(`✉️ Success! A password reset link has been dispatched to: ${formData.email}. Please check your inbox.`);
      setState("Login");
    } else {
      alert("Error: " + result.errors);
    }
  };

  // Send OTP trigger
  const handleSendOTP = async () => {
    if (!phone) {
      alert("Please enter a valid Phone Number!");
      return;
    }
    
    const result = await loginWithPhone(phone);
    if (result.success) {
      setOtpSent(true);
      if (result.simulated) {
        setActiveOtp(result.otp);
        alert(`📱 Simulated OTP code [ ${result.otp} ] sent to: ${phone}. Please enter this code in the input below.`);
      } else {
        alert(`📱 Verification code successfully sent to: ${phone}`);
      }
    } else {
      alert("Error sending OTP: " + result.errors);
    }
  };

  // Verify OTP trigger
  const handleVerifyOTP = async () => {
    if (!otpCode) {
      alert("Please enter the 6-digit verification code!");
      return;
    }
    
    const result = await verifyPhoneOTP(phone, otpCode, activeOtp);
    if (result.success) {
      navigate("/");
    } else {
      alert(result.errors || "Invalid OTP code.");
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        
        {/* TAB TITLE */}
        <h1>
          {state === "Login" && "Login"}
          {state === "Sign Up" && "Sign Up"}
          {state === "Phone Login" && "SMS OTP Login"}
          {state === "Forgot Password" && "Reset Password"}
        </h1>

        <div className="loginsignup-fileds">
          
          {/* STANDARD SIGN UP: USERNAME */}
          {state === "Sign Up" && (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={changeHandler}
              placeholder="Your name"
            />
          )}

          {/* STANDARD LOGIN / SIGN UP / FORGOT: EMAIL */}
          {(state === "Login" || state === "Sign Up" || state === "Forgot Password") && (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={changeHandler}
              placeholder="Email Address"
            />
          )}

          {/* STANDARD LOGIN / SIGN UP: PASSWORD */}
          {(state === "Login" || state === "Sign Up") && (
            <div className="password-input-wrapper">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={changeHandler}
                placeholder="Password"
              />
              {state === "Login" && (
                <span 
                  className="forgot-password-link"
                  onClick={() => setState("Forgot Password")}
                >
                  Forgot Password?
                </span>
              )}
            </div>
          )}

          {/* PHONE LOGIN: NUMBER */}
          {state === "Phone Login" && (
            <div className="phone-otp-inputs">
              <div className="phone-send-row">
                <input
                  type="text"
                  placeholder="Mobile Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                />
                <button 
                  type="button" 
                  className="send-otp-chip-btn" 
                  onClick={handleSendOTP}
                  disabled={otpSent}
                >
                  {otpSent ? "Sent ✓" : "Send OTP"}
                </button>
              </div>

              {otpSent && (
                <input
                  type="text"
                  placeholder="Enter 6-Digit OTP Code (123456)"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />
              )}
            </div>
          )}

        </div>
        
        {/* SUBMIT BUTTON */}
        {state === "Login" && <button onClick={handleLogin}>Continue</button>}
        {state === "Sign Up" && <button onClick={handleSignup}>Continue</button>}
        {state === "Forgot Password" && <button onClick={handlePasswordReset}>Send Reset Link</button>}
        {state === "Phone Login" && (
          <button 
            onClick={handleVerifyOTP} 
            disabled={!otpSent}
            style={{ opacity: otpSent ? 1 : 0.6 }}
          >
            Verify & Login
          </button>
        )}

        {/* BOTTOM NAVIGATION LINKS */}
        <div className="loginsignup-bottom-links">
          {state === "Sign Up" ? (
            <p className="loginsignup-login">
              Already have an account?{" "}
              <span onClick={() => setState("Login")}>Login here</span>
            </p>
          ) : state === "Login" ? (
            <div className="login-alternative-links">
              <p className="loginsignup-login">
                Don't have an account?{" "}
                <span onClick={() => setState("Sign Up")}>Click here</span>
              </p>
              <p className="alternative-login-link">
                Or prefer SMS?{" "}
                <span onClick={() => setState("Phone Login")}>Login with Mobile OTP</span>
              </p>
            </div>
          ) : state === "Phone Login" ? (
            <p className="loginsignup-login">
              Go back to standard{" "}
              <span onClick={() => { setState("Login"); setOtpSent(false); }}>Email Login</span>
            </p>
          ) : (
            <p className="loginsignup-login">
              Return to{" "}
              <span onClick={() => setState("Login")}>Login screen</span>
            </p>
          )}
        </div>

        {/* PRIVACY POLICY */}
        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" defaultChecked />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
