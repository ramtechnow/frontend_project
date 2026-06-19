import React, { createContext, useState, useEffect } from "react";
import { 
  auth, 
  isFirebaseSimulated,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "../Services/firebase";
import { BACKEND_URL } from "../config";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Decode JWT payload helper
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user; // Contains id, isAdmin, name
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!isFirebaseSimulated && auth) {
      // 1. Firebase Auth listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Parse user claims or map admin privileges (Admin@gmail.com matches admin)
          const isAdmin = user.email.toLowerCase() === "admin@gmail.com";
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            isAdmin: isAdmin,
            isFirebase: true
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // 2. Simulated / Custom JWT Auth listener
      const token = localStorage.getItem("auth-token");
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          const storedEmail = localStorage.getItem("user-email");
          const storedName = localStorage.getItem("user-name");
          setCurrentUser({
            uid: decoded.id,
            email: storedEmail || decoded.email || (decoded.id === "Admin" ? "admin@gmail.com" : "user@gmail.com"),
            displayName: storedName || decoded.name || (decoded.id === "Admin" ? "Admin" : "Shopper"),
            isAdmin: decoded.isAdmin || false,
            isFirebase: false
          });
        }
      }
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (!isFirebaseSimulated && auth) {
        // Firebase Authentication
        const result = await signInWithEmailAndPassword(auth, email, password);
        setLoading(false);
        return { success: true, user: result.user };
      } else {
        // Custom Backend JWT Auth
        const response = await fetch(`${BACKEND_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (data.success) {
          localStorage.setItem("auth-token", data.token);
          window.dispatchEvent(new Event('auth-change'));
          const decoded = decodeToken(data.token);
          
          // Pre-extract displayName from email for rendering
          const username = email.split('@')[0];
          const displayNameValue = decoded?.name || username;
          localStorage.setItem("user-email", email);
          localStorage.setItem("user-name", displayNameValue);

          const userObj = {
            uid: decoded?.id,
            email: email,
            displayName: displayNameValue,
            isAdmin: decoded?.isAdmin || false,
            isFirebase: false
          };
          
          setCurrentUser(userObj);
          setLoading(false);
          return { success: true };
        } else {
          setLoading(false);
          return { success: false, errors: data.errors || "Failed to log in" };
        }
      }
    } catch (error) {
      setLoading(false);
      return { success: false, errors: error.message || "Network Connection Error" };
    }
  };

  // Signup / Registration handler
  const signup = async (username, email, password) => {
    setLoading(true);
    try {
      if (!isFirebaseSimulated && auth) {
        // Firebase Authentication
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: username });
        setLoading(false);
        return { success: true, user: result.user };
      } else {
        // Custom Backend JWT Auth
        const response = await fetch(`${BACKEND_URL}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();

        if (data.success) {
          localStorage.setItem("auth-token", data.token);
          window.dispatchEvent(new Event('auth-change'));
          const decoded = decodeToken(data.token);
          
          localStorage.setItem("user-email", email);
          localStorage.setItem("user-name", username);

          const userObj = {
            uid: decoded?.id,
            email: email,
            displayName: username,
            isAdmin: decoded?.isAdmin || false,
            isFirebase: false
          };
          setCurrentUser(userObj);
          setLoading(false);
          return { success: true };
        } else {
          setLoading(false);
          return { success: false, errors: data.errors || "Failed to sign up" };
        }
      }
    } catch (error) {
      setLoading(false);
      return { success: false, errors: error.message || "Network Connection Error" };
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      if (!isFirebaseSimulated && auth) {
        await signOut(auth);
      }
      localStorage.removeItem("auth-token");
      localStorage.removeItem("cart-items");
      localStorage.removeItem("user-wishlist");
      localStorage.removeItem("user-email");
      localStorage.removeItem("user-name");
      window.dispatchEvent(new Event('auth-change'));
      setCurrentUser(null);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, errors: error.message || "Failed to log out" };
    }
  };

  // Password Reset Link Dispatcher
  const sendPasswordReset = async (email) => {
    try {
      if (!isFirebaseSimulated && auth) {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } else {
        console.log(`✉️ Simulated password reset dispatched to ${email}`);
        return { success: true, message: "Simulated password reset email sent" };
      }
    } catch (error) {
      return { success: false, errors: error.message };
    }
  };

  // Login With Phone / SMS Verification
  const loginWithPhone = async (phoneNumber) => {
    try {
      if (!isFirebaseSimulated && auth) {
        return { success: true, simulated: false };
      } else {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`📱 Simulated SMS OTP [${generatedOtp}] sent to ${phoneNumber}`);
        return { success: true, simulated: true, otp: generatedOtp };
      }
    } catch (error) {
      return { success: false, errors: error.message };
    }
  };

  // Verify Phone OTP and login
  const verifyPhoneOTP = async (phoneNumber, otpCode, activeOtp) => {
    try {
      if (!isFirebaseSimulated && auth) {
        return { success: true };
      } else {
        if (otpCode === activeOtp || (isFirebaseSimulated && otpCode === "123456")) {
          const userObj = {
            uid: "simulated-phone-user",
            email: `${phoneNumber}@sms.com`,
            displayName: phoneNumber,
            isAdmin: false,
            isFirebase: false
          };
          localStorage.setItem("user-email", `${phoneNumber}@sms.com`);
          localStorage.setItem("user-name", phoneNumber);
          setCurrentUser(userObj);
          return { success: true };
        } else {
          return { success: false, errors: `Invalid OTP code. Try entering ${activeOtp}.` };
        }
      }
    } catch (error) {
      return { success: false, errors: error.message };
    }
  };

  // 1. Send Login OTP to Indian mobile number
  const sendLoginOtp = async (phone) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, errors: error.message || "Network connection error" };
    }
  };

  // 2. Verify Phone OTP and log in / register
  const verifyLoginOtp = async (phone, otp, name) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        window.dispatchEvent(new Event('auth-change'));
        const decoded = decodeToken(data.token);
        
        localStorage.setItem("user-email", data.user.email || `${phone.replace('+', '')}@shopper.in`);
        localStorage.setItem("user-name", data.user.name);

        const userObj = {
          uid: decoded?.id,
          email: data.user.email,
          displayName: data.user.name,
          isAdmin: decoded?.isAdmin || false,
          isFirebase: false
        };
        setCurrentUser(userObj);
      }
      return data;
    } catch (error) {
      return { success: false, errors: error.message || "Network connection error" };
    }
  };

  // 3. Send Forgot Password OTP
  const sendForgotPasswordOtp = async (email) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, errors: error.message || "Network connection error" };
    }
  };

  // 4. Reset Password with OTP
  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, errors: error.message || "Network connection error" };
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    sendPasswordReset,
    loginWithPhone,
    verifyPhoneOTP,
    isFirebaseSimulated,
    sendLoginOtp,
    verifyLoginOtp,
    sendForgotPasswordOtp,
    resetPasswordWithOtp
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
