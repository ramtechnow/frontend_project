import React from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../features/checkout/hooks/useCart";

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, cartCount, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 1500
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "400px",
          maxWidth: "90vw",
          height: "100vh",
          backgroundColor: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 1501,
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-6)",
          boxSizing: "border-box"
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Quick shopping cart overview"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "var(--text-primary)" }}>
            <ShoppingBag size={20} className="text-accent-pink" />
            <span>Shopping Cart ({cartCount})</span>
          </div>
          <button 
            style={{ width: "36px", height: "36px", minHeight: "auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--text-primary)" }}
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart list container */}
        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingRight: "4px" }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--space-10) 0", color: "var(--text-secondary)", fontSize: "13px" }}>
              Your cart is empty.
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.id}
                style={{
                  display: "flex",
                  gap: "var(--space-3)",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "var(--space-3)",
                  alignItems: "center"
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: "60px", height: "75px", objectFit: "cover", borderRadius: "var(--border-radius-sm)" }}
                />
                <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                  <h4 style={{ 
                    fontSize: "12px", 
                    fontWeight: "600", 
                    color: "var(--text-primary)", 
                    display: "-webkit-box", 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: "vertical", 
                    overflow: "hidden", 
                    lineHeight: "1.4",
                    margin: 0
                  }}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    Size: {item.size} | Color: {item.color}
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700" }}>
                      {item.quantity} &times; ₹{item.price.toFixed(2)}
                    </span>
                    <button 
                      style={{ 
                        fontSize: "11px", 
                        color: "#ef4444", 
                        minHeight: "auto", 
                        background: "none", 
                        border: "none", 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px"
                      }}
                      onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "var(--text-md)" }}>
              <span>Subtotal:</span>
              <span className="text-accent-pink">₹{cartTotal.toFixed(2)}</span>
            </div>
            <button 
              className="interactive-target cursor-pointer"
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "var(--accent-pink)",
                color: "white",
                fontWeight: "700",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "13px",
                border: "none"
              }}
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
            >
              View Detailed Cart
            </button>
            <button 
              className="interactive-target cursor-pointer"
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-secondary)",
                fontWeight: "700",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "13px",
                border: "none"
              }}
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPanel;
