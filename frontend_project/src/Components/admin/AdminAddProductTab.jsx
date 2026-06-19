import React, { useState } from 'react';
import { FolderPlus, Upload, ShieldAlert, Loader2 } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';
import { compressImageToBase64 } from '../../Utils/adminHelpers';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const AVAILABLE_COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Grey', 'Orange', 'Yellow'];

export const AdminAddProductTab = ({ 
  onProductAdded, 
  addToast,
  logAction
}) => {
  // Form Details
  const [name, setName] = useState("");
  const [category, setCategory] = useState("women");
  const [newPrice, setNewPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  
  // Chip selections
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState(['Black', 'White']);
  
  // Variant Stock counts
  const [colorStocks, setColorStocks] = useState({
    Black: 50, White: 50, Red: 50, Pink: 50, Green: 50, Blue: 50, Orange: 50, Yellow: 50, Grey: 50
  });

  // Image URI (Base64)
  const [image, setImage] = useState(false);

  // States
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Size/Color chip toggle handlers
  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setFieldErrors(prev => ({ ...prev, sizes: null }));
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
    setFieldErrors(prev => ({ ...prev, colors: null }));
  };

  // Image upload
  const handleImageUpload = async (file) => {
    try {
      const base64 = await compressImageToBase64(file);
      setImage(base64);
      setFieldErrors(prev => ({ ...prev, image: null }));
    } catch (err) {
      console.error(err);
      addToast("Failed to process image file. Please try another format.", "error");
    }
  };

  const imageInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Product title is required";
    if (!newPrice || Number(newPrice) <= 0) errors.newPrice = "Promo price must be positive";
    if (!oldPrice || Number(oldPrice) <= 0) errors.oldPrice = "MSRP price must be positive";
    if (Number(newPrice) > Number(oldPrice)) errors.newPrice = "Promo price should not exceed MSRP";
    if (selectedSizes.length === 0) errors.sizes = "Select at least one size";
    if (selectedColors.length === 0) errors.colors = "Select at least one color";
    if (!image) errors.image = "Upload a display image";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!validateForm()) {
      addToast("Please correct the form fields with errors", "error");
      return;
    }

    setSaving(true);
    
    // Synthesize variants payload
    const variants = selectedColors.map(color => ({
      color,
      stock: Number(colorStocks[color] || 0),
      price: Number(newPrice)
    }));

    const payload = {
      name,
      category,
      new_price: Number(newPrice),
      old_price: Number(oldPrice),
      sizes: selectedSizes,
      colors: selectedColors,
      variants,
      stockCount: variants.reduce((sum, v) => sum + v.stock, 0),
      image: image
    };

    try {
      await adminApi.addProduct(payload);
      addToast("🎉 Product successfully launched and added!", "success");
      logAction(`Launched new product: "${name}"`);
      
      // Reset Form State
      setName("");
      setCategory("women");
      setNewPrice("");
      setOldPrice("");
      setSelectedSizes(['S', 'M', 'L', 'XL']);
      setSelectedColors(['Black', 'White']);
      setImage(false);
      
      onProductAdded();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to add product to database", "error");
    } finally {
      setSaving(false);
    }
  };

  const totalCalculatedStock = selectedColors.reduce((sum, c) => sum + (colorStocks[c] || 0), 0);

  return (
    <div className="admin-add-section animate-fade-in">
      <h2>Launch New Product Listing</h2>
      
      <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Product Name */}
        <div className="form-group">
          <label style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Product Title / Descriptive Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: null })); }} 
            placeholder="e.g. Premium Slim Fit Cotton Denim Shirt"
            style={{ border: fieldErrors.name ? '1px solid #ef4444' : '1px solid var(--border-color)' }}
          />
          {fieldErrors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12}/>{fieldErrors.name}</span>}
        </div>

        {/* Target, prices and stock */}
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Audience Target</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="women">Women Fashion</option>
              <option value="men">Men Outfitting</option>
              <option value="kid">Kids Collections</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Promo Price ($)</label>
            <input 
              type="number" 
              value={newPrice} 
              onChange={(e) => { setNewPrice(e.target.value); setFieldErrors(prev => ({ ...prev, newPrice: null })); }} 
              placeholder="e.g. 1499"
              min="1"
              style={{ border: fieldErrors.newPrice ? '1px solid #ef4444' : '1px solid var(--border-color)' }}
            />
            {fieldErrors.newPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12}/>{fieldErrors.newPrice}</span>}
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: '700' }}>MSRP Original ($)</label>
            <input 
              type="number" 
              value={oldPrice} 
              onChange={(e) => { setOldPrice(e.target.value); setFieldErrors(prev => ({ ...prev, oldPrice: null })); }} 
              placeholder="e.g. 2999"
              min="1"
              style={{ border: fieldErrors.oldPrice ? '1px solid #ef4444' : '1px solid var(--border-color)' }}
            />
            {fieldErrors.oldPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12}/>{fieldErrors.oldPrice}</span>}
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Total Inventory (Auto-calc)</label>
            <input 
              type="number" 
              value={totalCalculatedStock} 
              disabled
              placeholder="Auto-calculated"
              style={{ backgroundColor: 'var(--bg-primary)', opacity: 0.8, cursor: 'not-allowed', border: '1px solid var(--border-color)' }}
            />
          </div>
        </div>

        {/* Sizes multiselect */}
        <div className="form-group">
          <label style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Inventory Sizing Available (Select multiple)</label>
          <div className="admin-checkbox-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {AVAILABLE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={`admin-toggle-chip ${selectedSizes.includes(size) ? 'active' : ''}`}
                onClick={() => toggleSize(size)}
                style={{ padding: '8px 16px', borderRadius: 'var(--border-radius-full)', fontWeight: '600' }}
              >
                {size}
              </button>
            ))}
          </div>
          {fieldErrors.sizes && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.sizes}</span>}
        </div>

        {/* Colors multiselect */}
        <div className="form-group">
          <label style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Inventory Colors Available (Select multiple)</label>
          <div className="admin-checkbox-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`admin-toggle-chip ${selectedColors.includes(color) ? 'active' : ''}`}
                onClick={() => toggleColor(color)}
                style={{ padding: '8px 16px', borderRadius: 'var(--border-radius-full)', fontWeight: '600' }}
              >
                {color}
              </button>
            ))}
          </div>
          {fieldErrors.colors && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.colors}</span>}
        </div>

        {/* Variant Stock Fields */}
        {selectedColors.length > 0 && (
          <div className="form-group variant-stocks-form-group" style={{ 
            backgroundColor: 'var(--bg-primary)', 
            padding: '20px', 
            borderRadius: '16px', 
            border: '1px dashed var(--border-color)', 
            marginBottom: '10px' 
          }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Define Variant Stocks per Color Selected
            </label>
            
            <div className="variant-stocks-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '12px' 
            }}>
              {selectedColors.map((color) => (
                <div key={color} className="variant-stock-input-item" style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px', 
                  padding: '12px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ backgroundColor: color.toLowerCase(), border: '1px solid var(--border-color)', display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%' }}></span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{color} Stock:</span>
                  </div>
                  <input 
                    type="number"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    value={colorStocks[color] || 0}
                    onChange={(e) => {
                      setColorStocks({
                        ...colorStocks,
                        [color]: Math.max(0, Number(e.target.value))
                      });
                    }}
                    placeholder="Stock count"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display Image Upload */}
        <div className="form-group">
          <label style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Product Display Image</label>
          <div className="image-upload-wrapper">
            <label className="image-upload-label" style={{ 
              border: fieldErrors.image ? '2px dashed #ef4444' : '2px dashed var(--border-color)', 
              borderRadius: '16px', 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '220px', 
              backgroundColor: 'var(--bg-primary)', 
              cursor: 'default' 
            }}>
              {image ? (
                <div className="image-preview-container" style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={image} alt="Preview" className="image-preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                  <button 
                    type="button" 
                    onClick={() => setImage(false)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                    title="Remove Image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                  <Upload size={32} style={{ color: 'var(--accent-color)' }} />
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Select Product Display Image</p>
                  
                  <div className="upload-options-buttons" style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <button 
                      type="button" 
                      onClick={() => document.getElementById('add-file-input').click()}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      📁 Choose File
                    </button>
                    <button 
                      type="button" 
                      onClick={() => document.getElementById('add-camera-input').click()}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--accent-color)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      📷 Take Photo
                    </button>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PNG, JPG or WEBP formats supported</span>
                </div>
              )}
            </label>
            <input 
              type="file" 
              id="add-file-input" 
              accept="image/*" 
              onChange={imageInputChange} 
              style={{ display: 'none' }}
            />
            <input 
              type="file" 
              id="add-camera-input" 
              accept="image/*" 
              capture="environment"
              onChange={imageInputChange} 
              style={{ display: 'none' }}
            />
          </div>
          {fieldErrors.image && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.image}</span>}
        </div>

        {/* Submit */}
        <button 
          type="submit" 
          className="admin-submit-btn" 
          disabled={saving}
          style={{ 
            marginTop: '10px', 
            height: '48px', 
            borderRadius: 'var(--border-radius-full)', 
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: saving ? 'var(--border-color)' : 'var(--accent-color)',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <FolderPlus size={18} />}
          {saving ? "Publishing listing details..." : "Create & Publish Product Listing"}
        </button>
      </form>
    </div>
  );
};
