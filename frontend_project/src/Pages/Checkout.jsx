import React, { useContext, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { WishlistContext } from '../Context/WishlistContext';
import { BACKEND_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Phone, User, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CSS/Checkout.css';

export const Checkout = () => {
  const { cartItems, all_product, getTotalCartAmount, getDefaultCartItems } = useContext(ShopContext);
  const { fetchWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  // Redirect if cart is empty
  const cartItemCount = getDefaultCartItems();
  
  // Form States
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // UI States
  const [focusedField, setFocusedField] = useState(''); // 'cvv' to flip card
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

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    let { name, value } = e.target;
    
    // Formatting card number: 4-digit chunks
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.match(/.{1,4}/g)?.join(' ') || value;
    }
    // Formatting expiry: MM/YY
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '').substring(0, 4);
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
    }
    // Formatting CVV: 3 digits max
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 3);
    }

    setPaymentForm({ ...paymentForm, [name]: value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validations
    const isAddressValid = Object.values(addressForm).every(val => val.trim() !== '');
    if (!isAddressValid) {
      alert("⚠️ Please fill in all shipping details!");
      return;
    }

    if (paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
      alert("⚠️ Please enter a valid 16-digit card number!");
      return;
    }

    if (paymentForm.expiryDate.length !== 5) {
      alert("⚠️ Please enter a valid card expiry date (MM/YY)!");
      return;
    }

    if (paymentForm.cvv.length !== 3) {
      alert("⚠️ Please enter a valid 3-digit CVV code!");
      return;
    }

    if (!localStorage.getItem('auth-token')) {
      alert("⚠️ You must be logged in to complete checkout!");
      navigate('/login');
      return;
    }

    // Map cart items into structured order items array
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
      alert("⚠️ Your shopping cart is empty!");
      navigate('/');
      return;
    }

    // Trigger simulation
    setIsProcessing(true);
    setProcessingStep(0);

    // Step-by-step loading timer
    const interval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1200);

    try {
      // Connect to actual database to place order
      const response = await fetch(`${BACKEND_URL}/placeorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          items: orderItems,
          amount: getTotalCartAmount(),
          address: addressForm
        })
      });

      const data = await response.json();

      // Finish gateway timer, check success
      setTimeout(() => {
        clearInterval(interval);
        if (data.success) {
          setIsProcessing(false);
          setIsSuccess(true);
          setCreatedOrderId(data.orderId);
          // Sync wishlist/cart state
          fetchWishlist();
          // Dispatch custom event to trigger Navbar cart count refresh
          window.dispatchEvent(new Event('auth-change'));
        } else {
          setIsProcessing(false);
          alert("❌ Order Placement Failed: " + data.error);
        }
      }, 5000);

    } catch (error) {
      clearInterval(interval);
      setIsProcessing(false);
      alert("❌ Failed to connect to order API. Please check your backend connection.");
    }
  };

  return (
    <div className="checkout-page-container dark:bg-slate-950 dark:text-slate-100 min-h-screen py-10 px-4">
      <AnimatePresence mode="wait">
        
        {/* PROCESSING LOADER STATE */}
        {isProcessing && (
          <motion.div 
            className="checkout-overlay"
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="processing-card bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 shadow-2xl max-w-sm">
              <Loader2 className="animate-spin text-amber-500" size={54} />
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">Simulating Secured Payment</h3>
                <p className="text-xs text-slate-400 font-mono tracking-wide h-6">
                  {steps[processingStep]}
                </p>
              </div>
              <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-amber-500 to-rose-500 h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((processingStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <ShieldCheck size={12} className="text-emerald-500" />
                PCI-DSS Compliant Gateway
              </span>
            </div>
          </motion.div>
        )}

        {/* ORDER SUCCESS STATE */}
        {isSuccess && (
          <motion.div 
            className="checkout-overlay"
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="success-card bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 shadow-2xl max-w-md w-full">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full"
              >
                <CheckCircle2 size={64} className="fill-emerald-500/10" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">Order Confirmed!</h2>
                <p className="text-sm text-slate-400">
                  Thank you for your purchase. Your payment was processed successfully.
                </p>
              </div>

              <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left text-xs font-mono space-y-2">
                <div className="flex justify-between border-b border-slate-850 pb-2 mb-2">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="text-cyan-400 font-extrabold truncate max-w-[180px]">{createdOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-white font-extrabold">₹{getTotalCartAmount()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="text-slate-300 font-bold truncate max-w-[180px]">{addressForm.fullName}, {addressForm.city}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Direct navigation back to Shop Catalog
                  navigate('/');
                  // Refresh window to clean cart local states
                  window.location.reload();
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* LEFT COLUMN: FORMS (8 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            
            {/* SHIPPING ADDRESS SECTION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <MapPin size={20} className="text-amber-500" />
                Shipping & Delivery Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase font-bold">Recipient Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      name="fullName" 
                      value={addressForm.fullName}
                      onChange={handleAddressChange}
                      placeholder="e.g. John Doe"
                      className="form-field w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase font-bold">Contact Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type="tel" 
                      name="phone" 
                      value={addressForm.phone}
                      onChange={handleAddressChange}
                      placeholder="e.g. +91 9876543210"
                      className="form-field w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 uppercase font-bold">Street Address</label>
                  <input 
                    type="text" 
                    name="addressLine" 
                    value={addressForm.addressLine}
                    onChange={handleAddressChange}
                    placeholder="e.g. Flat 302, Green Meadows Apartment"
                    className="form-field w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase font-bold">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    placeholder="e.g. Bangalore"
                    className="form-field w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">State</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      placeholder="Karnataka"
                      className="form-field w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Postal Code</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      value={addressForm.postalCode}
                      onChange={handleAddressChange}
                      placeholder="560001"
                      className="form-field w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT INFORMATION SECTION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <CreditCard size={20} className="text-amber-500" />
                Demo Payment Details
              </h3>

              {/* FLIPPING CREDIT CARD DISPLAY */}
              <div className="card-scene mx-auto mb-6">
                <div className={`animated-credit-card ${focusedField === 'cvv' ? 'is-flipped' : ''}`}>
                  
                  {/* CARD FRONT */}
                  <div className="card-face card-front bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 flex flex-col justify-between rounded-2xl text-white shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="card-chip w-10 h-8 bg-amber-400/80 rounded-md shadow-inner" />
                      <Landmark className="text-slate-400" size={24} />
                    </div>
                    <div className="card-number-display text-lg md:text-xl font-bold tracking-widest font-mono text-center my-4">
                      {paymentForm.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase text-slate-500 tracking-wider">Card Holder</span>
                        <span className="text-xs font-bold font-mono tracking-wide truncate max-w-[150px]">
                          {paymentForm.cardholderName.toUpperCase() || 'YOUR NAME'}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] uppercase text-slate-500 tracking-wider">Expires</span>
                        <span className="text-xs font-bold font-mono">
                          {paymentForm.expiryDate || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD BACK */}
                  <div className="card-face card-back bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 flex flex-col justify-between py-6 rounded-2xl text-white shadow-xl">
                    <div className="magnetic-strip w-full h-10 bg-slate-950 mt-2" />
                    <div className="px-6 flex items-center justify-end gap-2 mt-4">
                      <span className="text-[8px] uppercase text-slate-500">Authorized Sign</span>
                      <div className="cvv-signature bg-slate-100 text-slate-900 px-3 py-1 rounded text-sm font-bold font-mono text-right w-20">
                        {paymentForm.cvv || '•••'}
                      </div>
                    </div>
                    <div className="px-6 text-slate-600 text-[8px] tracking-tight leading-none text-center">
                      This simulated card is to be used solely for demo authorization workflows.
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD DETAILS FORM */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase font-bold">Cardholder Name</label>
                  <input 
                    type="text" 
                    name="cardholderName"
                    value={paymentForm.cardholderName}
                    onChange={handlePaymentChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                    placeholder="e.g. Johnathan Doe"
                    className="form-field w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase font-bold">Card Number</label>
                  <input 
                    type="text" 
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={handlePaymentChange}
                    onFocus={() => setFocusedField('number')}
                    onBlur={() => setFocusedField('')}
                    placeholder="e.g. 4532 7182 9304 8812"
                    className="form-field w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Expiry Date</label>
                    <input 
                      type="text" 
                      name="expiryDate"
                      value={paymentForm.expiryDate}
                      onChange={handlePaymentChange}
                      onFocus={() => setFocusedField('expiry')}
                      onBlur={() => setFocusedField('')}
                      placeholder="MM/YY"
                      className="form-field w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">CVV Code</label>
                    <input 
                      type="password" 
                      name="cvv"
                      value={paymentForm.cvv}
                      onChange={handlePaymentChange}
                      onFocus={() => setFocusedField('cvv')}
                      onBlur={() => setFocusedField('')}
                      placeholder="•••"
                      className="form-field w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BUTTON CHECKOUT */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-98"
            >
              <CreditCard size={18} />
              Place Order & Pay ₹{getTotalCartAmount()}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: SUMMARY ORDER (4 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 sticky top-24">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <ShoppingBag size={20} className="text-amber-500" />
              Order Summary
            </h3>
            
            {/* Items List */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {Object.keys(cartItems).map((key) => {
                const item = cartItems[key];
                const product = all_product.find(p => p.id === item.id);
                if (!product) return null;
                return (
                  <div key={key} className="flex gap-3 items-center">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-12 h-16 object-cover rounded-md border border-slate-100 dark:border-slate-850"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Color: <span className="text-slate-600 dark:text-slate-300 font-bold">{item.color || 'White'}</span> | Size: <span className="text-slate-600 dark:text-slate-300 font-bold">{item.size}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        ₹{product.new_price} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ₹{product.new_price * item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals Summary */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>₹{getTotalCartAmount()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span className="text-emerald-500 font-extrabold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-base border-t border-slate-100 dark:border-slate-850 pt-3">
                <span>Total Amount</span>
                <span>₹{getTotalCartAmount()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Checkout;
