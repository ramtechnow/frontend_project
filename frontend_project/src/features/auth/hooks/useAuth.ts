import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setUser, setAuthLoading, setAuthError, clearAuth } from "../../../store/slices/authSlice";
import { addToast } from "../../../store/slices/toastSlice";
import { auth } from "../../../config/firebase";
import { syncUserProfile } from "../services/authService";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const loginWithEmail = async (email: string, pass: string) => {
    dispatch(setAuthLoading(true));
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await syncUserProfile(result.user);
      dispatch(setUser(profile));
      dispatch(addToast({ message: "Logged in successfully!", type: "success" }));
      
      if (!result.user.emailVerified) {
        dispatch(addToast({ 
          message: "Reminder: Your email is not verified yet. Please check your inbox.", 
          type: "warning" 
        }));
      }
      
      return { success: true };
    } catch (err: any) {
      dispatch(setAuthError(err.message));
      dispatch(addToast({ message: err.message || "Login failed", type: "error" }));
      return { success: false, error: err.message };
    }
  };

  const signupWithEmail = async (name: string, email: string, pass: string) => {
    dispatch(setAuthLoading(true));
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      
      // Dispatch email verification link
      try {
        await sendEmailVerification(result.user);
        dispatch(addToast({ message: "Verification link sent to your email!", type: "info" }));
      } catch (verifyErr) {
        console.warn("Failed to dispatch initial email verification:", verifyErr);
      }
      
      const profile = await syncUserProfile(result.user, name);
      dispatch(setUser(profile));
      dispatch(addToast({ message: "Account created successfully!", type: "success" }));
      return { success: true };
    } catch (err: any) {
      dispatch(setAuthError(err.message));
      dispatch(addToast({ message: err.message || "Registration failed", type: "error" }));
      return { success: false, error: err.message };
    }
  };

  const loginWithGoogle = async () => {
    dispatch(setAuthLoading(true));
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(result.user);
      dispatch(setUser(profile));
      dispatch(addToast({ message: "Logged in with Google!", type: "success" }));
      return { success: true };
    } catch (err: any) {
      dispatch(setAuthError(err.message));
      dispatch(addToast({ message: err.message || "Google authentication failed", type: "error" }));
      return { success: false, error: err.message };
    }
  };

  const logoutUser = async () => {
    dispatch(setAuthLoading(true));
    try {
      await signOut(auth);
      localStorage.removeItem("auth-token");
      dispatch(clearAuth());
      dispatch(addToast({ message: "Signed out successfully.", type: "info" }));
      return { success: true };
    } catch (err: any) {
      dispatch(setAuthError(err.message));
      return { success: false, error: err.message };
    }
  };

  const sendForgotPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      dispatch(addToast({ message: "Password reset link sent to your email!", type: "success" }));
      return { success: true };
    } catch (err: any) {
      dispatch(addToast({ message: err.message || "Failed to send reset link", type: "error" }));
      return { success: false, error: err.message };
    }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        dispatch(addToast({ message: "Verification link sent to your email!", type: "success" }));
        return { success: true };
      } catch (err: any) {
        dispatch(addToast({ message: err.message || "Failed to resend verification email", type: "error" }));
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: "No user currently authenticated" };
  };

  return {
    user,
    loading,
    error,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logoutUser,
    sendForgotPasswordReset,
    resendVerificationEmail
  };
};
