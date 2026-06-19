import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import '../styles/orders.css';
import { ShopContext } from '../Context/ShopContext';
import products from '../data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, ChevronUp, Calendar, MapPin, Package, RefreshCw, CheckCircle2, Truck, Clock3, Circle } from 'lucide-react';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_ICONS = {
  Pending: <Circle size={16} />,
  Processing: <Clock3 size={16} />,
  Shipped: <Truck size={16} />,
  Delivered: <CheckCircle2 size={16} />,
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const { all_product } = useContext(ShopContext) || { all_product: [] };
  const productsList = all_product.length > 0 ? all_product : products;

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
          amount: 175.00,
          status: 'Processing',
          payment: true,
          date: new Date().toISOString(),
          address: {
            fullName: 'Sophia Martinez',
            addressLine: 'Apt 4B, 12 Park Ave',
            city: 'New York',
            state: 'NY',
            postalCode: '10016',
            phone: '+1 212-555-0199'
          },
          items: [
            { productId: 1, name: 'Classic Beige Trench Coat', size: 'M', color: 'Beige', quantity: 1, price: 120.00 },
            { fontSize: 13, productId: 5, name: 'Charcoal Fleece Hooded Sweatshirt', size: 'L', color: 'Charcoal', quantity: 1, price: 55.00 }
          ]
        },
        {
          _id: 'ORD-128456',
          amount: 65.00,
          status: 'Delivered',
          payment: true,
          date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
          address: {
            fullName: 'Sophia Martinez',
            addressLine: '456 Oak St',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            phone: '+1 206-555-0145'
          },
          items: [
            { productId: 2, name: 'Slim Fit Indigo Denim Jacket', size: 'L', color: 'Navy', quantity: 1, price: 65.00 }
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

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status);

  return (
    <main className="orders-page-container">
      {/* Header row */}
      <div className="orders-header-row">
        <div className="orders-title-block">
          <h2>
            <ShoppingBag className="orders-title-icon" size={28} />
            My Orders
          </h2>
          <p>View, track, and monitor your current purchases (Simulated)</p>
        </div>

        <div className="orders-header-actions">
          {lastUpdated && (
            <div className="orders-last-updated">
              <span className="live-dot" />
              Last sync: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={() => fetchUserOrders(true)}
            className="refresh-btn"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Orders'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="orders-loading-container">
          <div className="orders-spinner" />
          <p>Retreiving your order details...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon-wrapper">
            <Package size={48} />
          </div>
          <h3>No Orders Found</h3>
          <p>You haven't placed any purchases yet. Start shopping and verify checkout details!</p>
          <Link to="/">
            <button className="shop-now-btn">Start Browsing</button>
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const currentStep = getStepIndex(order.status);

            return (
              <div key={order._id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                {/* Collapsed summary bar */}
                <div className="order-summary-bar" onClick={() => toggleExpand(order._id)}>
                  <div className="order-meta">
                    <span className="order-id">{order._id}</span>
                    <span className="order-date">
                      <Calendar size={14} />
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                    <span className="order-items-count">
                      {order.items.reduce((acc, it) => acc + it.quantity, 0)} Items
                    </span>
                  </div>

                  <div className="order-status-amount">
                    <span className="order-amount">${Number(order.amount).toFixed(2)}</span>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {STATUS_ICONS[order.status] || <Circle size={16} />}
                      {order.status}
                    </span>
                    <button className="expand-btn" aria-label="Expand details">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded details container */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      className="order-details-panel"
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      {/* Timeline status tracker */}
                      <div className="status-tracker">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStep;
                          const isCurrent = idx === currentStep;
                          return (
                            <React.Fragment key={step}>
                              <div className={`tracker-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                                <div className="tracker-dot">
                                  {STATUS_ICONS[step]}
                                </div>
                                <span className="tracker-label">{step}</span>
                              </div>
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className={`tracker-line ${idx < currentStep ? 'done' : ''}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Detail information panel */}
                      <div className="order-detail-grid">
                        {/* Left side items table */}
                        <div>
                          <h4 className="detail-section-title">Order Items</h4>
                          <div className="items-stack">
                            {order.items.map((item, idx) => {
                              // Resolve product images
                              const originalProduct = productsList.find(p => p.id === item.productId);
                              const imageSrc = originalProduct?.image || item.image;

                              return (
                                <div key={idx} className="item-row">
                                  <div className="item-img-wrap">
                                    {imageSrc ? (
                                      <img src={imageSrc} alt={item.name} />
                                    ) : (
                                      <div className="item-img-placeholder">
                                        <Package size={20} />
                                      </div>
                                    )}
                                  </div>

                                  <div className="item-info">
                                    <Link to={`/product/${item.productId}`} className="item-title-link">
                                      {item.name}
                                    </Link>
                                    <div className="item-tags">
                                      <span className="item-tag">Size: {item.size}</span>
                                      <span className="item-tag">Color: {item.color || 'White'}</span>
                                      <span className="item-tag">Qty: {item.quantity}</span>
                                    </div>
                                  </div>

                                  <div className="item-price-col">
                                    <span className="item-unit-price">${Number(item.price).toFixed(2)} each</span>
                                    <span className="item-total">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right side shipping/payments detail panel */}
                        <div className="detail-info-col">
                          <div className="info-card">
                            <h4>
                              <MapPin size={16} />
                              Shipping Address
                            </h4>
                            <p className="addr-name">{order.address.fullName}</p>
                            <p>{order.address.addressLine}</p>
                            <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                            <p className="addr-phone">Phone: {order.address.phone}</p>
                          </div>

                          <div className="info-card">
                            <h4>Simulated Checkout Details</h4>
                            <div className="payment-row">
                              <span>Payment Status:</span>
                              <span className={`pay-badge ${order.payment ? 'paid' : 'unpaid'}`}>
                                {order.payment ? 'PAID (DEMO)' : 'UNPAID'}
                              </span>
                            </div>
                            <div className="payment-row">
                              <span>Shipping Method:</span>
                              <span style={{ fontWeight: 600 }}>Standard Ground</span>
                            </div>
                            <div className="payment-row">
                              <span>Simulated Total:</span>
                              <span style={{ fontWeight: 700, color: 'var(--accent-pink)' }}>
                                ${Number(order.amount).toFixed(2)}
                              </span>
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
    </main>
  );
};

export default Orders;
