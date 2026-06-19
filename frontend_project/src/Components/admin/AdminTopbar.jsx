import React from 'react';
import { User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminTopbar = ({ adminUser }) => {
  const navigate = useNavigate();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Title */}
      <div>
        <h2 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '0.5px'
        }}>
          ADMIN CONSOLE
        </h2>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          Manage Catalog, Accounts, and Shop Status
        </span>
      </div>

      {/* Right details */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Public Store link */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-full)',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            minHeight: 'auto'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
        >
          <Eye size={14} />
          View Storefront
        </button>

        {/* User profile capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px 6px 6px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--border-radius-full)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Avatar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-color)',
            color: '#ffffff'
          }}>
            <User size={14} />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              lineHeight: 1
            }}>
              {adminUser?.name || 'Administrator'}
            </span>
            <span style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              lineHeight: 1
            }}>
              {adminUser?.email || 'admin@gmail.com'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
