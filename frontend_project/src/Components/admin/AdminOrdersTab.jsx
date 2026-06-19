import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';

export const AdminOrdersTab = ({ 
  orders = [], 
  products = [], 
  onRefreshOrders, 
  addToast,
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

  return (
    <div className="admin-orders-section animate-fade-in">
      <h2>Order Tracking & Management</h2>
      <p className="admin-helper-note">
        💡 <strong>Order Management:</strong> View and track customer orders, update delivery status, and inspect items purchased. Click on an order row to view full address details and purchased item lists.
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
              <th style={{ paddingRight: '24px' }}>Delivery Status</th>
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
                      <strong>{o._id}</strong>
                    </td>
                    
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="user-info-stack" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="prod-name-bold" style={{ fontWeight: '700' }}>{o.userName || o.address?.fullName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.userEmail}</span>
                      </div>
                    </td>
                    
                    <td style={{ verticalAlign: 'middle' }}>{orderDate}</td>
                    
                    <td className="price-cell" style={{ verticalAlign: 'middle', fontWeight: '700' }}>${o.amount}</td>
                    
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
                          disabled={updatingOrderId === o._id}
                          onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                          style={{
                            height: '32px',
                            padding: '0 8px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        {updatingOrderId === o._id && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-color)' }} />}
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
                                            <span>Size: <strong>{item.size}</strong></span>
                                            <span>Color: <strong>{item.color}</strong></span>
                                            <span>Qty: <strong>{item.quantity}</strong></span>
                                            <span>Unit Price: <strong>${item.price}</strong></span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="drawer-item-total" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                                        <span>Total: <strong>${item.price * item.quantity}</strong></span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Order Pricing Summary */}
                              {(() => {
                                const subtotal = o.items.reduce((acc, cur) => acc + (cur.price * cur.quantity), 0);
                                const discount = subtotal - o.amount;
                                return (
                                  <div className="drawer-order-totals" style={{ 
                                    marginTop: '16px', 
                                    borderTop: '1px dashed var(--border-color)', 
                                    paddingTop: '12px', 
                                    fontSize: '0.85rem', 
                                    color: 'var(--text-secondary)' 
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                      <span>Subtotal:</span>
                                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${subtotal}</span>
                                    </div>
                                    {discount > 0 && (
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>
                                        <span>Coupon Discount ({o.couponCode || 'Promo'}):</span>
                                        <span>−${discount}</span>
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                      <span>Total Paid:</span>
                                      <span style={{ color: 'var(--accent-color)' }}>${o.amount}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No orders found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
