import React from 'react';
import { AlertTriangle, Activity } from 'lucide-react';

export const AdminDashboardTab = ({ 
  products = [], 
  users = [], 
  orders = [], 
  setActiveTab,
  recentActions = []
}) => {
  // Calculations
  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalStock = products.reduce((acc, curr) => acc + (Number(curr.stockCount) || 0), 0);
  const catalogValue = products.reduce((acc, curr) => acc + ((Number(curr.new_price) || 0) * (Number(curr.stockCount) || 0)), 0);

  // Out of stock & Low stock counts
  const outOfStockCount = products.filter(p => Number(p.stockCount) === 0).length;
  const lowStockCount = products.filter(p => Number(p.stockCount) > 0 && Number(p.stockCount) <= 15).length;

  // Category distributions
  const countCategory = (cat) => products.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
  const catWomen = countCategory("women");
  const catMen = countCategory("men");
  const catKids = countCategory("kid") + countCategory("kids");
  const catMax = Math.max(catWomen, catMen, catKids, 1);

  return (
    <div className="dashboard-section animate-fade-in">
      <h2>System Performance Metrics</h2>
      
      {/* STATS METRIC GRID */}
      <div className="metrics-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)' 
      }}>
        {/* Catalog Asset Value */}
        <div className="metric-card val">
          <div className="metric-details">
            <span className="metric-title">Catalog Asset Value</span>
            <span className="metric-value">₹{catalogValue.toLocaleString('en-US')}</span>
          </div>
          <span className="metric-icon" style={{ fontSize: '1.5rem' }}>💰</span>
        </div>

        {/* Active Products */}
        <div className="metric-card prod">
          <div className="metric-details">
            <span className="metric-title">Active Products</span>
            <span className="metric-value">{totalProducts} Items</span>
          </div>
          <span className="metric-icon" style={{ fontSize: '1.5rem' }}>👕</span>
        </div>

        {/* Registered Users */}
        <div className="metric-card users">
          <div className="metric-details">
            <span className="metric-title">Registered Accounts</span>
            <span className="metric-value">{totalUsers} Users</span>
          </div>
          <span className="metric-icon" style={{ fontSize: '1.5rem' }}>👥</span>
        </div>

        {/* Store Stocks */}
        <div className="metric-card stock">
          <div className="metric-details">
            <span className="metric-title">Remaining Stocks</span>
            <span className="metric-value">{totalStock} Units</span>
          </div>
          <span className="metric-icon" style={{ fontSize: '1.5rem' }}>📦</span>
        </div>
      </div>

      {/* DETAILED INVENTORY STATE BADGES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: outOfStockCount > 0 ? '#fef2f2' : 'var(--bg-secondary)',
          border: outOfStockCount > 0 ? '1px solid #fecaca' : '1px solid var(--border-color)',
          borderRadius: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: outOfStockCount > 0 ? '#fee2e2' : 'var(--bg-primary)',
            color: outOfStockCount > 0 ? '#ef4444' : 'var(--text-muted)'
          }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Out of Stock Products</span>
            <strong style={{ fontSize: '1.1rem', color: outOfStockCount > 0 ? '#ef4444' : 'var(--text-primary)' }}>{outOfStockCount} Items</strong>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: lowStockCount > 0 ? '#fffbeb' : 'var(--bg-secondary)',
          border: lowStockCount > 0 ? '1px solid #fef3c7' : '1px solid var(--border-color)',
          borderRadius: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: lowStockCount > 0 ? '#fef3c7' : 'var(--bg-primary)',
            color: lowStockCount > 0 ? '#d97706' : 'var(--text-muted)'
          }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Low Stock Warning (Under 15)</span>
            <strong style={{ fontSize: '1.1rem', color: lowStockCount > 0 ? '#d97706' : 'var(--text-primary)' }}>{lowStockCount} Items</strong>
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS SPLIT */}
      <div className="charts-split">
        <div className="chart-card">
          <h3>Product Category Distribution</h3>
          <div className="bar-graph-container">
            <div className="graph-bar-row">
              <span className="bar-label">Women ({catWomen})</span>
              <div className="bar-wrapper">
                <div className="bar-fill women" style={{ width: `${(catWomen / catMax) * 100}%` }}></div>
              </div>
              <span className="bar-percentage">{Math.round((catWomen / (totalProducts || 1)) * 100)}%</span>
            </div>
            <div className="graph-bar-row">
              <span className="bar-label">Men ({catMen})</span>
              <div className="bar-wrapper">
                <div className="bar-fill men" style={{ width: `${(catMen / catMax) * 100}%` }}></div>
              </div>
              <span className="bar-percentage">{Math.round((catMen / (totalProducts || 1)) * 100)}%</span>
            </div>
            <div className="graph-bar-row">
              <span className="bar-label">Kids ({catKids})</span>
              <div className="bar-wrapper">
                <div className="bar-fill kids" style={{ width: `${(catKids / catMax) * 100}%` }}></div>
              </div>
              <span className="bar-percentage">{Math.round((catKids / (totalProducts || 1)) * 100)}%</span>
            </div>
          </div>
        </div>
        
        <div className="chart-card helpers">
          <h3>Administrative Shortcuts</h3>
          <div className="shortcuts-row">
            <button className="shortcut-btn" onClick={() => setActiveTab("add")}>
              🚀 Launch New Product
            </button>
            <button className="shortcut-btn" onClick={() => setActiveTab("list")}>
              🔍 Audit Catalog Stock
            </button>
            <button className="shortcut-btn" onClick={() => setActiveTab("users")}>
              ⚙️ Resolve User Issues
            </button>
            <button className="shortcut-btn" onClick={() => setActiveTab("coupons")}>
              🏷️ Manage Coupons
            </button>
          </div>
        </div>
      </div>

      {/* SIMULATED ADMINISTRATIVE ACTION LOG */}
      <div style={{
        marginTop: 'var(--space-6)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Activity size={18} style={{ color: 'var(--accent-color)' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>Recent Administrative Logs</h3>
        </div>

        {recentActions.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No audit events logged in this session yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActions.map((act, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px' }}>⚡</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{act.message}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{act.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
