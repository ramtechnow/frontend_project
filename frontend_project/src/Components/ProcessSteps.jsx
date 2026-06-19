import React from "react";
import { Truck, ShieldCheck, RefreshCw } from "lucide-react";

const ProcessSteps = () => {
  const steps = [
    {
      icon: <Truck size={32} style={{ color: "var(--accent-pink)" }} />,
      title: "Global Express Delivery",
      description: "Fast, reliable shipping directly to your doorstep with real-time tracking updates."
    },
    {
      icon: <ShieldCheck size={32} style={{ color: "var(--accent-pink)" }} />,
      title: "Secure Checkout (Demo)",
      description: "SSL encrypted checkout simulation. No real payments or credit cards are charged."
    },
    {
      icon: <RefreshCw size={32} style={{ color: "var(--accent-pink)" }} />,
      title: "Easy 30-Day Returns",
      description: "Not the perfect fit? Hassle-free exchanges or refund simulation within 30 days."
    }
  ];

  return (
    <div 
      style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "var(--space-6)", 
        margin: "var(--space-10) 0",
        padding: "var(--space-6) var(--space-4)",
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--border-radius-md)",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      {steps.map((step, index) => (
        <div 
          key={index}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            textAlign: "center", 
            padding: "var(--space-4) var(--space-3)",
            gap: "var(--space-2)"
          }}
        >
          <div style={{ marginBottom: "var(--space-2)" }}>{step.icon}</div>
          <h3 style={{ fontSize: "var(--text-md)", fontWeight: "700", color: "var(--text-primary)" }}>
            {step.title}
          </h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: "260px" }}>
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProcessSteps;
