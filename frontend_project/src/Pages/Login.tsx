import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../features/auth/hooks/useAuth";
import { 
  loginSchema, 
  signupSchema, 
  LoginFormValues, 
  SignupFormValues 
} from "../features/auth/types/authSchemas";
import { Button } from "../Components/ui/Button";
import { Input } from "../Components/ui/Input";
import { Modal } from "../Components/ui/Modal";
import { Mail, Lock, User } from "lucide-react";

export const Login: React.FC = () => {
  const [isLoginState, setIsLoginState] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { loginWithEmail, signupWithEmail, loginWithGoogle, sendForgotPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login
  const from = (location.state as any)?.from?.pathname || "/";

  // Forms setup
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: loginSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: signupSubmitting }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  });

  const onLogin = async (data: LoginFormValues) => {
    const res = await loginWithEmail(data.email, data.password);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    const res = await signupWithEmail(data.name, data.email, data.password);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const onGoogleLogin = async () => {
    const res = await loginWithGoogle();
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) return;
    setForgotLoading(true);
    const res = await sendForgotPasswordReset(forgotEmail);
    setForgotLoading(false);
    if (res.success) {
      setShowForgotModal(false);
      setForgotEmail("");
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] bg-bg-secondary border border-border rounded-lg shadow-xl p-8 flex flex-col gap-6"
      >
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <img src="/RamCart_brand_logo.png" alt="RamCart Brand Logo" style={{ height: "64px", objectFit: "contain", marginBottom: "4px" }} />
          <h1 className="text-xl font-extrabold text-text-primary flex items-center justify-center gap-2">
            {isLoginState ? "Welcome Back" : "Join RamCart"}
          </h1>
          <p className="text-xs text-text-muted">
            {isLoginState 
              ? "Sign in to access your orders, cart, and exclusive rewards." 
              : "Create an account to track your orders and enjoy fast checkout."}
          </p>
        </div>

        {/* Auth Forms */}
        {isLoginState ? (
          <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={<Mail size={16} />}
              error={loginErrors.email?.message}
              {...registerLogin("email")}
            />
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-primary tracking-wide">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-accent-pink font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                icon={<Lock size={16} />}
                error={loginErrors.password?.message}
                {...registerLogin("password")}
              />
            </div>
            <Button type="submit" isLoading={loginSubmitting} className="mt-2 h-11 w-full text-sm">
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit(onSignup)} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="E.g., Shriram Kumar"
              icon={<User size={16} />}
              error={signupErrors.name?.message}
              {...registerSignup("name")}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={<Mail size={16} />}
              error={signupErrors.email?.message}
              {...registerSignup("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              icon={<Lock size={16} />}
              error={signupErrors.password?.message}
              {...registerSignup("password")}
            />
            <Button type="submit" isLoading={signupSubmitting} className="mt-2 h-11 w-full text-sm">
              Sign Up
            </Button>
          </form>
        )}

        {/* Social Divider */}
        <div className="flex items-center gap-3">
          <div className="h-[1px] flex-grow bg-border" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">or continue with</span>
          <div className="h-[1px] flex-grow bg-border" />
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleLogin}
          className="h-11 flex items-center justify-center gap-2 border border-border hover:bg-bg-tertiary text-text-primary text-sm font-semibold transition-all duration-200"
        >
          <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Google Workspace
        </Button>

        {/* State Toggle Link */}
        <div className="text-center pt-4 border-t border-border">
          <button
            onClick={() => setIsLoginState(!isLoginState)}
            className="text-xs text-accent-pink font-semibold hover:underline"
          >
            {isLoginState ? "New to RamCart? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} title="Forgot Password">
        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
          <p className="text-xs text-text-muted leading-relaxed">
            Enter your email address and we will dispatch a secure link to reset your account password.
          </p>
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />
          <Button type="submit" isLoading={forgotLoading} className="h-10 text-xs font-semibold">
            Send Reset Link
          </Button>
        </form>
      </Modal>
    </main>
  );
};

export default Login;
