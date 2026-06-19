import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  Users, 
  ShoppingCart, 
  Tag 
} from 'lucide-react';

export const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  productsCount = 0, 
  usersCount = 0, 
  ordersCount = 0, 
  couponsCount = 0 
}) => {
  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <LayoutDashboard className="sidebar-logo-icon-svg" size={24} style={{ color: 'var(--accent-color)' }} />
        <h3>SHOPS ADMIN</h3>
      </div>
      
      <nav className="sidebar-menu">
        <button 
          type="button"
          className={activeTab === "dashboard" ? "active" : ""} 
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="menu-icon"><LayoutDashboard size={18} /></span> Dashboard
        </button>
        
        <button 
          type="button"
          className={activeTab === "list" ? "active" : ""} 
          onClick={() => setActiveTab("list")}
        >
          <span className="menu-icon"><ShoppingBag size={18} /></span> Catalog ({productsCount})
        </button>
        
        <button 
          type="button"
          className={activeTab === "add" ? "active" : ""} 
          onClick={() => setActiveTab("add")}
        >
          <span className="menu-icon"><PlusCircle size={18} /></span> Add Product
        </button>
        
        <button 
          type="button"
          className={activeTab === "users" ? "active" : ""} 
          onClick={() => setActiveTab("users")}
        >
          <span className="menu-icon"><Users size={18} /></span> Users List ({usersCount})
        </button>
        
        <button 
          type="button"
          className={activeTab === "orders" ? "active" : ""} 
          onClick={() => setActiveTab("orders")}
        >
          <span className="menu-icon"><ShoppingCart size={18} /></span> Orders ({ordersCount})
        </button>
        
        <button 
          type="button"
          className={activeTab === "coupons" ? "active" : ""} 
          onClick={() => setActiveTab("coupons")}
        >
          <span className="menu-icon"><Tag size={18} /></span> Coupons & Offers ({couponsCount})
        </button>
      </nav>
    </div>
  );
};
