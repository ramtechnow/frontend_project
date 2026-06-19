import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const Toast = ({ toasts = [], removeToast }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '380px',
      width: '100%'
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            removeToast={removeToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, removeToast }) => {
  const { id, message, type = 'info', duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--bg-secondary)',
          border: '1px solid #10b981',
          accent: '#10b981',
          icon: <CheckCircle size={18} style={{ color: '#10b981' }} />
        };
      case 'error':
        return {
          bg: 'var(--bg-secondary)',
          border: '1px solid #ef4444',
          accent: '#ef4444',
          icon: <AlertCircle size={18} style={{ color: '#ef4444' }} />
        };
      case 'warning':
        return {
          bg: 'var(--bg-secondary)',
          border: '1px solid #f59e0b',
          accent: '#f59e0b',
          icon: <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
        };
      case 'info':
      default:
        return {
          bg: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          accent: 'var(--accent-color)',
          icon: <Info size={18} style={{ color: 'var(--accent-color)' }} />
        };
    }
  };

  const theme = getTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        backgroundColor: theme.bg,
        border: theme.border,
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        fontWeight: '500',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Accent Indicator Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: theme.accent
      }} />

      <div style={{ display: 'flex', flexShrink: 0 }}>
        {theme.icon}
      </div>

      <div style={{ flexGrow: 1, paddingRight: '12px', lineHeight: '1.4' }}>
        {message}
      </div>

      <button
        onClick={() => removeToast(id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          borderRadius: '50%',
          transition: 'background-color 0.2s',
          minHeight: 'auto'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};
