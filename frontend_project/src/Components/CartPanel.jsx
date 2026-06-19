import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";
import { CartContext } from "../Context/CartContext";
import { ShopContext } from "../Context/ShopContext";

const CartPanel = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, getTotalCartAmount, getCartItemCount } = useContext(CartContext);
  const { all_product } = useContext(ShopContext) || { all_product: [] };
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--overlay-bg)",
          backdropFilter: "blur(4px)",
          -webkit-backdrop-filter: blur(4px)",
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
            <ShoppingBag size={20} />
            <span>Shopping Cart ({getCartItemCount()})</span>
          </div>
          <button 
            style={{ width: "36px", height: "36px", minHeight: "auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart list container */}
        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingRight: "4px" }}>
          {Object.keys(cartItems).length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--space-10) 0", color: "var(--text-secondary)" }}>
              Your cart is empty.
            </div>
          ) : (
            Object.keys(cartItems).map((key) => {
              const item = cartItems[key];
              const product = all_product.find((p) => p.id === item.id);
              if (!product) return null;

              return (
                <div 
                  key={key}
                  style={{
                    display: "flex",
                    gap: "var(--space-3)",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "var(--space-3)",
                    alignItems: "center"
                  }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: "60px", height: "75px", objectFit: "cover", borderRadius: "var(--border-radius-sm)" }}
                  />
                  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <h4 style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "-webkit-box", -webkit-line-clamp: 2, -webkit-box-orient: vertical, overflow: "hidden", lineHeight: "1.4" }}>
                      {product.name}
                    </h4>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      Size: {item.size} | Color: {item.color || "White"}
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700" }}>
                        {item.quantity} &times; ₹{product.new_price.toFixed(2)}
                      </span>
                      <button 
                        style={{ fontSize: "11px", color: "#ef4444", minHeight: "auto" }}
                        onClick={() => removeFromCart(key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {Object.keys(cartItems).length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "var(--text-md)" }}>
              <span>Subtotal:</span>
              <span>₹{getTotalCartAmount().toFixed(2)}</span>
            </div>
            <button 
              className="interactive-target"
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "var(--accent-pink)",
                color: "white",
                fontWeight: "700",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "13px"
              }}
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
            >
              View Detailed Cart
            </button>
            <button 
              className="interactive-target"
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-secondary)",
                fontWeight: "700",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "13px"
              }}
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
            >
              Checkout Now (Demo)
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPanel;
