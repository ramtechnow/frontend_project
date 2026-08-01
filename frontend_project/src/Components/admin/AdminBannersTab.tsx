import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Image, Loader2, ToggleLeft, ToggleRight, Upload, Edit3, X, Check } from 'lucide-react';
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

  // Edit banner modal state
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editTargetLink, setEditTargetLink] = useState('');
  const [editDiscountType, setEditDiscountType] = useState('none');
  const [editDiscountValue, setEditDiscountValue] = useState('');
  const [editPage, setEditPage] = useState('home');
  const [editImageUrl, setEditImageUrl] = useState('');

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTargetProductId(val);
    setTargetLink(val ? `/product/${val}` : '');
  };

  const compressBannerImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 1400;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WebP)', 'warning');
      return;
    }

    setUploading(true);
    try {
      const base64Data = await compressBannerImage(file);
      if (isEdit) {
        setEditImageUrl(base64Data);
      } else {
        setImageUrl(base64Data);
        setImagePreview(base64Data);
      }
      addToast('🖼️ Banner image uploaded & compressed successfully', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to process image file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const finalImageUrl = imageUrl || imagePreview;
    if (!finalImageUrl) {
      addToast('Please upload a banner image file', 'warning');
      return;
    }
    if (!description.trim()) {
      addToast('Please enter an overlay description text', 'warning');
      return;
    }
    if (!targetLink.trim()) {
      addToast('Please select a destination product or type a link', 'warning');
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

  const openEditModal = (b: any) => {
    setEditingBanner(b);
    setEditDescription(b.description || '');
    setEditTargetLink(b.targetLink || '');
    setEditDiscountType(b.discountType || 'none');
    setEditDiscountValue(b.discountValue ? String(b.discountValue) : '');
    setEditPage(b.page || 'home');
    setEditImageUrl(b.image || '');
  };

  const handleSaveEditedBanner = async () => {
    if (!editingBanner) return;
    setSaving(true);
    try {
      await adminApi.updateBanner(editingBanner._id, {
        image: editImageUrl,
        description: editDescription,
        targetLink: editTargetLink,
        discountType: editDiscountType === 'none' ? null : editDiscountType,
        discountValue: editDiscountType === 'none' ? 0 : Number(editDiscountValue || 0),
        page: editPage
      });

      addToast('🎉 Banner updated successfully!', 'success');
      logAction(`Updated hero banner #${editingBanner._id}`);
      setEditingBanner(null);
      onRefreshBanners();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to update banner', 'error');
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
        💡 <strong>Banner Control:</strong> Create and edit hero banners, update overlay descriptions, target links, and promotional offer tags.
      </p>

      {/* Create Form Card */}
      <div className="admin-form-card" style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Image size={18} className="text-accent-pink" />
          Create New Hero Banner
        </h3>

        <form onSubmit={handleCreateBanner}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Banner Image <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
            <div 
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, false)}
                style={{ display: 'none' }}
              />

              {uploading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 0' }}>
                  <Loader2 size={20} className="animate-spin text-accent-pink" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Processing image file…</span>
                </div>
              ) : (imageUrl || imagePreview) ? (
                <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxHeight: '200px' }}>
                  <img
                    src={imageUrl || imagePreview}
                    alt="Banner preview"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
                  <Upload size={28} style={{ color: 'var(--accent-pink)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Click to upload banner image</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>High resolution widescreen (1400px recommended)</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Click Destination Product <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
              <select value={targetProductId} onChange={handleProductSelect} style={selectStyle} disabled={loadingProducts}>
                <option value="">{loadingProducts ? 'Loading products…' : '— Select a product —'}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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
              <label style={labelStyle}>Promotional Offer Tag</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={selectStyle}>
                <option value="none">No Promotional Offer</option>
                <option value="percentage">Percentage Discount (%)</option>
                <option value="flat">Flat Amount Discount (₹)</option>
              </select>
            </div>

            {discountType !== 'none' && (
              <div style={fieldStyle}>
                <label style={labelStyle}>Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}</label>
                <input
                  type="number"
                  placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 300'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--accent-pink)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Publish Banner
          </button>
        </form>
      </div>

      {/* Banners Listing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {banners.map((b) => (
          <div key={b._id} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ position: 'relative', height: '140px' }}>
              <img src={b.image} alt={b.description} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{
                position: 'absolute', top: 8, left: 8,
                backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff',
                padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase'
              }}>
                {b.page} Page
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>{b.description}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destination: {b.targetLink}</span>

              {b.discountType && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-pink)', fontWeight: '700' }}>
                  Offer: {b.discountType === 'percentage' ? `${b.discountValue}% OFF` : `₹${b.discountValue} OFF`}
                </span>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => handleToggleBanner(b._id, b.isActive)}
                  disabled={busyBannerId === b._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none',
                    color: b.isActive ? '#10b981' : 'var(--text-muted)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer'
                  }}
                >
                  {b.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  {b.isActive ? 'Active' : 'Disabled'}
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Edit Hero Banner</h3>
              <button onClick={() => setEditingBanner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18}/></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Banner Image</label>
                <img src={editImageUrl} alt="Edit preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  Change Image File
                </button>
                <input ref={editFileInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e, true)} style={{ display: 'none' }} />
              </div>

              <div>
                <label style={labelStyle}>Overlay Description</label>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Target Link</label>
                <input type="text" value={editTargetLink} onChange={(e) => setEditTargetLink(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Page Placement</label>
                <select value={editPage} onChange={(e) => setEditPage(e.target.value)} style={selectStyle}>
                  <option value="home">Home Page Hero</option>
                  <option value="men">Men's Category</option>
                  <option value="women">Women's Category</option>
                  <option value="kids">Kids' Category</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Promotional Offer Tag</label>
                <select value={editDiscountType} onChange={(e) => setEditDiscountType(e.target.value)} style={selectStyle}>
                  <option value="none">No Promotional Offer</option>
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="flat">Flat Amount Discount (₹)</option>
                </select>
              </div>

              {editDiscountType !== 'none' && (
                <div>
                  <label style={labelStyle}>Discount Value {editDiscountType === 'percentage' ? '(%)' : '(₹)'}</label>
                  <input type="number" value={editDiscountValue} onChange={(e) => setEditDiscountValue(e.target.value)} style={inputStyle} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedBanner}
                  disabled={saving}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--accent-pink)', color: '#fff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>} Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
