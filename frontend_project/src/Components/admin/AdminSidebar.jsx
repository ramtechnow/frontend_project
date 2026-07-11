import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  Users, 
  ShoppingCart, 
  Tag,
  User,
  LogOut,
  Image
} from 'lucide-react';

export const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  productsCount = 0, 
  usersCount = 0, 
  ordersCount = 0, 
  couponsCount = 0,
  bannersCount = 0
}) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <img alt="RamCart Logo" src="/RamCart_logo_v2.png" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-color)', fontFamily: "'Outfit', sans-serif", lineHeight: '1.2' }}>RamCart</span>
          <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Console</span>
        </div>
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
        
        <button 
          type="button"
          className={activeTab === "banners" ? "active" : ""} 
          onClick={() => setActiveTab("banners")}
        >
          <span className="menu-icon"><Image size={18} /></span> Hero Banners ({bannersCount})
        </button>
      </nav>

      {/* Bottom Profile and Logout Section */}
      <div className="sidebar-footer" style={{
        marginTop: 'auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>
              {user?.name || 'Admin User'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
              {user?.role === 'admin' ? 'System Root' : 'Administrator'}
            </span>
          </div>
        </div>
        <button 
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444',
            border: 'none',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'var(--transition-smooth)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};
