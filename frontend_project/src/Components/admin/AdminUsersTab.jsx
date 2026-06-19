import React, { useState } from 'react';
import { User, ShoppingCart, Settings, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';

export const AdminUsersTab = ({ 
  users = [], 
  products = [], 
  onRefreshUsers, 
  addToast, 
  triggerConfirm,
  logAction
}) => {
  const [expandedUserEmail, setExpandedUserEmail] = useState(null);

  // Cart normalization helpers
  const getNormalizedCartItems = (cartData) => {
    if (!cartData || typeof cartData !== "object") return [];
    const normalized = [];
    Object.keys(cartData).forEach((key) => {
      const value = cartData[key];
      if (value === undefined || value === null) return;
      
      const parts = key.split("-");
      const keyId = Number(parts[0]);
      if (isNaN(keyId)) return;
      
      let size = parts[1] || "M";
      let color = parts[2] || "White";
      let quantity = 0;
      let id = keyId;

      if (typeof value === "object") {
        quantity = Number(value.quantity) || 0;
        if (value.id !== undefined) id = Number(value.id);
        if (value.size !== undefined) size = value.size;
        if (value.color !== undefined) color = value.color;
      } else {
        quantity = Number(value) || 0;
      }

      if (quantity > 0) {
        normalized.push({ id, size, color, quantity });
      }
    });
    return normalized;
  };

  const calculateCartItemsCount = (cartData) => {
    const items = getNormalizedCartItems(cartData);
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const handleToggleRole = (user) => {
    const nextRole = !user.isAdmin;
    const confirmMsg = nextRole 
      ? `Are you sure you want to promote "${user.name}" (${user.email}) to an Administrative Manager?`
      : `Are you sure you want to revoke Administrative privileges for "${user.name}" (${user.email})?`;

    triggerConfirm({
      title: nextRole ? "Promote User to Admin?" : "Revoke Admin Privileges?",
      message: confirmMsg,
      confirmText: nextRole ? "Promote" : "Revoke Privileges",
      onConfirm: async () => {
        try {
          await adminApi.updateUserRole(user.email, nextRole);
          addToast(`Successfully updated user role for ${user.email}`, "success");
          logAction(`${nextRole ? 'Promoted' : 'Demoted'} user role: ${user.email}`);
          onRefreshUsers();
        } catch (err) {
          console.error(err);
          addToast(err.message || "Failed to update user role", "error");
        }
      }
    });
  };

  const handleDeleteUser = (user) => {
    triggerConfirm({
      title: "Terminate User Account?",
      message: `⚠️ WARNING: Are you sure you want to permanently delete the account of "${user.name}" (${user.email})? This will delete their profile and cart data forever.`,
      isDestructive: true,
      confirmText: "Delete Account",
      onConfirm: async () => {
        try {
          await adminApi.deleteUser(user.email);
          addToast("🎉 Account successfully terminated!", "success");
          logAction(`Deleted user account: ${user.email}`);
          onRefreshUsers();
        } catch (err) {
          console.error(err);
          addToast(err.message || "Failed to delete user account", "error");
        }
      }
    });
  };

  return (
    <div className="admin-users-section animate-fade-in">
      <h2>Accounts Directory & Active Carts</h2>
      <p className="admin-helper-note">
        💡 <strong>Carts Audit Mode:</strong> Click any user profile row in the directory below to expand their details and view active items inside their shopping carts. You can adjust administrative roles or terminate accounts as needed.
      </p>
      
      <div className="table-wrapper" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>User Profile Name</th>
              <th>Email Address</th>
              <th>Administrative Role</th>
              <th style={{ textAlign: 'center' }}>Cart Contents</th>
              <th style={{ paddingRight: '24px', textAlign: 'right' }}>Controls</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const isExpanded = expandedUserEmail === u.email;
              const normalizedItems = getNormalizedCartItems(u.cartData);
              const totalQty = calculateCartItemsCount(u.cartData);

              return (
                <React.Fragment key={i}>
                  {/* Main User row */}
                  <tr 
                    className={`user-main-row ${isExpanded ? "active-expanded" : ""} ${u.isAdmin ? "admin-account-tr" : ""}`}
                    onClick={() => setExpandedUserEmail(isExpanded ? null : u.email)}
                    style={{ cursor: "pointer", transition: 'background-color 0.2s' }}
                  >
                    <td className="user-name-cell" style={{ paddingLeft: '24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: 'none' }}>
                      <span className="expand-indicator" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                      <User size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span>{u.name}</span>
                    </td>
                    
                    <td className="user-email-cell" style={{ verticalAlign: 'middle' }}>{u.email}</td>
                    
                    <td style={{ verticalAlign: 'middle' }}>
                      <span className={`role-badge ${u.isAdmin ? 'admin' : 'customer'}`} style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 'var(--border-radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        {u.isAdmin ? "ADMIN PRIVILEGES" : "STANDARD CUSTOMER"}
                      </span>
                    </td>
                    
                    <td className="user-cart-count-cell" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      <span className="user-items-added" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <ShoppingCart size={14} style={{ color: 'var(--accent-color)' }} /> 
                        <span>{totalQty} {totalQty === 1 ? 'Item' : 'Items'}</span>
                      </span>
                    </td>
                    
                    <td onClick={(e) => e.stopPropagation()} style={{ paddingRight: '24px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div className="action-buttons-wrapper" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          type="button"
                          className="user-role-toggle-btn"
                          onClick={() => handleToggleRole(u)}
                          style={{
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            padding: '8px 14px',
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--border-radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Settings size={12} />
                          {u.isAdmin ? "Revoke Admin" : "Promote to Admin"}
                        </button>
                        <button 
                          type="button"
                          className="user-delete-btn"
                          onClick={() => handleDeleteUser(u)}
                          style={{
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            padding: '8px 14px',
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: 'var(--border-radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} />
                          Terminate
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Cart details list */}
                  {isExpanded && (
                    <tr className="user-detail-drawer-row">
                      <td colSpan="5" className="drawer-container-td" style={{ backgroundColor: 'var(--bg-primary)', padding: '16px 24px' }}>
                        <div className="user-drawer-card animate-slide-down" style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          padding: '20px'
                        }}>
                          <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: '800' }}>🛒 Active Basket Audit for {u.name}</h4>
                          {normalizedItems.length === 0 ? (
                            <p className="empty-drawer-note" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No items currently stored inside this user's shopping basket.</p>
                          ) : (
                            <div className="drawer-cart-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {normalizedItems.map((cartItem, idx) => {
                                const prodDetails = products.find(p => p.id === cartItem.id);
                                return (
                                  <div key={idx} className="drawer-cart-item-row" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-primary)'
                                  }}>
                                    {prodDetails ? (
                                      <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <img src={prodDetails.image} alt={prodDetails.name} className="drawer-prod-thumb" style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                                          <div className="drawer-prod-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="item-title" style={{ fontSize: '0.85rem', fontWeight: '700' }}>{prodDetails.name}</span>
                                            <div className="item-specs" style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                              <span>Size: <strong>{cartItem.size}</strong></span>
                                              <span>Color: <strong>{cartItem.color}</strong></span>
                                              <span>Qty: <strong>{cartItem.quantity}</strong></span>
                                              <span>Unit Price: <strong>${prodDetails.new_price}</strong></span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="drawer-item-total" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                                          <span>Total: <strong>${prodDetails.new_price * cartItem.quantity}</strong></span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="drawer-corrupted-item" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span>⚠️ Legacy Product ID #{cartItem.id} | Size: {cartItem.size} | Color: {cartItem.color} | Qty: {cartItem.quantity} (Product deleted from database)</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No registered users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
