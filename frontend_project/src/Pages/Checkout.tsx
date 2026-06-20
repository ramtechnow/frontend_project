import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { 
  CreditCard, 
  MapPin, 
  Phone, 
  User, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Tag, 
  X, 
  AlertCircle,
  Lock,
  ChevronRight
} from "lucide-react";

import { useCart } from "../features/checkout/hooks/useCart";
import { useAuth } from "../features/auth/hooks/useAuth";
import { 
  checkoutSchema, 
  CheckoutValues 
} from "../features/checkout/types/orderTypes";
import { 
  placeOrderTransaction, 
  validateCoupon 
} from "../features/checkout/services/orderService";
import { useAppDispatch } from "../store/hooks";
import { addToast } from "../store/slices/toastSlice";

import "../Styles/checkout.css";

// Helper to detect card brand
const getCardBrand = (cardNumber: string): "visa" | "mastercard" | "amex" | "discover" | "unknown" => {
  const cleanNumber = cardNumber.replace(/\D/g, "");
  if (cleanNumber.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(cleanNumber)) return "mastercard";
  if (/^3[47]/.test(cleanNumber)) return "amex";
  if (/^(6011|65)/.test(cleanNumber)) return "discover";
  return "unknown";
};

export const Checkout: React.FC = () => {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ── States ───────────────────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponResult, setCouponResult] = useState<{
    success: boolean;
    discountAmount?: number;
    finalTotal?: number;
    message?: string;
    error?: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Billing address state
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    phone: ""
  });

  const steps = [
    "Establishing SSL connection...",
    "Securing credit card details...",
    "Authorizing with bank partner...",
    "Finalizing purchase in DB..."
  ];

  const finalPayable = couponResult?.finalTotal ?? cartTotal;
  const savings = couponResult?.discountAmount ?? 0;

  // ── Form Configuration ───────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      address: {
        fullName: "",
        addressLine: "",
        city: "",
        state: "",
        postalCode: "",
        phone: ""
      },
      payment: {
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
      }
    }
  });

  // Watch card input fields for live card rendering
  const watchCardholder = watch("payment.cardholderName");
  const watchCardNumber = watch("payment.cardNumber") || "";
  const watchExpiry = watch("payment.expiryDate");
  const watchCvv = watch("payment.cvv");

  const cardBrand = getCardBrand(watchCardNumber);

  // Caret-aware input formats
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const matches = value.match(/.{1,4}/g);
    value = matches ? matches.join(" ") : value;
    setValue("payment.cardNumber", value, { shouldValidate: true });
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }
    setValue("payment.expiryDate", value, { shouldValidate: true });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 3);
    setValue("payment.cvv", value, { shouldValidate: true });
  };

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponResult(null);

    const result = await validateCoupon(code, cartTotal);
    setCouponLoading(false);
    setCouponResult(result);

    if (result.success) {
      setCouponCode(code);
      dispatch(addToast({ message: "Coupon applied successfully!", type: "success" }));
    } else {
      setCouponCode(null);
      dispatch(addToast({ message: result.error || "Failed to apply coupon", type: "error" }));
    }
  }, [couponInput, cartTotal, dispatch]);

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponInput("");
    setCouponResult(null);
    dispatch(addToast({ message: "Coupon removed.", type: "info" }));
  };

  const onSubmitCheckout = async (data: CheckoutValues) => {
    if (!user) {
      dispatch(addToast({ message: "Please sign in to place an order.", type: "error" }));
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    setIsProcessing(true);
    setTransactionError(null);
    setProcessingStep(0);

    // Simulated Visual Progression
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 850));
    }

    const orderItems = cartItems.map((item) => ({
      productId: String(item.productId),
      name: item.name,
      image: item.image,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price
    }));

    const result = await placeOrderTransaction(
      user.uid,
      orderItems,
      data.address,
      couponCode,
      finalPayable
    );

    if (result.success && result.orderId) {
      setCreatedOrderId(result.orderId);
      setIsSuccess(true);
      await clearCart();
      dispatch(addToast({ message: "Order placed successfully!", type: "success" }));
    } else {
      setTransactionError(result.error || "Failed to complete transaction.");
      setIsProcessing(false);
      dispatch(addToast({ message: result.error || "Order placement failed.", type: "error" }));
    }
  };

  return (
    <main className="checkout-page-container">
      {cartCount === 0 && !isSuccess ? (
        <div className="checkout-empty-guard max-w-md mx-auto text-center py-24 px-6 bg-bg-secondary border border-border rounded-2xl shadow-sm">
          <ShoppingBag className="mx-auto text-text-muted mb-6 animate-bounce" size={48} />
          <h2 className="text-xl font-extrabold mb-3">No Items in Cart</h2>
          <p className="text-sm text-text-muted mb-8">
            Your shopping cart is currently empty. Please add items from our catalog to proceed.
          </p>
          <button 
            onClick={() => navigate("/catalog")}
            className="px-8 py-3 bg-accent-pink hover:bg-accent-pink/90 text-white font-bold text-sm rounded-full transition-all shadow-lg hover:shadow-accent-pink/20"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="checkout-layout">
          {/* Left Column Form Stack */}
          <div className="checkout-forms-col">
            <form onSubmit={handleSubmit(onSubmitCheckout)} className="checkout-form-stack">
              {transactionError && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500 text-xs md:text-sm animate-shake">
                  <AlertCircle className="flex-shrink-0" size={18} />
                  <span>{transactionError}</span>
                </div>
              )}

              {/* Shipping Address */}
              <div className="checkout-section-card">
                <h3 className="section-card-title">
                  <MapPin className="title-icon text-accent-pink" size={18} />
                  Shipping Address Details
                </h3>

                <div className="form-grid-2">
                  <div className="field-wrap span-2">
                    <label>Full Name</label>
                    <div className="input-icon-wrap">
                      <User className="field-icon" size={16} />
                      <input
                        type="text"
                        {...register("address.fullName")}
                        className={`form-field with-icon ${errors.address?.fullName ? "border-red-500" : ""}`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.address?.fullName && (
                      <span className="error-hint">{errors.address.fullName.message}</span>
                    )}
                  </div>

                  <div className="field-wrap span-2">
                    <label>Address Line</label>
                    <input
                      type="text"
                      {...register("address.addressLine")}
                      className={`form-field ${errors.address?.addressLine ? "border-red-500" : ""}`}
                      placeholder="Flat No, Street Address, Area"
                    />
                    {errors.address?.addressLine && (
                      <span className="error-hint">{errors.address.addressLine.message}</span>
                    )}
                  </div>

                  <div className="field-wrap">
                    <label>City</label>
                    <input
                      type="text"
                      {...register("address.city")}
                      className={`form-field ${errors.address?.city ? "border-red-500" : ""}`}
                      placeholder="Mumbai"
                    />
                    {errors.address?.city && (
                      <span className="error-hint">{errors.address.city.message}</span>
                    )}
                  </div>

                  <div className="form-grid-2-inner">
                    <div className="field-wrap">
                      <label>State</label>
                      <input
                        type="text"
                        {...register("address.state")}
                        className={`form-field ${errors.address?.state ? "border-red-500" : ""}`}
                        placeholder="Maharashtra"
                      />
                      {errors.address?.state && (
                        <span className="error-hint">{errors.address.state.message}</span>
                      )}
                    </div>
                    <div className="field-wrap">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        {...register("address.postalCode")}
                        className={`form-field ${errors.address?.postalCode ? "border-red-500" : ""}`}
                        placeholder="400001"
                      />
                      {errors.address?.postalCode && (
                        <span className="error-hint">{errors.address.postalCode.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="field-wrap span-2">
                    <label>Phone Number</label>
                    <div className="input-icon-wrap">
                      <Phone className="field-icon" size={16} />
                      <input
                        type="tel"
                        {...register("address.phone")}
                        className={`form-field with-icon ${errors.address?.phone ? "border-red-500" : ""}`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    {errors.address?.phone && (
                      <span className="error-hint">{errors.address.phone.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Address Toggle */}
              <div className="checkout-section-card">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-text-primary">Billing Address</span>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={billingSameAsShipping} 
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)} 
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
                <p className="text-xs text-text-muted mt-1.5">Same as shipping address</p>

                <AnimatePresence>
                  {!billingSameAsShipping && (
                    <motion.div 
                      className="billing-form-wrapper mt-4 pt-4 border-t border-border"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="form-grid-2">
                        <div className="field-wrap span-2">
                          <label>Billing Full Name</label>
                          <input
                            type="text"
                            value={billingAddress.fullName}
                            onChange={(e) => setBillingAddress({ ...billingAddress, fullName: e.target.value })}
                            className="form-field"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="field-wrap span-2">
                          <label>Billing Address Line</label>
                          <input
                            type="text"
                            value={billingAddress.addressLine}
                            onChange={(e) => setBillingAddress({ ...billingAddress, addressLine: e.target.value })}
                            className="form-field"
                            placeholder="Flat No, Street Address"
                          />
                        </div>
                        <div className="field-wrap">
                          <label>City</label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                            className="form-field"
                            placeholder="Mumbai"
                          />
                        </div>
                        <div className="form-grid-2-inner">
                          <div className="field-wrap">
                            <label>State</label>
                            <input
                              type="text"
                              value={billingAddress.state}
                              onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                              className="form-field"
                              placeholder="MH"
                            />
                          </div>
                          <div className="field-wrap">
                            <label>Postal Code</label>
                            <input
                              type="text"
                              value={billingAddress.postalCode}
                              onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                              className="form-field"
                              placeholder="400001"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Secure Payments Section */}
              <div className="checkout-section-card">
                <h3 className="section-card-title">
                  <CreditCard className="title-icon text-accent-pink" size={18} />
                  Simulated Card Payment
                </h3>

                {/* Animated credit card */}
                <div className="card-scene">
                  <div className={`animated-credit-card ${focusedField === "cvv" ? "is-flipped" : ""} brand-${cardBrand}`}>
                    <div className="card-face card-front">
                      <div className="card-top-row">
                        <div className="card-chip" />
                        <span className="card-brand-badge uppercase">{cardBrand === "unknown" ? "demo" : cardBrand}</span>
                      </div>
                      <div className="card-number-display text-sm md:text-base">
                        {watchCardNumber || "•••• •••• •••• ••••"}
                      </div>
                      <div className="card-bottom-row">
                        <div className="card-holder-block">
                          <span className="card-meta-label">Card Holder</span>
                          <span className="card-meta-value truncate max-w-[150px]">
                            {watchCardholder?.toUpperCase() || "YOUR NAME"}
                          </span>
                        </div>
                        <div className="card-expiry-block">
                          <span className="card-meta-label">Expires</span>
                          <span className="card-meta-value">
                            {watchExpiry || "MM/YY"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-face card-back">
                      <div className="magnetic-strip" />
                      <div className="cvv-row">
                        <div className="cvv-signature">{watchCvv || "•••"}</div>
                      </div>
                      <p className="card-disclaimer">
                        Simulated credit card sandbox display. Secure tokenized environment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Fields */}
                <div className="payment-fields-stack">
                  <div className="field-wrap">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      {...register("payment.cardholderName")}
                      className={`form-field ${errors.payment?.cardholderName ? "border-red-500" : ""}`}
                      placeholder="SOPHIA MARTINEZ"
                      onFocus={() => setFocusedField("cardholderName")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {errors.payment?.cardholderName && (
                      <span className="error-hint">{errors.payment.cardholderName.message}</span>
                    )}
                  </div>

                  <div className="field-wrap">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={watchCardNumber}
                      onChange={handleCardNumberChange}
                      className={`form-field mono ${errors.payment?.cardNumber ? "border-red-500" : ""}`}
                      placeholder="4000 1234 5678 9010"
                      onFocus={() => setFocusedField("cardNumber")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {errors.payment?.cardNumber && (
                      <span className="error-hint">{errors.payment.cardNumber.message}</span>
                    )}
                  </div>

                  <div className="form-grid-2">
                    <div className="field-wrap">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        value={watchExpiry || ""}
                        onChange={handleExpiryDateChange}
                        className={`form-field mono ${errors.payment?.expiryDate ? "border-red-500" : ""}`}
                        placeholder="MM/YY"
                        onFocus={() => setFocusedField("expiryDate")}
                        onBlur={() => setFocusedField(null)}
                      />
                      {errors.payment?.expiryDate && (
                        <span className="error-hint">{errors.payment.expiryDate.message}</span>
                      )}
                    </div>
                    <div className="field-wrap">
                      <label>CVV</label>
                      <input
                        type="password"
                        value={watchCvv || ""}
                        onChange={handleCvvChange}
                        className={`form-field mono ${errors.payment?.cvv ? "border-red-500" : ""}`}
                        placeholder="•••"
                        onFocus={() => setFocusedField("cvv")}
                        onBlur={() => setFocusedField(null)}
                      />
                      {errors.payment?.cvv && (
                        <span className="error-hint">{errors.payment.cvv.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Checkout Action */}
              <button 
                type="submit" 
                className="checkout-submit-btn cursor-pointer py-4 hover:opacity-95 text-xs md:text-sm font-extrabold uppercase tracking-wider"
              >
                {savings > 0 && (
                  <span className="savings-badge">Saving ₹{savings.toFixed(2)}</span>
                )}
                <Lock size={16} />
                Pay &amp; Complete Order (₹{finalPayable.toFixed(2)})
              </button>
            </form>
          </div>

          {/* Right Column Sticky summary */}
          <div className="checkout-summary-col">
            <div className="summary-sticky-card">
              <h3 className="section-card-title border-none m-0 pb-3">
                <ShoppingBag className="title-icon text-accent-pink" size={18} />
                Order Review ({cartCount})
              </h3>

              {/* Scrollable Summary items */}
              <div className="summary-items-scroll max-h-[260px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item-row flex gap-3 items-center py-2.5 border-b border-border last:border-b-0">
                    <img src={item.image} alt={item.name} className="summary-item-img w-10 h-12 object-cover rounded-lg border border-border" />
                    <div className="summary-item-info flex-1 min-w-0">
                      <h4 className="summary-item-name text-xs font-bold text-text-primary truncate">{item.name}</h4>
                      <p className="summary-item-meta text-[10px] text-text-muted mt-0.5">
                        Size: {item.size} | Qty: {item.quantity} | Col: {item.color}
                      </p>
                    </div>
                    <span className="summary-item-price text-xs font-extrabold text-text-primary">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div className="coupon-section border-t border-border pt-4 mt-1">
                {couponCode ? (
                  <div className="coupon-applied-tag flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-green-700">
                      <Tag size={14} />
                      <span>Coupon <strong>{couponCode}</strong> applied</span>
                    </div>
                    <button type="button" onClick={removeCoupon} className="coupon-remove-btn text-green-700 hover:text-green-950 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="coupon-input-row flex gap-2">
                      <div className="coupon-field-wrap flex-1 relative flex items-center">
                        <Tag className="coupon-icon left-2.5 text-text-muted" size={14} />
                        <input
                          type="text"
                          className="coupon-input w-full text-xs"
                          placeholder="PROMO CODE (e.g. WELCOME10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={couponLoading || !couponInput.trim()}
                        className="coupon-apply-btn text-xs px-3 bg-text-primary text-bg-primary font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                        onClick={handleApplyCoupon}
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponResult?.error && (
                      <p className="coupon-error text-[10px] text-red-500 font-semibold mt-1">{couponResult.error}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Details Breakdown */}
              <div className="summary-totals border-t border-border pt-4">
                <div className="total-line flex justify-between text-xs text-text-secondary">
                  <span>Subtotal:</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="total-line discount-line flex justify-between text-xs text-green-600 font-bold">
                    <span>Discount Savings:</span>
                    <span>-₹{savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-line flex justify-between text-xs text-text-secondary">
                  <span>Shipping Cost:</span>
                  <span className="free-label text-green-600 font-bold">FREE</span>
                </div>
                <div className="total-line grand-total flex justify-between text-sm font-extrabold text-text-primary pt-3 border-t border-dashed border-border mt-2">
                  <span>Payable Total:</span>
                  <span className="text-accent-pink text-base">₹{finalPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secure Checkout Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <div className="checkout-overlay">
            {!isSuccess ? (
              <div className="processing-card max-w-sm w-full mx-4 text-center">
                <Loader2 className="animate-spin text-accent-pink mx-auto mb-4" size={40} />
                <h3>Verifying Transaction Security</h3>
                <p className="processing-step-text text-center text-xs text-text-muted mt-2">{steps[processingStep]}</p>
                <div className="processing-progress-bar w-full mt-4">
                  <div
                    className="processing-progress-fill"
                    style={{ 
                      width: `${((processingStep + 1) / steps.length) * 100}%`, 
                      transition: "width 0.4s ease" 
                    }}
                  />
                </div>
                <div className="pci-badge flex items-center justify-center gap-1.5 text-[10px] text-text-muted mt-4">
                  <ShieldCheck className="pci-icon text-green-500" size={14} />
                  SSL Certified Secure Sandbox Environment
                </div>
              </div>
            ) : (
              <div className="success-card max-w-sm w-full mx-4 text-center">
                <div className="success-icon-wrap text-green-500 mx-auto mb-4">
                  <CheckCircle2 size={56} />
                </div>
                <h2 className="text-xl font-black">Order Dispatched!</h2>
                <p className="text-xs text-text-muted mt-1">Your simulated credit card charge completed successfully.</p>

                <div className="success-details w-full mt-4 p-3 bg-bg-secondary border border-border rounded-xl">
                  <div className="success-row flex justify-between text-xs py-1.5 border-b border-border/10 last:border-b-0">
                    <span>Demo Order ID:</span>
                    <strong className="order-id-val text-cyan-400 font-mono">{createdOrderId}</strong>
                  </div>
                  <div className="success-row flex justify-between text-xs py-1.5 border-b border-border/10 last:border-b-0">
                    <span>Charged Total:</span>
                    <strong className="text-text-primary">₹{finalPayable.toFixed(2)}</strong>
                  </div>
                  {savings > 0 && (
                    <div className="success-row savings-row flex justify-between text-xs py-1.5 border-b border-border/10 last:border-b-0">
                      <span>Simulated Savings:</span>
                      <strong className="text-green-500">₹{savings.toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                <div className="success-actions flex flex-col gap-2.5 w-full mt-6">
                  <button 
                    className="btn-view-orders w-full py-3 font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 rounded-full bg-accent-pink hover:bg-accent-pink/90 text-white cursor-pointer" 
                    onClick={() => { 
                      setIsProcessing(false); 
                      navigate("/orders"); 
                    }}
                  >
                    View My Purchase History <ChevronRight size={14} />
                  </button>
                  <button 
                    className="btn-continue-shop w-full py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer" 
                    onClick={() => { 
                      setIsProcessing(false); 
                      navigate("/catalog"); 
                    }}
                  >
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
