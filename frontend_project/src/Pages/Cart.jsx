import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../Context/CartContext";
import { ShopContext } from "../Context/ShopContext";
import products from "../data/products";
import { Trash2, ShoppingBag, ShieldCheck, Tag, ArrowRight } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalCartAmount, getCartItemCount } = useContext(CartContext);
  const { all_product } = useContext(ShopContext) || { all_product: [] };
  const productsList = all_product.length > 0 ? all_product : products;
  const navigate = useNavigate();

  const totalAmount = getTotalCartAmount();

  const handleQtyChange = (key, currentQty, increment) => {
    const nextQty = increment ? currentQty + 1 : currentQty - 1;
    updateQuantity(key, nextQty);
  };

  return (
    <main className="container" style={{ padding: "var(--space-6) var(--space-4) var(--space-12) var(--space-4)", minHeight: "70vh" }}>
      {/* Title */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "800" }}>Shopping Cart</h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Review your items, quantities, and simulated totals before checking out.
        </p>
      </div>

      {getCartItemCount() === 0 ? (
        <div 
          style={{ 
            textAlign: "center", 
            padding: "var(--space-12) var(--space-6)", 
            border: "1px dashed var(--border-color)", 
            borderRadius: "var(--border-radius-md)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)"
          }}
        >
          <ShoppingBag size={48} style={{ color: "var(--text-muted)", opacity: 0.8 }} />
          <h3>Your Shopping Cart is Empty</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: "320px" }}>
            Add items to your cart by selecting details on the product details pages.
          </p>
          <Link to="/">
            <button 
              className="interactive-target"
              style={{
                backgroundColor: "var(--accent-pink)",
                color: "white",
                fontWeight: "700",
                padding: "0 var(--space-6)",
                borderRadius: "var(--border-radius-full)",
                height: "44px"
              }}
            >
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "2fr 1fr", 
            gap: "var(--space-8)",
            alignItems: "start"
          }}
          className="cart-responsive-grid"
        >
          {/* Left: Items list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {Object.keys(cartItems).map((key) => {
              const item = cartItems[key];
              const product = productsList.find((p) => p.id === item.id);
              if (!product) return null;

              return (
                <div 
                  key={key}
                  style={{
                    display: "flex",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "var(--space-4)",
                    alignItems: "center",
                    gap: "var(--space-4)",
                    flexWrap: "wrap"
                  }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: "70px", height: "90px", objectFit: "cover", borderRadius: "var(--border-radius-sm)" }}
                  />

                  {/* Info details */}
                  <div style={{ flexGrow: 1, minWidth: "180px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "700", color: "var(--text-primary)" }}>
                      {product.name}
                    </h3>
                    <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
                      <span>Size: <strong>{item.size}</strong></span>
                      <span>Color: <strong>{item.color || "White"}</strong></span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-pink)", marginTop: "4px" }}>
                      ₹{product.new_price.toFixed(2)}
                    </span>
                  </div>

                  {/* Qty count control */}
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-full)", height: "36px", overflow: "hidden" }}>
                    <button 
                      onClick={() => handleQtyChange(key, item.quantity, false)}
                      style={{ width: "32px", height: "100%", minHeight: "auto", fontWeight: "700" }}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span style={{ width: "32px", textAlign: "center", fontSize: "12px", fontWeight: "700" }}>{item.quantity}</span>
                    <button 
                      onClick={() => handleQtyChange(key, item.quantity, true)}
                      style={{ width: "32px", height: "100%", minHeight: "auto", fontWeight: "700" }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove trigger */}
                  <button 
                    onClick={() => removeFromCart(key)}
                    style={{ width: "36px", height: "36px", minHeight: "auto", borderRadius: "50%", color: "#ef4444", backgroundColor: "#fef2f2" }}
                    title="Remove item"
                    aria-label={`Remove ${product.name} from cart`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right: Summary panel */}
          <div 
            style={{ 
              backgroundColor: "var(--bg-secondary)", 
              border: "1px solid var(--border-color)", 
              borderRadius: "var(--border-radius-md)", 
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)"
            }}
          >
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: "800" }}>Order Summary</h2>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              <span>Items Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              <span>Simulated Shipping:</span>
              <span style={{ color: "var(--success-color)", fontWeight: "600" }}>FREE</span>
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "4px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-md)", fontWeight: "800" }}>
              <span>Subtotal:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>

            {/* Simulated Checkout Buttons */}
            <button 
              className="interactive-target"
              onClick={() => navigate("/checkout")}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "var(--accent-pink)",
                color: "white",
                fontWeight: "700",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px"
              }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            {/* Secure note */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>
              <ShieldCheck size={14} style={{ color: "var(--success-color)", flexShrink: 0 }} />
              <span>Secure checkout experience (demo only)</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;
