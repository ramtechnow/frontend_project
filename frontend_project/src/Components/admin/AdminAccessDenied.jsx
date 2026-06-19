import React from 'react';
import { Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminAccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '40px 32px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Lock Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
        }}>
          <Lock size={28} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '800',
            color: 'var(--text-primary)'
          }}>
            Administrative Access Denied
          </h2>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            This console is restricted to authorized Administrative Managers. Please log in using an account with Admin privileges to proceed.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--accent-color)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--border-radius-full)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(242, 62, 112, 0.15)',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
          >
            <LogIn size={16} />
            Sign In to Admin Account
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-full)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
          >
            <ArrowLeft size={16} />
            Return to Public Store
          </button>
        </div>
      </div>
    </div>
  );
};
