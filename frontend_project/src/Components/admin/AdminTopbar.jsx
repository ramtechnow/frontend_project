import React, { useState } from 'react';
import { User, Eye, Bell, CheckCheck, ShoppingBag, MessageSquare, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminTopbar = ({ adminUser }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Order Received",
      message: "Order #RC-9842 placed by Shriram (₹1,490)",
      time: "10 mins ago",
      type: "order",
      unread: true
    },
    {
      id: 2,
      title: "Customer Query / Concern",
      message: "Size exchange query received for Order #RC-9812",
      time: "45 mins ago",
      type: "concern",
      unread: true
    },
    {
      id: 3,
      title: "Low Inventory Alert",
      message: "Striped Flutter Blouse stock is below 5 units",
      time: "2 hours ago",
      type: "alert",
      unread: true
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markSingleAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  return (
    <header className="admin-topbar" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 500
    }}>
      {/* Title */}
      <div>
        <h2 style={{
          margin: 0,
          fontSize: '0.95rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '0.5px'
        }}>
          ADMIN CONSOLE
        </h2>
        <span style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          Manage Catalog, Accounts, and Shop Status
        </span>
      </div>

      {/* Right details */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            aria-label="View Admin Notifications"
            title="Notifications"
            style={{
              position: 'relative',
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
              minHeight: 'auto',
              padding: 0
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: 'var(--accent-color)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: '800',
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-secondary)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              maxHeight: '420px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Dropdown Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      backgroundColor: 'var(--accent-color)',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-color)',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: 0
                      }}
                    >
                      <CheckCheck size={14} /> Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markSingleAsRead(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: n.unread ? 'var(--accent-light)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: n.type === 'order' ? 'rgba(16, 185, 129, 0.15)' : n.type === 'concern' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: n.type === 'order' ? '#10b981' : n.type === 'concern' ? '#3b82f6' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        {n.type === 'order' ? <ShoppingBag size={14} /> : n.type === 'concern' ? <MessageSquare size={14} /> : <AlertCircle size={14} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.time}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Public Store link */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            backgroundColor: 'var(--accent-color)',
            border: 'none',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.78rem',
            fontWeight: '700',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            minHeight: 'auto',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
        >
          <Eye size={14} />
          Storefront
        </button>

        {/* User profile capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 4px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--border-radius-full)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Avatar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-color)',
            color: '#ffffff'
          }}>
            <User size={13} />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px'
          }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              lineHeight: 1
            }}>
              {adminUser?.name || 'Administrator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
