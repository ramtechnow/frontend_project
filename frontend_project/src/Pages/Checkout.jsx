import React, { useContext, useState, useCallback } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { CartContext } from '../Context/CartContext';
import { WishlistContext } from '../Context/WishlistContext';
import { BACKEND_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Phone, User, ShoppingBag, ShieldCheck, CheckCircle2, Loader2, Landmark, Tag, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CSS/Checkout.css';

export const Checkout = () => {
  // Use CartContext for actual cart state (source of truth)
  const { cartItems, getTotalCartAmount, getCartItemCount, clearCart } = useContext(CartContext);
  const { all_product } = useContext(ShopContext);
  const { fetchWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  // ── Address Form ─────────────────────────────────────────────────────────────
  const [addressForm, setAddressForm] = useState({
    fullName: '', addressLine: '', city: '', state: '', postalCode: '', phone: '',
  });

  // ── Payment Form ─────────────────────────────────────────────────────────────
  const [paymentForm, setPaymentForm] = useState({
    cardholderName: '', cardNumber: '', expiryDate: '', cvv: '',
  });

  // ── Coupon State ─────────────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponResult, setCouponResult] = useState(null); // { discountAmount, finalTotal, message, error }
  const [couponLoading, setCouponLoading] = useState(false);

  // ── UI States ────────────────────────────────────────────────────────────────
  const [focusedField, setFocusedField] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const steps = [
    "Establishing secure connection...",
    "Verifying payment credentials...",
    "Authorizing transaction with issuing bank...",
    "Finalizing your order in database..."
  ];

  const cartTotal = getTotalCartAmount();
  const finalPayable = couponResult?.finalTotal ?? cartTotal;
  const savings = couponResult?.discountAmount ?? 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddressChange = (e) => setAddressForm({ ...addressForm, [e.target.name]: e.target.value });

  const handlePaymentChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.match(/.{1,4}/g)?.join(' ') || value;
    }
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '').substring(0, 4);
      if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (name === 'cvv') value = value.replace(/\D/g, '').substring(0, 3);
    setPaymentForm({ ...paymentForm, [name]: value });
  };

  const handleApplyCoupon = useCallback(async () => {
    const trimmed = couponInput.trim().toUpperCase();
    if (!trimmed) return;
    setCouponLoading(true);
    setCouponResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/applycoupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token') || ''
        },
        body: JSON.stringify({ code: trimmed, cartTotal })
      });
      const data = await res.json();
      if (data.success) {
        setCouponCode(trimmed);
        setCouponResult({ discountAmount: data.discountAmount, finalTotal: data.finalTotal, message: data.message });
      } else {
        setCouponResult({ error: data.error });
      }
    } catch {
      setCouponResult({ error: 'Could not connect to server. Try again.' });
    } finally {
      setCouponLoading(false);
    }
  }, [couponInput, cartTotal]);

  const removeCoupon = () => {
    setCouponCode('');
    setCouponInput('');
    setCouponResult(null);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!Object.values(addressForm).every(v => v.trim())) {
      alert("⚠️ Please fill in all shipping details!");
      return;
    }
    if (paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
      alert("⚠️ Please enter a valid 16-digit card number!");
      return;
    }
    if (paymentForm.expiryDate.length !== 5) {
      alert("⚠️ Please enter a valid expiry date (MM/YY)!");
      return;
    }
    if (paymentForm.cvv.length !== 3) {
      alert("⚠️ Please enter a valid 3-digit CVV!");
      return;
    }
    if (!localStorage.getItem('auth-token')) {
      alert("⚠️ You must be logged in to complete checkout!");
      navigate('/login');
      return;
    }

    // Build order items from CartContext
    const orderItems = [];
    Object.keys(cartItems).forEach((key) => {
      const item = cartItems[key];
      const product = all_product.find((p) => p.id === item.id);
      if (product) {
        orderItems.push({
          productId: item.id,
          name: product.name,
          image: product.image,
          size: item.size,
          color: item.color || "White",
          quantity: item.quantity,
          price: product.new_price
        });
      }
    });

    if (orderItems.length === 0) {
      alert("⚠️ Your cart is empty!");
      navigate('/');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    const interval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch(`${BACKEND_URL}/placeorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'auth-token': localStorage.getItem('auth-token')
        },
        body: JSON.stringify({
          items: orderItems,
          amount: finalPayable,
          address: addressForm,
          couponCode: couponCode || null
        })
      });

      const data = await response.json();

      setTimeout(() => {
        clearInterval(interval);
        if (data.success) {
          // ✅ Clear the cart immediately — no page reload hack
          clearCart();
          setIsProcessing(false);
          setIsSuccess(true);
          setCreatedOrderId(data.orderId);
          fetchWishlist();
        } else {
          setIsProcessing(false);
          alert("❌ Order Failed: " + (data.error || 'Unknown error'));
        }
      }, 5000);

    } catch {
      clearInterval(interval);
      setIsProcessing(false);
      alert("❌ Failed to connect to order server. Please check your connection.");
    }
  };

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (getCartItemCount() === 0 && !isSuccess) {
    return (
      <div className="checkout-empty-guard">
        <ShoppingBag size={52} />
        <h2>Your cart is empty</h2>
        <p>Add some items before checking out!</p>
        <button onClick={() => navigate('/')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <AnimatePresence mode="wait">
        {/* PROCESSING OVERLAY */}
        {isProcessing && (
          <motion.div className="checkout-overlay" key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="processing-card">
              <Loader2 className="animate-spin" size={54} style={{ color: '#f59e0b' }} />
              <div>
                <h3>Simulating Secured Payment</h3>
                <p className="processing-step-text">{steps[processingStep]}</p>
              </div>
              <div className="processing-progress-bar">
                <motion.div
                  className="processing-progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((processingStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
              <span className="pci-badge">
                <ShieldCheck size={12} className="pci-icon" /> PCI-DSS Compliant Gateway
              </span>
            </div>
          </motion.div>
        )}

        {/* SUCCESS OVERLAY */}
        {isSuccess && (
          <motion.div className="checkout-overlay" key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 15 }}>
            <div className="success-card">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="success-icon-wrap">
                <CheckCircle2 size={64} />
              </motion.div>
              <h2>Order Confirmed!</h2>
              <p>Thank you for your purchase. Your payment was processed successfully.</p>
              <div className="success-details">
                <div className="success-row">
                  <span>Order ID</span>
                  <strong className="order-id-val">{createdOrderId}</strong>
                </div>
                <div className="success-row">
                  <span>Amount Paid</span>
                  <strong>₹{finalPayable}</strong>
                </div>
                {savings > 0 && (
                  <div className="success-row savings-row">
                    <span>You saved</span>
                    <strong>₹{savings} 🎉</strong>
                  </div>
                )}
                <div className="success-row">
                  <span>Ship to</span>
                  <strong>{addressForm.fullName}, {addressForm.city}</strong>
                </div>
              </div>
              <div className="success-actions">
                <button className="btn-view-orders" onClick={() => navigate('/orders')}>
                  <ShoppingBag size={16} /> View My Orders
                </button>
                <button className="btn-continue-shop" onClick={() => navigate('/')}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="checkout-layout">
        {/* ── LEFT COLUMN: FORMS ───────────────────────────────── */}
        <div className="checkout-forms-col">
          <form onSubmit={handlePlaceOrder} className="checkout-form-stack">

            {/* SHIPPING ADDRESS */}
            <div className="checkout-section-card">
              <h3 className="section-card-title">
                <MapPin size={20} className="title-icon amber" /> Shipping & Delivery Address
              </h3>
              <div className="form-grid-2">
                <div className="field-wrap">
                  <label>Full Name</label>
                  <div className="input-icon-wrap">
                    <User size={14} className="field-icon" />
                    <input type="text" name="fullName" value={addressForm.fullName} onChange={handleAddressChange} placeholder="e.g. Ravi Kumar" className="form-field with-icon" required />
                  </div>
                </div>
                <div className="field-wrap">
                  <label>Phone Number</label>
                  <div className="input-icon-wrap">
                    <Phone size={14} className="field-icon" />
                    <input type="tel" name="phone" value={addressForm.phone} onChange={handleAddressChange} placeholder="+91 9876543210" className="form-field with-icon" required />
                  </div>
                </div>
                <div className="field-wrap span-2">
                  <label>Street Address</label>
                  <input type="text" name="addressLine" value={addressForm.addressLine} onChange={handleAddressChange} placeholder="Flat 302, Green Meadows Apartment" className="form-field" required />
                </div>
                <div className="field-wrap">
                  <label>City</label>
                  <input type="text" name="city" value={addressForm.city} onChange={handleAddressChange} placeholder="Bangalore" className="form-field" required />
                </div>
                <div className="form-grid-2-inner">
                  <div className="field-wrap">
                    <label>State</label>
                    <input type="text" name="state" value={addressForm.state} onChange={handleAddressChange} placeholder="Karnataka" className="form-field" required />
                  </div>
                  <div className="field-wrap">
                    <label>Postal Code</label>
                    <input type="text" name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} placeholder="560001" className="form-field" required />
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="checkout-section-card">
              <h3 className="section-card-title">
                <CreditCard size={20} className="title-icon amber" /> Demo Payment Details
              </h3>

              {/* Animated Credit Card */}
              <div className="card-scene">
                <div className={`animated-credit-card ${focusedField === 'cvv' ? 'is-flipped' : ''}`}>
                  <div className="card-face card-front">
                    <div className="card-top-row">
                      <div className="card-chip" />
                      <Landmark size={24} className="card-bank-icon" />
                    </div>
                    <div className="card-number-display">
                      {paymentForm.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="card-bottom-row">
                      <div className="card-holder-block">
                        <span className="card-meta-label">Card Holder</span>
                        <span className="card-meta-value">{paymentForm.cardholderName.toUpperCase() || 'YOUR NAME'}</span>
                      </div>
                      <div className="card-expiry-block">
                        <span className="card-meta-label">Expires</span>
                        <span className="card-meta-value">{paymentForm.expiryDate || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-face card-back">
                    <div className="magnetic-strip" />
                    <div className="cvv-row">
                      <span className="card-meta-label">Authorized Sign</span>
                      <div className="cvv-signature">{paymentForm.cvv || '•••'}</div>
                    </div>
                    <p className="card-disclaimer">This is a simulated card for demo use only.</p>
                  </div>
                </div>
              </div>

              <div className="payment-fields-stack">
                <div className="field-wrap">
                  <label>Cardholder Name</label>
                  <input type="text" name="cardholderName" value={paymentForm.cardholderName} onChange={handlePaymentChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')} placeholder="e.g. Ravi Kumar" className="form-field" required />
                </div>
                <div className="field-wrap">
                  <label>Card Number</label>
                  <input type="text" name="cardNumber" value={paymentForm.cardNumber} onChange={handlePaymentChange} onFocus={() => setFocusedField('number')} onBlur={() => setFocusedField('')} placeholder="4532 7182 9304 8812" className="form-field mono" required />
                </div>
                <div className="form-grid-2-inner">
                  <div className="field-wrap">
                    <label>Expiry Date</label>
                    <input type="text" name="expiryDate" value={paymentForm.expiryDate} onChange={handlePaymentChange} onFocus={() => setFocusedField('expiry')} onBlur={() => setFocusedField('')} placeholder="MM/YY" className="form-field mono" required />
                  </div>
                  <div className="field-wrap">
                    <label>CVV</label>
                    <input type="password" name="cvv" value={paymentForm.cvv} onChange={handlePaymentChange} onFocus={() => setFocusedField('cvv')} onBlur={() => setFocusedField('')} placeholder="•••" className="form-field mono" required />
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="checkout-submit-btn">
              <CreditCard size={18} />
              Place Order & Pay ₹{finalPayable}
              {savings > 0 && <span className="savings-badge">Saving ₹{savings}</span>}
            </button>
          </form>
        </div>

        {/* ── RIGHT COLUMN: ORDER SUMMARY ────────────────────── */}
        <div className="checkout-summary-col">
          <div className="summary-sticky-card">
            <h3 className="section-card-title">
              <ShoppingBag size={20} className="title-icon amber" /> Order Summary
            </h3>

            {/* Cart Items */}
            <div className="summary-items-scroll">
              {Object.keys(cartItems).map((key) => {
                const item = cartItems[key];
                const product = all_product.find(p => p.id === item.id);
                if (!product) return null;
                return (
                  <div key={key} className="summary-item-row">
                    <img src={product.image} alt={product.name} className="summary-item-img" />
                    <div className="summary-item-info">
                      <p className="summary-item-name">{product.name}</p>
                      <p className="summary-item-meta">
                        {item.color} · Size {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="summary-item-price">₹{product.new_price * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Section */}
            <div className="coupon-section">
              {!couponResult?.discountAmount ? (
                <div className="coupon-input-row">
                  <div className="coupon-field-wrap">
                    <Tag size={14} className="coupon-icon" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Enter coupon code"
                      className="coupon-input"
                    />
                  </div>
                  <button type="button" className="coupon-apply-btn" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}>
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="coupon-applied-tag">
                  <Tag size={13} />
                  <span><strong>{couponCode}</strong> — {couponResult.message}</span>
                  <button type="button" onClick={removeCoupon} className="coupon-remove-btn"><X size={13} /></button>
                </div>
              )}
              {couponResult?.error && <p className="coupon-error">{couponResult.error}</p>}
            </div>

            {/* Totals */}
            <div className="summary-totals">
              <div className="total-line">
                <span>Subtotal</span><span>₹{cartTotal}</span>
              </div>
              {savings > 0 && (
                <div className="total-line discount-line">
                  <span>Coupon ({couponCode})</span><span>−₹{savings}</span>
                </div>
              )}
              <div className="total-line">
                <span>Delivery</span><span className="free-label">FREE</span>
              </div>
              <div className="total-line grand-total">
                <span>Total</span><span>₹{finalPayable}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
