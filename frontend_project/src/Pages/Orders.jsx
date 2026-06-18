import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import './CSS/Orders.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, ChevronUp, Calendar, MapPin, Package, RefreshCw, CheckCircle2, Truck, Clock3, Circle } from 'lucide-react';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_ICONS = {
  Pending: <Circle size={16} />,
  Processing: <Clock3 size={16} />,
  Shipped: <Truck size={16} />,
  Delivered: <CheckCircle2 size={16} />,
};

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const fetchUserOrders = useCallback(async (isRefresh = false) => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (isRefresh) setRefreshing(true);

    try {
      const response = await fetch(`${BACKEND_URL}/userorders`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': token
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch orders from server:', error);
      // Fallback visual mock data for simulated visual preview
      setOrders([
        {
          _id: 'ORD-987216',
          amount: 200,
          status: 'Processing',
          payment: true,
          date: new Date().toISOString(),
          address: {
            fullName: 'Emily Watson',
            addressLine: 'Apt 4B, 12 Park Ave',
            city: 'New York',
            state: 'NY',
            postalCode: '10016',
            phone: '+1 212-555-0199'
          },
          items: [
            { productId: 1, name: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse', size: 'M', color: 'Black', quantity: 2, price: 50.0, image: null },
            { productId: 4, name: 'Premium Cotton Casual Shirt', size: 'L', color: 'White', quantity: 1, price: 100.0, image: null }
          ]
        },
        {
          _id: 'ORD-128456',
          amount: 85,
          status: 'Delivered',
          payment: true,
          date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
          address: {
            fullName: 'Emily Watson',
            addressLine: '456 Oak St',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            phone: '+1 206-555-0145'
          },
          items: [
            { productId: 2, name: 'Classic Slim Fit Chino Trousers', size: 'L', color: 'Beige', quantity: 1, price: 85.0, image: null }
          ]
        }
      ]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  // Initial fetch
  useEffect(() => {
    fetchUserOrders(false);
  }, [fetchUserOrders]);

  // Real-time polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchUserOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const getStatusIndex = (status) => STATUS_STEPS.indexOf(status);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  if (loading) {
    return (
      <div className="orders-loading-container">
        <div className="orders-spinner" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      {/* Header */}
      <div className="orders-header-row">
        <div className="orders-title-block">
          <h2><ShoppingBag size={24} className="orders-title-icon" /> My Orders</h2>
          <p>Track your deliveries and review past purchases in real time.</p>
        </div>
        <div className="orders-header-actions">
          {lastUpdated && (
            <span className="orders-last-updated">
              <span className="live-dot" /> Live · Updated {formatTime(lastUpdated)}
            </span>
          )}
          <motion.button
            className="refresh-btn"
            onClick={() => fetchUserOrders(true)}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
            >
              <RefreshCw size={15} />
            </motion.span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon-wrapper">
            <Package size={52} />
          </div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Explore our catalog and find something you love!</p>
          <motion.button
            className="shop-now-btn"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Start Shopping
          </motion.button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const statusIdx = getStatusIndex(order.status);
            const totalItems = order.items.reduce((acc, cur) => acc + cur.quantity, 0);

            return (
              <div key={order._id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>

                {/* ORDER SUMMARY BAR */}
                <div className="order-summary-bar" onClick={() => toggleExpand(order._id)}>
                  <div className="order-meta">
                    <span className="order-id">#{order._id}</span>
                    <span className="order-date">
                      <Calendar size={12} /> {formatDate(order.date)}
                    </span>
                    <span className="order-items-count">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="order-status-amount">
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {STATUS_ICONS[order.status]} {order.status}
                    </span>
                    <span className="order-amount">₹{order.amount}</span>
                    <button className="expand-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE DETAIL PANEL */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="details"
                      className="order-details-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                    >
                      {/* STATUS TRACKER TIMELINE */}
                      <div className="status-tracker">
                        {STATUS_STEPS.map((step, idx) => {
                          const done = idx <= statusIdx;
                          const current = idx === statusIdx;
                          return (
                            <React.Fragment key={step}>
                              <div className={`tracker-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                                <div className="tracker-dot">
                                  {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                </div>
                                <span className="tracker-label">{step}</span>
                              </div>
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className={`tracker-line ${idx < statusIdx ? 'done' : ''}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      <div className="order-detail-grid">
                        {/* ITEMS SECTION */}
                        <div className="detail-items-col">
                          <h4 className="detail-section-title">Items Ordered</h4>
                          <div className="items-stack">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="item-row">
                                <div className="item-img-wrap">
                                  {item.image
                                    ? <img src={item.image} alt={item.name} />
                                    : <div className="item-img-placeholder"><Package size={20} /></div>
                                  }
                                </div>
                                <div className="item-info">
                                  <Link
                                    to={`/product/${item.productId}`}
                                    className="item-title-link"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {item.name}
                                  </Link>
                                  <div className="item-tags">
                                    <span className="item-tag">Size: {item.size}</span>
                                    <span className="item-tag">Color: {item.color}</span>
                                    <span className="item-tag">Qty: {item.quantity}</span>
                                  </div>
                                </div>
                                <div className="item-price-col">
                                  <span className="item-unit-price">₹{item.price} ea</span>
                                  <span className="item-total">₹{item.price * item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* ORDER TOTALS */}
                          {(() => {
                            const subtotal = order.items.reduce((acc, cur) => acc + (cur.price * cur.quantity), 0);
                            const discount = subtotal - order.amount;
                            return (
                              <div className="order-totals">
                                <div className="total-row">
                                  <span>Subtotal</span><span>₹{subtotal}</span>
                                </div>
                                {discount > 0 && (
                                  <div className="total-row discount-row" style={{ color: '#22c55e', fontWeight: 700 }}>
                                    <span>Coupon ({order.couponCode || 'Promo'})</span><span>−₹{discount}</span>
                                  </div>
                                )}
                                <div className="total-row">
                                  <span>Delivery</span><span className="free-tag">FREE</span>
                                </div>
                                <div className="total-row grand">
                                  <span>Grand Total</span><span>₹{order.amount}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* SHIPPING & PAYMENT */}
                        <div className="detail-info-col">
                          <div className="info-card">
                            <h4><MapPin size={15} /> Shipping Address</h4>
                            <p className="addr-name">{order.address?.fullName}</p>
                            <p>{order.address?.addressLine}</p>
                            <p>{order.address?.city}, {order.address?.state} {order.address?.postalCode}</p>
                            <p className="addr-phone">📞 {order.address?.phone}</p>
                          </div>

                          <div className="info-card">
                            <h4>💳 Payment</h4>
                            <div className="payment-row">
                              <span>Status</span>
                              <span className={`pay-badge ${order.payment ? 'paid' : 'unpaid'}`}>
                                {order.payment ? '✓ Paid' : '✗ Unpaid'}
                              </span>
                            </div>
                            <div className="payment-row">
                              <span>Method</span>
                              <span>Card (Demo)</span>
                            </div>
                            <div className="payment-row">
                              <span>Order Date</span>
                              <span>{formatDate(order.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
