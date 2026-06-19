import React, { useContext, useState, useCallback } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { CartContext } from '../Context/CartContext';
import { WishlistContext } from '../Context/WishlistContext';
import products from '../data/products';
import { BACKEND_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Phone, User, ShoppingBag, ShieldCheck, CheckCircle2, Loader2, Landmark, Tag, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/checkout.css';

const Checkout = () => {
  const { cartItems, getTotalCartAmount, getCartItemCount, clearCart } = useContext(CartContext);
  const { all_product } = useContext(ShopContext) || { all_product: [] };
  const { fetchWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  const productsList = all_product.length > 0 ? all_product : products;

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
  const [couponResult, setCouponResult] = useState(null);
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

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth-token');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    // Simulated Visual Progression
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(r => setTimeout(r, 900));
    }

    try {
      const payload = {
        address: addressForm,
        couponCode: couponCode || null,
      };

      const response = await fetch(`${BACKEND_URL}/placeorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setCreatedOrderId(data.orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`);
        setIsSuccess(true);
        clearCart();
        if (fetchWishlist) fetchWishlist();
      } else {
        alert(data.message || "Failed to submit order. Try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      // Offline visual demo fallback
      console.warn("Offline Fallback Mode triggers order simulation.");
      setCreatedOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSuccess(true);
      clearCart();
    }
  };

  return (
    <main className="checkout-page-container">
      {getCartItemCount() === 0 && !isSuccess ? (
        <div className="checkout-empty-guard">
          <h2>No Items in Cart</h2>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <button onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      ) : (
        <div className="checkout-layout">
          {/* Left Column Forms */}
          <div className="checkout-forms-col">
            <form onSubmit={handleCheckoutSubmit} className="checkout-form-stack">
              {/* Shipping Address */}
              <div className="checkout-section-card">
                <h3 className="section-card-title">
                  <MapPin className="title-icon text-accent" size={18} />
                  Shipping Address Details
                </h3>

                <div className="form-grid-2">
                  <div className="field-wrap span-2">
                    <label>Full Name</label>
                    <div className="input-icon-wrap">
                      <User className="field-icon" size={16} />
                      <input
                        required
                        type="text"
                        name="fullName"
                        className="form-field with-icon"
                        placeholder="Sophia Martinez"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField('')}
                      />
                    </div>
                  </div>

                  <div className="field-wrap span-2">
                    <label>Address Line</label>
                    <input
                      required
                      type="text"
                      name="addressLine"
                      className="form-field"
                      placeholder="Apt 4B, 12 Park Ave"
                      value={addressForm.addressLine}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="field-wrap">
                    <label>City</label>
                    <input
                      required
                      type="text"
                      name="city"
                      className="form-field"
                      placeholder="New York"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="form-grid-2-inner">
                    <div className="field-wrap">
                      <label>State</label>
                      <input
                        required
                        type="text"
                        name="state"
                        className="form-field"
                        placeholder="NY"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="field-wrap">
                      <label>Postal Code</label>
                      <input
                        required
                        type="text"
                        name="postalCode"
                        className="form-field"
                        placeholder="10016"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>

                  <div className="field-wrap span-2">
                    <label>Phone Number</label>
                    <div className="input-icon-wrap">
                      <Phone className="field-icon" size={16} />
                      <input
                        required
                        type="tel"
                        name="phone"
                        className="form-field with-icon"
                        placeholder="+1 212-555-0199"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure simulated payments */}
              <div className="checkout-section-card">
                <h3 className="section-card-title">
                  <CreditCard className="title-icon text-accent" size={18} />
                  Simulated Card Payment
                </h3>

                {/* Animated credit card */}
                <div className="card-scene">
                  <div className={`animated-credit-card ${focusedField === 'cvv' ? 'is-flipped' : ''}`}>
                    <div className="card-face card-front">
                      <div className="card-top-row">
                        <div className="card-chip" />
                        <Landmark className="card-bank-icon" size={24} />
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
                        <div className="cvv-signature">{paymentForm.cvv || '•••'}</div>
                      </div>
                      <p className="card-disclaimer">Simulated credit card sandbox display. Secure tokenized environment.</p>
                    </div>
                  </div>
                </div>

                <div className="payment-fields-stack">
                  <div className="field-wrap">
                    <label>Cardholder Name</label>
                    <input
                      required
                      type="text"
                      name="cardholderName"
                      className="form-field"
                      placeholder="SOPHIA MARTINEZ"
                      value={paymentForm.cardholderName}
                      onChange={handlePaymentChange}
                      onFocus={() => setFocusedField('cardholderName')}
                      onBlur={() => setFocusedField('')}
                    />
                  </div>

                  <div className="field-wrap">
                    <label>Card Number</label>
                    <input
                      required
                      type="text"
                      name="cardNumber"
                      className="form-field mono"
                      placeholder="4000 1234 5678 9010"
                      value={paymentForm.cardNumber}
                      onChange={handlePaymentChange}
                      onFocus={() => setFocusedField('cardNumber')}
                      onBlur={() => setFocusedField('')}
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="field-wrap">
                      <label>Expiry Date</label>
                      <input
                        required
                        type="text"
                        name="expiryDate"
                        className="form-field mono"
                        placeholder="MM/YY"
                        value={paymentForm.expiryDate}
                        onChange={handlePaymentChange}
                        onFocus={() => setFocusedField('expiryDate')}
                        onBlur={() => setFocusedField('')}
                      />
                    </div>
                    <div className="field-wrap">
                      <label>CVV</label>
                      <input
                        required
                        type="password"
                        name="cvv"
                        className="form-field mono"
                        placeholder="123"
                        value={paymentForm.cvv}
                        onChange={handlePaymentChange}
                        onFocus={() => setFocusedField('cvv')}
                        onBlur={() => setFocusedField('')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button type="submit" className="checkout-submit-btn">
                {savings > 0 && (
                  <span className="savings-badge">Saving ${savings.toFixed(2)}</span>
                )}
                <ShieldCheck size={18} />
                Pay &amp; Finalize Order (${finalPayable.toFixed(2)})
              </button>
            </form>
          </div>

          {/* Right Column Summary */}
          <div className="checkout-summary-col">
            <div className="summary-sticky-card">
              <h3 className="section-card-title" style={{ borderBottom: 'none', margin: 0, paddingBottom: 10 }}>
                <ShoppingBag className="title-icon" size={18} />
                Order Review ({getCartItemCount()})
              </h3>

              {/* Items scroll */}
              <div className="summary-items-scroll">
                {Object.keys(cartItems).map(key => {
                  const item = cartItems[key];
                  const product = productsList.find(p => p.id === item.id);
                  if (!product) return null;

                  return (
                    <div key={key} className="summary-item-row">
                      <img src={product.image} alt={product.name} className="summary-item-img" />
                      <div className="summary-item-info">
                        <h4 className="summary-item-name">{product.name}</h4>
                        <p className="summary-item-meta">Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <span className="summary-item-price">${(product.new_price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupons input */}
              <div className="coupon-section">
                {couponCode ? (
                  <div className="coupon-applied-tag">
                    <Tag size={16} />
                    <span>Coupon <strong>{couponCode}</strong> applied</span>
                    <button type="button" onClick={removeCoupon} className="coupon-remove-btn">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="coupon-input-row">
                      <div className="coupon-field-wrap">
                        <Tag className="coupon-icon" size={14} />
                        <input
                          type="text"
                          className="coupon-input"
                          placeholder="PROMO CODE (e.g. WELCOME10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={couponLoading || !couponInput.trim()}
                        className="coupon-apply-btn"
                        onClick={handleApplyCoupon}
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponResult?.error && (
                      <p className="coupon-error">{couponResult.error}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="summary-totals">
                <div className="total-line">
                  <span>Cart Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="total-line discount-line">
                    <span>Discount:</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-line">
                  <span>Simulated Delivery:</span>
                  <span className="free-label">FREE</span>
                </div>
                <div className="total-line grand-total">
                  <span>Payable Amount:</span>
                  <span>${finalPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURE PROCESSING OVERLAY */}
      <AnimatePresence>
        {isProcessing && (
          <div className="checkout-overlay">
            {!isSuccess ? (
              <div className="processing-card">
                <Loader2 className="animate-spin text-amber-500" size={36} />
                <h3>Secure transaction verification in progress</h3>
                <p className="processing-step-text">{steps[processingStep]}</p>
                <div className="processing-progress-bar">
                  <div
                    className="processing-progress-fill"
                    style={{ width: `${((processingStep + 1) / steps.length) * 100}%`, transition: 'width 0.4s ease' }}
                  />
                </div>
                <div className="pci-badge">
                  <ShieldCheck className="pci-icon" size={12} />
                  SSL Certified Demo Environment
                </div>
              </div>
            ) : (
              <div className="success-card">
                <div className="success-icon-wrap">
                  <CheckCircle2 size={48} />
                </div>
                <h2>Order Confirmed!</h2>
                <p>Your simulated purchase has been logged successfully.</p>

                <div className="success-details">
                  <div className="success-row">
                    <span>Simulated Order ID:</span>
                    <strong className="order-id-val">{createdOrderId}</strong>
                  </div>
                  <div className="success-row">
                    <span>Amount Charged:</span>
                    <strong style={{ color: 'white' }}>${finalPayable.toFixed(2)}</strong>
                  </div>
                  {savings > 0 && (
                    <div className="success-row savings-row">
                      <span>Simulated Savings:</span>
                      <strong>${savings.toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                <div className="success-actions">
                  <button className="btn-view-orders" onClick={() => { setIsProcessing(false); navigate('/orders'); }}>
                    View My Orders
                  </button>
                  <button className="btn-continue-shop" onClick={() => { setIsProcessing(false); navigate('/'); }}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Checkout;
