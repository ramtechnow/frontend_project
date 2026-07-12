import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Image, Loader2, Play, ToggleLeft, ToggleRight, Upload, X } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';
import { BACKEND_URL } from '../../config';

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
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const [description, setDescription] = useState('');
  const [targetLink, setTargetLink] = useState('');
  const [targetProductId, setTargetProductId] = useState('');
  const [discountType, setDiscountType] = useState<string>('none');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [page, setPage] = useState<string>('home');

  const [saving, setSaving] = useState(false);
  const [busyBannerId, setBusyBannerId] = useState<string | null>(null);

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load product list for the destination dropdown
  useEffect(() => {
    setLoadingProducts(true);
    fetch(`${BACKEND_URL}/allproducts`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list.map((p: any) => ({ id: String(p.id), name: p.name })));
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  // When a product is selected from dropdown, set the targetLink
  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTargetProductId(val);
    setTargetLink(val ? `/product/${val}` : '');
  };

  // Compress banner image to Base64 (max 1400px for high-res banner displays)
  const compressBannerImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 1400; // Optimal width for widescreen banners
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // 0.75 JPEG compression for optimal sharpness & storage size
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Handle file selection — show preview and process immediately
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64Data = await compressBannerImage(file);
      setImagePreview(base64Data);
      setImageUrl(base64Data);
      addToast('✅ Image processed successfully (Base64)', 'success');
    } catch (err) {
      console.error(err);
      addToast('❌ Image processing failed. Please try another file.', 'error');
      setImagePreview('');
      setImageUrl('');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalImageUrl = imageUrl.trim();
    if (!finalImageUrl) {
      addToast('Please upload a banner image first!', 'error');
      return;
    }
    if (!description.trim()) {
      addToast('Overlay description is required!', 'error');
      return;
    }
    if (!targetLink.trim()) {
      addToast('Please select a product destination!', 'error');
      return;
    }
    if (uploading) {
      addToast('Please wait for the image to finish uploading.', 'warning');
      return;
    }

    setSaving(true);
    try {
      await adminApi.createBanner({
        image: finalImageUrl,
        description: description.trim(),
        targetLink: targetLink.trim(),
        discountType: discountType === 'none' ? null : discountType,
        discountValue: discountType === 'none' ? 0 : Number(discountValue || 0),
        page
      });

      addToast('🎉 Promotional banner published successfully!', 'success');
      logAction(`Created new promo banner for ${page} page`);

      // Reset state
      clearImage();
      setDescription('');
      setTargetLink('');
      setTargetProductId('');
      setDiscountType('none');
      setDiscountValue('');
      setPage('home');

      onRefreshBanners();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to create banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBanner = async (bannerId: string, currentStatus: boolean) => {
    setBusyBannerId(bannerId);
    try {
      await adminApi.toggleBanner(bannerId, !currentStatus);
      addToast('🎉 Banner status updated', 'success');
      logAction(`Toggled banner ${bannerId} active status to ${!currentStatus}`);
      onRefreshBanners();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to toggle banner status', 'error');
    } finally {
      setBusyBannerId(null);
    }
  };

  const handleDeleteBanner = (banner: any) => {
    triggerConfirm({
      title: 'Delete Promotional Banner?',
      message: `Are you sure you want to permanently delete this banner? It will immediately stop showing on the ${banner.page} page.`,
      isDestructive: true,
      confirmText: 'Delete Banner',
      onConfirm: async () => {
        try {
          await adminApi.deleteBanner(banner._id);
          addToast('🎉 Banner deleted successfully!', 'success');
          logAction(`Deleted banner on ${banner.page}`);
          onRefreshBanners();
        } catch (err: any) {
          console.error(err);
          addToast(err.message || 'Failed to delete banner', 'error');
        }
      }
    });
  };

  const inputStyle: React.CSSProperties = {
    height: '40px',
    padding: '0 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    width: '100%',
    boxSizing: 'border-box'
  };

  const selectStyle: React.CSSProperties = { ...inputStyle };
  const labelStyle: React.CSSProperties = { fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' };
  const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px' };

  return (
    <div className="coupon-manager-section animate-fade-in">
      <h2>Promotional Banners Manager</h2>
      <p className="admin-helper-note">
        💡 <strong>Banner Control:</strong> Upload an image, pick a product destination and publish. Banners are compressed and stored directly in the database (Base64) so they remain saved permanently, even if the Render server restarts or sleeps.
      </p>

      {/* Form Card */}
      <div className="admin-form-card" style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Image size={18} className="text-accent-pink" />
          Create New Hero Banner
        </h3>

        <form onSubmit={handleCreateBanner}>
          {/* ── Row 1: Image Upload ── */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Banner Image <span style={{ color: 'var(--accent-pink)' }}>*</span></label>

            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '6px' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '260px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'block' }}
                />
                {uploading && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', gap: '6px'
                  }}>
                    <Loader2 size={16} className="animate-spin" /> Uploading…
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={clearImage}
                    style={{
                      position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px',
                      borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                )}
                {!uploading && imageUrl && (
                  <span style={{ display: 'block', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    ✅ Saved to backend
                  </span>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  marginTop: '6px', width: '260px', height: '120px', border: '2px dashed var(--border-color)',
                  borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', gap: '8px', color: 'var(--text-secondary)',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-pink)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                <Upload size={24} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Click to upload image</span>
                <span style={{ fontSize: '0.72rem' }}>PNG, JPG, WEBP</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* ── Row 2: Destination Product + Page Placement ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Click Destination — Product <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
              <select
                value={targetProductId}
                onChange={handleProductSelect}
                style={selectStyle}
                disabled={loadingProducts}
              >
                <option value="">{loadingProducts ? 'Loading products…' : '— Select a product —'}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {targetLink && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Link: {targetLink}
                </span>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Page Placement</label>
              <select value={page} onChange={(e) => setPage(e.target.value)} style={selectStyle}>
                <option value="home">Home Page Hero</option>
                <option value="men">Men's Category</option>
                <option value="women">Women's Category</option>
                <option value="kids">Kids' Category</option>
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Overlay Description <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
              <input
                type="text"
                placeholder="E.g. Up to 50% Off Autumn Jackets"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Promo Tag (Optional)</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={selectStyle}>
                <option value="none">No Promo Tag</option>
                <option value="percentage">Percentage Discount (%)</option>
                <option value="flat">Flat Amount Discount (₹)</option>
              </select>
            </div>

            {discountType !== 'none' && (
              <div style={fieldStyle}>
                <label style={labelStyle}>Promo Value</label>
                <input
                  type="number"
                  placeholder={discountType === 'percentage' ? 'E.g. 20' : 'E.g. 500'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="admin-btn-primary"
            disabled={saving || uploading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: (saving || uploading) ? 'not-allowed' : 'pointer', opacity: (saving || uploading) ? 0.7 : 1 }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {saving ? 'Publishing…' : 'Activate & Publish Banner'}
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
              <th>Destination</th>
              <th>Promo Tag</th>
              <th>Status</th>
              <th style={{ paddingRight: '24px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No banners configured. Upload a hero banner above to get started!
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
                  <td style={{ verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.targetLink}
                  </td>
                  <td style={{ verticalAlign: 'middle', fontWeight: '700' }}>
                    {b.discountType ? (
                      <span style={{ color: 'var(--accent-pink)' }}>
                        {b.discountType === 'percentage' ? `${b.discountValue}% Off` : `₹${b.discountValue} Off`}
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
