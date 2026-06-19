import React, { useState } from 'react';
import { Trash2, Tag, Loader2 } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';

export const AdminCouponsTab = ({ 
  coupons = [], 
  onRefreshCoupons, 
  addToast,
  triggerConfirm,
  logAction
}) => {
  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [saving, setSaving] = useState(false);
  const [busyCouponId, setBusyCouponId] = useState(null);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      addToast("Coupon code and discount value are required!", "error");
      return;
    }
    if (Number(discountValue) <= 0) {
      addToast("Discount value must be greater than 0", "error");
      return;
    }

    setSaving(true);
    try {
      await adminApi.createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount,
        maxUses,
        expiresAt
      });
      
      addToast("🎉 Coupon created successfully!", "success");
      logAction(`Created new promotion coupon: "${code.toUpperCase()}"`);
      
      // Reset Form State
      setCode("");
      setDiscountType("percentage");
      setDiscountValue("");
      setMinOrderAmount("");
      setMaxUses("");
      setExpiresAt("");
      
      onRefreshCoupons();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to create coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (couponId) => {
    setBusyCouponId(couponId);
    try {
      await adminApi.toggleCoupon(couponId);
      addToast("Toggled coupon status", "success");
      onRefreshCoupons();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to toggle status", "error");
    } finally {
      setBusyCouponId(null);
    }
  };

  const handleDeleteCoupon = (coupon) => {
    triggerConfirm({
      title: "Delete Promotional Coupon?",
      message: `Are you sure you want to permanently delete the coupon code "${coupon.code}"? Customers will no longer be able to apply it during checkout.`,
      isDestructive: true,
      confirmText: "Delete Coupon",
      onConfirm: async () => {
        try {
          await adminApi.deleteCoupon(coupon._id);
          addToast("🎉 Coupon deleted successfully!", "success");
          logAction(`Deleted coupon: "${coupon.code}"`);
          onRefreshCoupons();
        } catch (err) {
          console.error(err);
          addToast(err.message || "Failed to delete coupon", "error");
        }
      }
    });
  };

  return (
    <div className="coupon-manager-section animate-fade-in">
      <h2>Offers & Coupon Codes</h2>

      <div className="coupon-manager-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginTop: '16px'
      }}>
        {/* CREATE COUPON CARD */}
        <div className="coupon-create-card" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: '800' }}>Create New Coupon</h3>
          
          <form onSubmit={handleCreateCoupon} className="coupon-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="coupon-form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Coupon Code</label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="e.g. SAVE20" 
                className="coupon-form-input code-input"
                style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                required 
              />
            </div>

            <div className="coupon-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="coupon-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Discount Type</label>
                <select 
                  value={discountType} 
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="coupon-form-select"
                  style={{ width: '100%', height: '40px', padding: '0 8px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat ($)</option>
                </select>
              </div>

              <div className="coupon-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Value</label>
                <input 
                  type="number" 
                  value={discountValue} 
                  onChange={(e) => setDiscountValue(e.target.value)} 
                  placeholder={discountType === 'percentage' ? "20" : "15"} 
                  className="coupon-form-input"
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  min="1"
                  required 
                />
              </div>
            </div>

            <div className="coupon-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="coupon-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Min Order ($)</label>
                <input 
                  type="number" 
                  value={minOrderAmount} 
                  onChange={(e) => setMinOrderAmount(e.target.value)} 
                  placeholder="0" 
                  className="coupon-form-input"
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  min="0"
                />
              </div>

              <div className="coupon-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Max Uses</label>
                <input 
                  type="number" 
                  value={maxUses} 
                  onChange={(e) => setMaxUses(e.target.value)} 
                  placeholder="0 (unlimited)" 
                  className="coupon-form-input"
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  min="0"
                />
              </div>
            </div>

            <div className="coupon-form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Expiry Date</label>
              <input 
                type="date" 
                value={expiresAt} 
                onChange={(e) => setExpiresAt(e.target.value)} 
                className="coupon-form-input"
                style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
            </div>

            <button 
              type="submit" 
              className="coupon-submit-btn"
              disabled={saving}
              style={{
                height: '42px',
                width: '100%',
                backgroundColor: saving ? 'var(--border-color)' : 'var(--accent-color)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--border-radius-full)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '10px'
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Tag size={16} />}
              {saving ? "Creating Promotion..." : "Create Coupon Code"}
            </button>
          </form>
        </div>

        {/* LIST OF COUPONS */}
        <div className="coupon-list-card" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '400px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: '800' }}>Active Coupon Listings</h3>
          
          <div className="coupons-scroll-container" style={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            maxHeight: '420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {coupons.map((c) => {
              const isExpired = c.expiresAt && new Date() > new Date(c.expiresAt);
              const isBusy = busyCouponId === c._id;

              return (
                <div key={c._id} className={`coupon-item-card ${!c.isActive || isExpired ? 'inactive' : ''}`} style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  opacity: !c.isActive || isExpired ? 0.75 : 1
                }}>
                  <div className="coupon-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="coupon-badge-code" style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      letterSpacing: '0.5px'
                    }}>{c.code}</span>
                    
                    <div className="coupon-card-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => handleToggleCoupon(c._id)} 
                        disabled={isBusy}
                        className={`coupon-status-btn ${c.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                        title={c.isActive ? "Deactivate Coupon" : "Activate Coupon"}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--border-radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          backgroundColor: c.isActive ? 'var(--bg-secondary)' : 'var(--accent-color)',
                          border: c.isActive ? '1px solid var(--border-color)' : 'none',
                          color: c.isActive ? 'var(--text-primary)' : '#ffffff'
                        }}
                      >
                        {isBusy ? "..." : (c.isActive ? "Deactivate" : "Activate")}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteCoupon(c)} 
                        disabled={isBusy}
                        className="coupon-delete-btn"
                        title="Delete Coupon"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          border: 'none',
                          backgroundColor: '#fee2e2',
                          color: '#ef4444',
                          borderRadius: '50%',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="coupon-card-body" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: 0 }}>
                      Discount: <strong>{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`} Off</strong>
                    </p>
                    {c.minOrderAmount > 0 && (
                      <p style={{ margin: 0 }}>Min. Order Amount: <strong>${c.minOrderAmount}</strong></p>
                    )}
                    <p style={{ margin: 0 }}>
                      Uses: <strong>{c.usedCount}</strong> {c.maxUses > 0 ? ` / ${c.maxUses}` : " (unlimited)"}
                    </p>
                    {c.expiresAt ? (
                      <p style={{ margin: 0 }} className={isExpired ? 'expired-text' : ''}>
                        Expires: <strong>{new Date(c.expiresAt).toLocaleDateString()}</strong> {isExpired && "⚠️ (Expired)"}
                      </p>
                    ) : (
                      <p style={{ margin: 0 }}>Expires: <strong>Never</strong></p>
                    )}
                  </div>
                </div>
              );
            })}
            {coupons.length === 0 && (
              <div className="no-coupons-placeholder" style={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                <p>No coupons created yet. Fill out the form to add your first promotion!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
