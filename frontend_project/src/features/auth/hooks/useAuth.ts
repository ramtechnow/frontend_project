import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
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
  updateProfile
} from "firebase/auth";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  // Subscribe to Firebase Auth state updates on mount
  useEffect(() => {
    dispatch(setAuthLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          dispatch(setUser(profile));
        } catch (err: any) {
          console.error("Failed to sync user profile:", err);
          dispatch(setAuthError(err.message || "Failed to load user profile"));
        }
      } else {
        dispatch(clearAuth());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const loginWithEmail = async (email: string, pass: string) => {
    dispatch(setAuthLoading(true));
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await syncUserProfile(result.user);
      dispatch(setUser(profile));
      dispatch(addToast({ message: "Logged in successfully!", type: "success" }));
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

  return {
    user,
    loading,
    error,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logoutUser,
    sendForgotPasswordReset
  };
};
