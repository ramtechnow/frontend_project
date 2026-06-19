import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export const ConfirmModal = ({ 
  isOpen, 
  title = "Confirm Action", 
  message = "Are you sure you want to perform this action?", 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  isDestructive = false 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 17, 21, 0.65)',
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'relative',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              {/* Icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: isDestructive ? '#fef2f2' : 'var(--bg-tertiary)',
                color: isDestructive ? '#ef4444' : 'var(--accent-color)',
                flexShrink: 0
              }}>
                {isDestructive ? <AlertTriangle size={24} /> : <HelpCircle size={24} />}
              </div>

              {/* Text content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: '800',
                  color: 'var(--text-primary)'
                }}>
                  {title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}>
                  {message}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '8px'
            }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--border-radius-full)',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  minHeight: 'auto'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isDestructive ? '#ef4444' : 'var(--accent-color)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: 'var(--border-radius-full)',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: isDestructive ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(242, 62, 112, 0.2)',
                  transition: 'background-color 0.2s',
                  minHeight: 'auto'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDestructive ? '#dc2626' : 'var(--accent-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDestructive ? '#ef4444' : 'var(--accent-color)'}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
