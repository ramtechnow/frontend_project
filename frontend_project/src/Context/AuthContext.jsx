import React, { createContext, useState, useEffect } from "react";
import { 
  auth, 
  isFirebaseSimulated,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPhoneNumber
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
          const isAdmin = user.email.toLowerCase() === "admin@gmail.com";
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            isAdmin: isAdmin,
            isFirebase: true
          });

          // Automatically sync with backend to get the JWT if missing
          const token = localStorage.getItem("auth-token");
          if (!token) {
            try {
              const response = await fetch(`${BACKEND_URL}/auth/firebase-sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  email: user.email, 
                  uid: user.uid, 
                  name: user.displayName || user.email.split('@')[0] 
                }),
              });
              const data = await response.json();
              if (data.success) {
                localStorage.setItem("auth-token", data.token);
                localStorage.setItem("user-email", user.email);
                localStorage.setItem("user-name", user.displayName || user.email.split('@')[0]);
                window.dispatchEvent(new Event('auth-change'));
              }
            } catch (err) {
              console.error("Failed to sync on reload:", err);
            }
          }
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
        
        // Sync with backend to retrieve JWT
        const nameVal = result.user.displayName || email.split('@')[0];
        const response = await fetch(`${BACKEND_URL}/auth/firebase-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, uid: result.user.uid, name: nameVal }),
        });
        const data = await response.json();

        if (data.success) {
          localStorage.setItem("auth-token", data.token);
          window.dispatchEvent(new Event('auth-change'));
          const decoded = decodeToken(data.token);
          
          localStorage.setItem("user-email", email);
          localStorage.setItem("user-name", nameVal);

          const userObj = {
            uid: decoded?.id || result.user.uid,
            email: email,
            displayName: nameVal,
            isAdmin: decoded?.isAdmin || false,
            isFirebase: true
          };
          setCurrentUser(userObj);
          setLoading(false);
          return { success: true, user: result.user };
        } else {
          setLoading(false);
          return { success: false, errors: data.errors || "Failed to sync user session with server" };
        }
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
        
        // Sync with backend to auto-register in MongoDB and get JWT
        const response = await fetch(`${BACKEND_URL}/auth/firebase-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, uid: result.user.uid, name: username }),
        });
        const data = await response.json();

        if (data.success) {
          localStorage.setItem("auth-token", data.token);
          window.dispatchEvent(new Event('auth-change'));
          const decoded = decodeToken(data.token);
          
          localStorage.setItem("user-email", email);
          localStorage.setItem("user-name", username);

          const userObj = {
            uid: decoded?.id || result.user.uid,
            email: email,
            displayName: username,
            isAdmin: decoded?.isAdmin || false,
            isFirebase: true
          };
          setCurrentUser(userObj);
          setLoading(false);
          return { success: true, user: result.user };
        } else {
          setLoading(false);
          return { success: false, errors: data.errors || "Failed to initialize user session on server" };
        }
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

  // 1. Send Login OTP to Indian mobile number (Supports Firebase Auth & Fallback)
  const sendLoginOtp = async (phone, recaptchaVerifier = null) => {
    try {
      if (!isFirebaseSimulated && auth && recaptchaVerifier) {
        // Real Firebase Phone Authentication
        const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
        return { success: true, isFirebase: true, confirmationResult };
      } else {
        // Fallback to custom backend OTP flow
        const response = await fetch(`${BACKEND_URL}/auth/send-login-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        const data = await response.json();
        return { ...data, isFirebase: false };
      }
    } catch (error) {
      return { success: false, errors: error.message || "Network connection error" };
    }
  };

  // 2. Verify Phone OTP and log in / register (Supports Firebase Auth & Fallback)
  const verifyLoginOtp = async (phone, otp, name, confirmationResult = null) => {
    try {
      if (confirmationResult) {
        // Real Firebase Phone Auth confirmation
        const result = await confirmationResult.confirm(otp);
        const user = result.user;
        const idToken = await user.getIdToken();
        
        // Sync with backend database
        const response = await fetch(`${BACKEND_URL}/auth/firebase-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, uid: user.uid, name, idToken }),
        });
        const data = await response.json();

        if (data.success) {
          localStorage.setItem("auth-token", data.token);
          window.dispatchEvent(new Event('auth-change'));
          const decoded = decodeToken(data.token);
          
          localStorage.setItem("user-email", data.user.email || `${phone.replace('+', '')}@shopper.in`);
          localStorage.setItem("user-name", data.user.name);

          const userObj = {
            uid: decoded?.id || user.uid,
            email: data.user.email,
            displayName: data.user.name,
            isAdmin: decoded?.isAdmin || false,
            isFirebase: true
          };
          setCurrentUser(userObj);
        }
        return data;
      } else {
        // Custom backend / simulation verification
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
      }
    } catch (error) {
      return { success: false, errors: error.message || "Network connection error" };
    }
  };

  // 3. Send Forgot Password OTP / Reset Link
  // When Firebase is configured → uses Firebase sendPasswordResetEmail (free, no SMTP, no Render)
  // When Firebase is not configured → falls back to backend OTP email via SMTP
  const sendForgotPasswordOtp = async (email) => {
    try {
      if (!isFirebaseSimulated && auth) {
        // Firebase sends the reset email directly — no SMTP or Render involved
        await sendPasswordResetEmail(auth, email);
        return {
          success: true,
          isFirebase: true,
          message: "If this email is registered, a password reset link has been sent. Check your inbox and spam folder."
        };
      } else {
        // Fallback: backend OTP email via SMTP (local dev without Firebase)
        const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        return { ...data, isFirebase: false };
      }
    } catch (error) {
      // Return generic success for ALL Firebase errors including auth/user-not-found
      // This prevents attackers from probing which emails are registered
      if (!isFirebaseSimulated) {
        return {
          success: true,
          isFirebase: true,
          message: "If this email is registered, a password reset link has been sent. Check your inbox and spam folder."
        };
      }
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
