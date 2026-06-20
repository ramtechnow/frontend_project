import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  MapPin, 
  Phone, 
  User, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Landmark, 
  Tag, 
  X, 
  AlertCircle 
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

import "../styles/checkout.css";

export const Checkout: React.FC = () => {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ── Coupon State ─────────────────────────────────────────────────────────────
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

  // ── UI States ────────────────────────────────────────────────────────────────
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const steps = [
    "Establishing secure connection...",
    "Verifying payment credentials...",
    "Authorizing transaction with issuing bank...",
    "Finalizing your order in database..."
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

  // Watch field values for card previews
  const watchCardholder = watch("payment.cardholderName");
  const watchCardNumber = watch("payment.cardNumber");
  const watchExpiry = watch("payment.expiryDate");
  const watchCvv = watch("payment.cvv");

  // ── Handlers ─────────────────────────────────────────────────────────────────
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
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
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
        <div className="checkout-empty-guard max-w-md mx-auto text-center py-20 px-4">
          <ShoppingBag className="mx-auto text-text-muted mb-4 animate-bounce" size={48} />
          <h2 className="text-xl font-extrabold mb-2">No Items in Cart</h2>
          <p className="text-sm text-text-muted mb-6">
            Please add products to your cart before proceeding to checkout.
          </p>
          <button 
            onClick={() => navigate("/catalog")}
            className="px-6 py-2.5 bg-accent-pink hover:bg-accent-pink/90 text-white font-bold text-sm rounded-full transition-all"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="checkout-layout">
          {/* Left Column Forms */}
          <div className="checkout-forms-col">
            <form onSubmit={handleSubmit(onSubmitCheckout)} className="checkout-form-stack">
              {transactionError && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-xs md:text-sm">
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
                        placeholder="Sophia Martinez"
                      />
                    </div>
                    {errors.address?.fullName && (
                      <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                        {errors.address.fullName.message}
                      </span>
                    )}
                  </div>

                  <div className="field-wrap span-2">
                    <label>Address Line</label>
                    <input
                      type="text"
                      {...register("address.addressLine")}
                      className={`form-field ${errors.address?.addressLine ? "border-red-500" : ""}`}
                      placeholder="Apt 4B, 12 Park Ave"
                    />
                    {errors.address?.addressLine && (
                      <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                        {errors.address.addressLine.message}
                      </span>
                    )}
                  </div>

                  <div className="field-wrap">
                    <label>City</label>
                    <input
                      type="text"
                      {...register("address.city")}
                      className={`form-field ${errors.address?.city ? "border-red-500" : ""}`}
                      placeholder="New York"
                    />
                    {errors.address?.city && (
                      <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                        {errors.address.city.message}
                      </span>
                    )}
                  </div>

                  <div className="form-grid-2-inner">
                    <div className="field-wrap">
                      <label>State</label>
                      <input
                        type="text"
                        {...register("address.state")}
                        className={`form-field ${errors.address?.state ? "border-red-500" : ""}`}
                        placeholder="NY"
                      />
                      {errors.address?.state && (
                        <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                          {errors.address.state.message}
                        </span>
                      )}
                    </div>
                    <div className="field-wrap">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        {...register("address.postalCode")}
                        className={`form-field ${errors.address?.postalCode ? "border-red-500" : ""}`}
                        placeholder="10016"
                      />
                      {errors.address?.postalCode && (
                        <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                          {errors.address.postalCode.message}
                        </span>
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
                        placeholder="+1 212-555-0199"
                      />
                    </div>
                    {errors.address?.phone && (
                      <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                        {errors.address.phone.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Secure simulated payments */}
              <div className="checkout-section-card">
                <h3 className="section-card-title">
                  <CreditCard className="title-icon text-accent-pink" size={18} />
                  Simulated Card Payment
                </h3>

                {/* Animated credit card */}
                <div className="card-scene">
                  <div className={`animated-credit-card ${focusedField === "cvv" ? "is-flipped" : ""}`}>
                    <div className="card-face card-front">
                      <div className="card-top-row">
                        <div className="card-chip" />
                        <Landmark className="card-bank-icon" size={24} />
                      </div>
                      <div className="card-number-display text-xs md:text-sm">
                        {watchCardNumber || "•••• •••• •••• ••••"}
                      </div>
                      <div className="card-bottom-row">
                        <div className="card-holder-block">
                          <span className="card-meta-label">Card Holder</span>
                          <span className="card-meta-value">
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
                      <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                        {errors.payment.cardholderName.message}
                      </span>
                    )}
                  </div>

                  <div className="field-wrap">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={watchCardNumber || ""}
                      onChange={handleCardNumberChange}
                      className={`form-field mono ${errors.payment?.cardNumber ? "border-red-500" : ""}`}
                      placeholder="4000 1234 5678 9010"
                      onFocus={() => setFocusedField("cardNumber")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {errors.payment?.cardNumber && (
                      <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                        {errors.payment.cardNumber.message}
                      </span>
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
                        <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                          {errors.payment.expiryDate.message}
                        </span>
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
                        <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                          {errors.payment.cvv.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit" 
                className="checkout-submit-btn cursor-pointer py-3.5 hover:opacity-95 text-xs md:text-sm font-extrabold uppercase tracking-wider"
              >
                {savings > 0 && (
                  <span className="savings-badge">Saving ₹{savings.toFixed(2)}</span>
                )}
                <ShieldCheck size={18} />
                Pay &amp; Finalize Order (₹{finalPayable.toFixed(2)})
              </button>
            </form>
          </div>

          {/* Right Column Summary */}
          <div className="checkout-summary-col">
            <div className="summary-sticky-card">
              <h3 className="section-card-title border-none m-0 pb-2.5">
                <ShoppingBag className="title-icon text-accent-pink" size={18} />
                Order Review ({cartCount})
              </h3>

              {/* Items scroll */}
              <div className="summary-items-scroll max-h-[220px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item-row flex gap-2.5 items-center py-2 border-b border-border last:border-b-0">
                    <img src={item.image} alt={item.name} className="summary-item-img w-10 h-12 object-cover rounded-md" />
                    <div className="summary-item-info flex-1 min-w-0">
                      <h4 className="summary-item-name text-xs font-bold text-text-primary truncate">{item.name}</h4>
                      <p className="summary-item-meta text-[10px] text-text-muted">
                        Size: {item.size} | Qty: {item.quantity} | Col: {item.color}
                      </p>
                    </div>
                    <span className="summary-item-price text-xs font-extrabold text-text-primary">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupons input */}
              <div className="coupon-section border-t border-border pt-4">
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

              {/* Totals Summary */}
              <div className="summary-totals border-t border-border pt-4">
                <div className="total-line flex justify-between text-xs text-text-secondary">
                  <span>Cart Total:</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="total-line discount-line flex justify-between text-xs text-green-600 font-bold">
                    <span>Discount:</span>
                    <span>-₹{savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-line flex justify-between text-xs text-text-secondary">
                  <span>Simulated Delivery:</span>
                  <span className="free-label text-green-600 font-bold">FREE</span>
                </div>
                <div className="total-line grand-total flex justify-between text-sm font-extrabold text-text-primary pt-2.5 border-t border-dashed border-border mt-1">
                  <span>Payable Amount:</span>
                  <span className="text-accent-pink text-base">₹{finalPayable.toFixed(2)}</span>
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
              <div className="processing-card max-w-sm w-full mx-4">
                <Loader2 className="animate-spin text-accent-pink" size={36} />
                <h3>Secure transaction verification in progress</h3>
                <p className="processing-step-text text-center">{steps[processingStep]}</p>
                <div className="processing-progress-bar w-full mt-2">
                  <div
                    className="processing-progress-fill"
                    style={{ 
                      width: `${((processingStep + 1) / steps.length) * 100}%`, 
                      transition: "width 0.4s ease" 
                    }}
                  />
                </div>
                <div className="pci-badge flex items-center gap-1.5 text-xs text-text-muted mt-2">
                  <ShieldCheck className="pci-icon text-green-500" size={14} />
                  SSL Certified Demo Environment
                </div>
              </div>
            ) : (
              <div className="success-card max-w-sm w-full mx-4">
                <div className="success-icon-wrap text-green-500">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-lg md:text-xl font-black">Order Confirmed!</h2>
                <p className="text-xs text-text-muted">Your simulated purchase has been logged successfully.</p>

                <div className="success-details w-full">
                  <div className="success-row flex justify-between text-xs py-1 border-b border-border/10 last:border-b-0">
                    <span>Simulated Order ID:</span>
                    <strong className="order-id-val text-cyan-400">{createdOrderId}</strong>
                  </div>
                  <div className="success-row flex justify-between text-xs py-1 border-b border-border/10 last:border-b-0">
                    <span>Amount Charged:</span>
                    <strong className="text-white">₹{finalPayable.toFixed(2)}</strong>
                  </div>
                  {savings > 0 && (
                    <div className="success-row savings-row flex justify-between text-xs py-1 border-b border-border/10 last:border-b-0">
                      <span>Simulated Savings:</span>
                      <strong className="text-green-400">₹{savings.toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                <div className="success-actions flex flex-col gap-2 w-full mt-4">
                  <button 
                    className="btn-view-orders w-full py-2.5 font-bold text-xs md:text-sm" 
                    onClick={() => { 
                      setIsProcessing(false); 
                      navigate("/orders"); 
                    }}
                  >
                    View My Orders
                  </button>
                  <button 
                    className="btn-continue-shop w-full py-2.5 text-xs font-semibold" 
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
