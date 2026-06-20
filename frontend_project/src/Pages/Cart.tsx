import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../features/checkout/hooks/useCart";
import { Trash2, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";

export const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = (productId: string, size: string, color: string, currentQty: number, increment: boolean) => {
    const nextQty = increment ? currentQty + 1 : currentQty - 1;
    updateQuantity(productId, size, color, nextQty);
  };

  return (
    <main className="container" style={{ padding: "var(--space-8) var(--space-4) var(--space-12) var(--space-4)", minHeight: "70vh", color: 'var(--text-primary)' }}>
      {/* Title */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "950", letterSpacing: "-0.5px" }}>Shopping Cart</h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Review your items, quantities, and simulated totals before checking out.
        </p>
      </div>

      {cartCount === 0 ? (
        <div 
          style={{ 
            textAlign: "center", 
            padding: "80px 24px", 
            border: "1px dashed var(--border-color)", 
            borderRadius: "16px",
            backgroundColor: "var(--bg-secondary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <ShoppingBag size={48} style={{ color: "var(--text-muted)", opacity: 0.8 }} />
          <h3 style={{ margin: 0, fontWeight: "800" }}>Your Shopping Cart is Empty</h3>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: "320px", lineHeight: "1.5" }}>
            Add items to your cart by selecting details on the product details pages.
          </p>
          <Link to="/catalog">
            <button 
              className="interactive-target"
              style={{
                backgroundColor: "var(--accent-pink)",
                color: "white",
                fontWeight: "700",
                padding: "0 24px",
                borderRadius: "var(--border-radius-full)",
                height: "44px",
                border: "none",
                fontSize: "0.85rem",
                cursor: "pointer"
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
            gap: "24px",
            alignItems: "start"
          }}
          className="cart-responsive-grid"
        >
          {/* Left: Items list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {cartItems.map((item) => (
              <div 
                key={item.id}
                style={{
                  display: "flex",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "16px",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap"
                }}
              >
                <img 
                  src={item.image || "https://placehold.co/100x120?text=Product"} 
                  alt={item.name} 
                  style={{ width: "70px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                />

                {/* Info details */}
                <div style={{ flexGrow: 1, minWidth: "180px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    {item.name}
                  </h3>
                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    <span>Size: <strong>{item.size}</strong></span>
                    <span>Color: <strong>{item.color}</strong></span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent-pink)", marginTop: "4px" }}>
                    ₹{item.price.toFixed(2)}
                  </span>
                </div>

                {/* Qty count control */}
                <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-full)", height: "36px", overflow: "hidden", backgroundColor: "var(--bg-primary)" }}>
                  <button 
                    onClick={() => handleQtyChange(item.productId, item.size, item.color, item.quantity, false)}
                    style={{ width: "32px", height: "100%", minHeight: "auto", fontWeight: "700", border: "none", background: "none", cursor: "pointer", color: "var(--text-primary)" }}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span style={{ width: "32px", textAlign: "center", fontSize: "12px", fontWeight: "700" }}>{item.quantity}</span>
                  <button 
                    onClick={() => handleQtyChange(item.productId, item.size, item.color, item.quantity, true)}
                    style={{ width: "32px", height: "100%", minHeight: "auto", fontWeight: "700", border: "none", background: "none", cursor: "pointer", color: "var(--text-primary)" }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Remove trigger */}
                <button 
                  onClick={() => removeFromCart(item.productId, item.size, item.color)}
                  style={{ width: "36px", height: "36px", minHeight: "auto", borderRadius: "50%", color: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Remove item"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Right: Summary panel */}
          <div 
            style={{ 
              backgroundColor: "var(--bg-secondary)", 
              border: "1px solid var(--border-color)", 
              borderRadius: "16px", 
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: "800", margin: 0 }}>Order Summary</h2>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              <span>Items Total ({cartCount}):</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              <span>Simulated Shipping:</span>
              <span style={{ color: "var(--success-color)", fontWeight: "600" }}>FREE</span>
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "4px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-md)", fontWeight: "800" }}>
              <span>Subtotal:</span>
              <span style={{ color: "var(--accent-pink)" }}>₹{cartTotal.toFixed(2)}</span>
            </div>

            {/* Simulated Checkout Buttons */}
            <button 
              className="interactive-target"
              onClick={() => navigate("/checkout")}
              style={{
                width: "100%",
                height: "46px",
                backgroundColor: "var(--accent-pink)",
                color: "white",
                fontWeight: "700",
                borderRadius: "var(--border-radius-full)",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px",
                border: "none",
                cursor: "pointer"
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
