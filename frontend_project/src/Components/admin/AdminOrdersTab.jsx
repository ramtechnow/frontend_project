import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, Trash2, Mail, User } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';

export const AdminOrdersTab = ({ 
  orders = [], 
  products = [], 
  onRefreshOrders, 
  addToast,
  triggerConfirm,
  logAction
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      addToast(`🎉 Order status updated to ${newStatus}`, "success");
      logAction(`Updated order ${orderId} shipping status to "${newStatus}"`);
      onRefreshOrders();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = (orderId) => {
    triggerConfirm({
      title: 'Delete Order Record?',
      message: `Are you sure you want to permanently delete order #${orderId}? This record will be removed.`,
      isDestructive: true,
      confirmText: 'Delete Order',
      onConfirm: async () => {
        try {
          await adminApi.deleteOrder(orderId);
          addToast('🎉 Order record deleted successfully!', 'success');
          logAction(`Deleted order record ${orderId}`);
          onRefreshOrders();
        } catch (err) {
          console.error(err);
          addToast(err.message || 'Failed to delete order record', 'error');
        }
      }
    });
  };

  return (
    <div className="admin-orders-section animate-fade-in">
      <h2>Order Tracking & Management</h2>
      <p className="admin-helper-note">
        💡 <strong>Order Management:</strong> View customer email addresses, update delivery status, and delete test orders. Click an order row to view full address details and purchased item lists.
      </p>

      <div className="table-wrapper" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Order ID</th>
              <th>Customer Name & Email</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th style={{ paddingRight: '24px' }}>Delivery Status & Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const isExpanded = expandedOrderId === o._id;
              const orderDate = new Date(o.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <React.Fragment key={o._id}>
                  {/* Main Order row */}
                  <tr 
                    className={`order-main-row ${isExpanded ? "active-expanded" : ""}`}
                    onClick={() => setExpandedOrderId(isExpanded ? null : o._id)}
                    style={{ cursor: "pointer", transition: 'background-color 0.2s' }}
                  >
                    <td className="order-id-cell" style={{ paddingLeft: '24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: 'none' }}>
                      <span className="expand-indicator">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                      <strong>{o._id ? o._id.substring(0, 10) : 'RC-9842'}</strong>
                    </td>
                    
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="user-info-stack" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="prod-name-bold" style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={12} style={{ color: 'var(--accent-color)' }} />
                          {o.userName || o.address?.fullName || "Customer"}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={11} />
                          {o.userEmail || o.address?.email || "customer@example.com"}
                        </span>
                      </div>
                    </td>
                    
                    <td style={{ verticalAlign: 'middle', fontSize: '12px' }}>{orderDate}</td>
                    
                    <td className="price-cell" style={{ verticalAlign: 'middle', fontWeight: '800', color: 'var(--accent-color)' }}>₹{o.amount}</td>
                    
                    <td style={{ verticalAlign: 'middle' }}>
                      <span className={`payment-status-badge ${o.payment ? 'paid' : 'unpaid'}`} style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 'var(--border-radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        {o.payment ? "PAID" : "UNPAID"}
                      </span>
                    </td>
                    
                    <td onClick={(e) => e.stopPropagation()} style={{ paddingRight: '24px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          className="order-status-select"
                          value={o.status}
                          disabled={o.status === "Delivered" || updatingOrderId === o._id}
                          onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                          style={{
                            height: '32px',
                            padding: '0 8px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            outline: 'none',
                            cursor: o.status === "Delivered" ? 'not-allowed' : 'pointer',
                            opacity: o.status === "Delivered" ? 0.7 : 1
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>

                        {updatingOrderId === o._id ? (
                          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-color)' }} />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o._id)}
                            title="Delete Order Record"
                            style={{
                              padding: '6px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.15s'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Collapsible Order Drawer */}
                  {isExpanded && (
                    <tr className="order-detail-drawer-row">
                      <td colSpan="6" className="drawer-container-td" style={{ backgroundColor: 'var(--bg-primary)', padding: '16px 24px' }}>
                        <div className="user-drawer-card animate-slide-down" style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          padding: '20px'
                        }}>
                          <div className="order-drawer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {/* Destination */}
                            <div className="drawer-address-col">
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '800' }}>📍 Shipping Destination</h4>
                              <div className="address-card" style={{
                                padding: '16px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                backgroundColor: 'var(--bg-primary)',
                                fontSize: '0.85rem',
                                lineHeight: '1.6'
                              }}>
                                <p style={{ margin: '0 0 6px 0' }}><strong>Customer Email:</strong> <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>{o.userEmail || "N/A"}</span></p>
                                <p style={{ margin: '0 0 6px 0' }}><strong>Name:</strong> {o.address?.fullName}</p>
                                <p style={{ margin: '0 0 6px 0' }}><strong>Street:</strong> {o.address?.addressLine}</p>
                                <p style={{ margin: '0 0 6px 0' }}><strong>City/State:</strong> {o.address?.city}, {o.address?.state} - {o.address?.postalCode}</p>
                                <p style={{ margin: 0 }}><strong>Phone:</strong> {o.address?.phone}</p>
                              </div>
                            </div>

                            {/* Itemized list */}
                            <div className="drawer-items-col">
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '800' }}>📦 Purchased Items</h4>
                              <div className="drawer-cart-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {o.items.map((item, idx) => {
                                  const prodDetails = products.find(p => p.id === item.productId);
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
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img 
                                          src={prodDetails?.image || item.image || "https://placehold.co/100x120?text=Product"} 
                                          alt={item.name} 
                                          className="drawer-prod-thumb" 
                                          style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <div className="drawer-prod-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                          <span className="item-title" style={{ fontSize: '0.85rem', fontWeight: '700' }}>{item.name}</span>
                                          <div className="item-specs" style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            <span>Size: {item.size || "M"}</span>
                                            <span>Color: {item.color || "Standard"}</span>
                                            <span>Qty: {item.quantity}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <span className="item-price-calc" style={{ fontWeight: '800', fontSize: '0.85rem' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
