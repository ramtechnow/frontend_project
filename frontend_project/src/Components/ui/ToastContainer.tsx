import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { removeToast } from "../../store/slices/toastSlice";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info
          }[toast.type];

          const colors = {
            success: "bg-green-50 border-green-200 text-green-800",
            error: "bg-red-50 border-red-200 text-red-800",
            warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
            info: "bg-blue-50 border-blue-200 text-blue-800"
          }[toast.type];

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 p-4 border rounded-md shadow-lg pointer-events-auto ${colors}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon size={18} />
              </div>
              <div className="flex-grow text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => dispatch(removeToast(toast.id))}
                className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
