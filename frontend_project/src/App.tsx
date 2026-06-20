import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ToastContainer } from "./Components/ui/ToastContainer";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { syncUserProfile } from "./features/auth/services/authService";
import { setUser, setAuthLoading, setAuthError, clearAuth } from "./store/slices/authSlice";
import { useAppDispatch } from "./store/hooks";

// Lazy load pages for code splitting and optimized bundles
const Home = lazy(() => import("./Pages/Home"));
const Shop = lazy(() => import("./Pages/Shop"));
const ProductDetail = lazy(() => import("./Pages/ProductDetail"));
const Cart = lazy(() => import("./Pages/Cart"));
const Wishlist = lazy(() => import("./Pages/Wishlist"));
const Checkout = lazy(() => import("./Pages/Checkout"));
const Orders = lazy(() => import("./Pages/Orders"));
const Login = lazy(() => import("./Pages/Login"));
const AdminPanel = lazy(() => import("./Pages/AdminPanel"));
const NotFound = lazy(() => import("./Pages/NotFound"));

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

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
  return (
    <BrowserRouter>
      <div 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          minHeight: "100vh",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)"
        }}
      >
        {/* Global Navigation Header */}
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        
        {/* Main Content Viewport with Suspense fallback */}
        <div style={{ flexGrow: 1 }}>
          <Suspense 
            fallback={
              <div className="min-h-[60vh] flex items-center justify-center bg-bg-primary text-text-primary">
                <div className="w-10 h-10 border-4 border-border border-t-accent-pink rounded-full animate-spin" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Shop />} />
              <Route path="/mens" element={<Shop category="men" />} />
              <Route path="/womens" element={<Shop category="women" />} />
              <Route path="/kids" element={<Shop category="kid" />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              
              {/* Protected Customer Routes */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />

              {/* Public/Auth Page */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Administrator Route */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
        
        {/* Global Footer */}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>

      {/* Global Toast Notification System */}
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
