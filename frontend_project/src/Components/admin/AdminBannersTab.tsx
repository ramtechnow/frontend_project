import React, { useState } from 'react';
import { Trash2, Image, Loader2, Play, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';

interface AdminBannersTabProps {
  banners: any[];
  onRefreshBanners: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  triggerConfirm: (config: any) => void;
  logAction: (action: string) => void;
}

export const AdminBannersTab: React.FC<AdminBannersTabProps> = ({
  banners = [],
  onRefreshBanners,
  addToast,
  triggerConfirm,
  logAction
}) => {
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [discountType, setDiscountType] = useState<string>("none");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [page, setPage] = useState<string>("home");

  const [saving, setSaving] = useState(false);
  const [busyBannerId, setBusyBannerId] = useState<string | null>(null);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image.trim() || !description.trim() || !targetLink.trim()) {
      addToast("Image URL, Description, and Target Link are required!", "error");
      return;
    }

    setSaving(true);
    try {
      await adminApi.createBanner({
        image: image.trim(),
        description: description.trim(),
        targetLink: targetLink.trim(),
        discountType: discountType === "none" ? null : discountType,
        discountValue: discountType === "none" ? 0 : Number(discountValue || 0),
        page
      });

      addToast("🎉 Promotional banner created successfully!", "success");
      logAction(`Created new promo banner for ${page} page`);

      // Reset state
      setImage("");
      setDescription("");
      setTargetLink("");
      setDiscountType("none");
      setDiscountValue("");
      setPage("home");

      onRefreshBanners();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to create banner", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBanner = async (bannerId: string, currentStatus: boolean) => {
    setBusyBannerId(bannerId);
    try {
      await adminApi.toggleBanner(bannerId, !currentStatus);
      addToast("🎉 Banner status toggled successfully", "success");
      logAction(`Toggled banner ${bannerId} active status to ${!currentStatus}`);
      onRefreshBanners();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to toggle banner status", "error");
    } finally {
      setBusyBannerId(null);
    }
  };

  const handleDeleteBanner = (banner: any) => {
    triggerConfirm({
      title: "Delete Promotional Banner?",
      message: `Are you sure you want to permanently delete this banner? It will immediately stop showing on the ${banner.page} page.`,
      isDestructive: true,
      confirmText: "Delete Banner",
      onConfirm: async () => {
        try {
          await adminApi.deleteBanner(banner._id);
          addToast("🎉 Banner deleted successfully!", "success");
          logAction(`Deleted banner on ${banner.page}`);
          onRefreshBanners();
        } catch (err: any) {
          console.error(err);
          addToast(err.message || "Failed to delete banner", "error");
        }
      }
    });
  };

  return (
    <div className="coupon-manager-section animate-fade-in">
      <h2>Promotional Banners Manager</h2>
      <p className="admin-helper-note">
        💡 <strong>Banner Control:</strong> Configure and manage promotional hero banners shown across the store's landing page and category headers.
      </p>

      {/* Form Card */}
      <div className="admin-form-card" style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Image size={18} className="text-accent-pink" />
          Create New Hero Banner
        </h3>
        
        <form onSubmit={handleCreateBanner}>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Banner Image URL</label>
              <input 
                type="text" 
                placeholder="https://unsplash.com/photo-..." 
                value={image} 
                onChange={(e) => setImage(e.target.value)}
                style={{ height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Page Placement</label>
              <select 
                value={page} 
                onChange={(e) => setPage(e.target.value)}
                style={{ height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="home">Home Page Hero</option>
                <option value="men">Men's Category</option>
                <option value="women">Women's Category</option>
                <option value="kids">Kids' Category</option>
              </select>
            </div>

            <div className="field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Click Destination Link</label>
              <input 
                type="text" 
                placeholder="/catalog?search=sale or product ID" 
                value={targetLink} 
                onChange={(e) => setTargetLink(e.target.value)}
                style={{ height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Overlay Description</label>
              <input 
                type="text" 
                placeholder="E.g. Up to 50% Off Autumn Jackets" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                style={{ height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Promo Tag (Optional)</label>
              <select 
                value={discountType} 
                onChange={(e) => setDiscountType(e.target.value)}
                style={{ height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="none">No Promo Tag</option>
                <option value="percentage">Percentage Discount (%)</option>
                <option value="flat">Flat Amount Discount (₹)</option>
              </select>
            </div>

            {discountType !== "none" && (
              <div className="field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Promo Value</label>
                <input 
                  type="number" 
                  placeholder={discountType === "percentage" ? "E.g. 20" : "E.g. 500"} 
                  value={discountValue} 
                  onChange={(e) => setDiscountValue(e.target.value)}
                  style={{ height: '40px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="admin-btn-primary" 
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Activate & Publish Banner
          </button>
        </form>
      </div>

      {/* Table Wrapper */}
      <div className="table-wrapper" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Image Preview</th>
              <th>Placement Page</th>
              <th>Overlay Text</th>
              <th>Target Link</th>
              <th>Promo Tag</th>
              <th>Status</th>
              <th style={{ paddingRight: '24px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No banners configured. Add a hero banner above to get started!
                </td>
              </tr>
            ) : (
              banners.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ paddingLeft: '24px', verticalAlign: 'middle' }}>
                    <img 
                      src={b.image} 
                      alt="Banner Preview" 
                      style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700' }}>
                    {b.page}
                  </td>
                  <td style={{ verticalAlign: 'middle', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.description}
                  </td>
                  <td style={{ verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {b.targetLink}
                  </td>
                  <td style={{ verticalAlign: 'middle', fontWeight: '700' }}>
                    {b.discountType ? (
                      <span style={{ color: 'var(--accent-pink)' }}>
                        {b.discountType === "percentage" ? `${b.discountValue}% Off` : `₹${b.discountValue} Off`}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <button
                      onClick={() => handleToggleBanner(b._id, b.isActive)}
                      disabled={busyBannerId === b._id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {busyBannerId === b._id ? (
                        <Loader2 size={20} className="animate-spin text-accent-pink" />
                      ) : b.isActive ? (
                        <ToggleRight size={28} className="text-accent-pink" />
                      ) : (
                        <ToggleLeft size={28} className="text-text-muted" />
                      )}
                    </button>
                  </td>
                  <td style={{ paddingRight: '24px', verticalAlign: 'middle', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteBanner(b)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminBannersTab;
