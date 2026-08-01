import React, { useState, useMemo, DragEvent, ChangeEvent } from 'react';
import { FolderPlus, Upload, ShieldAlert, Loader2, Trash2, Plus, Palette } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';
import { compressImageToBase64 } from '../../Utils/adminHelpers';
import { ProductVariant } from '../../features/catalog/types/productTypes';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRESET_COLORS = ['Black', 'White', 'Navy Blue', 'Beige', 'Charcoal', 'Red', 'Blue', 'Green', 'Pink', 'Sandal', 'Maroon', 'Olive'];

interface AdminAddProductTabProps {
  onProductAdded: () => void;
  addToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  logAction: (message: string) => void;
}

export const AdminAddProductTab: React.FC<AdminAddProductTabProps> = ({
  onProductAdded,
  addToast,
  logAction
}) => {
  // Form Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("women");
  const [newPrice, setNewPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  
  // Chip selections
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Black', 'White']);
  const [customColorInput, setCustomColorInput] = useState("");
  const [customHexColor, setCustomHexColor] = useState("#b80035");

  // Drag & drop multiple images (base64 string array)
  const [images, setImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  // States
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  // Manual overrides for variants (price & stock per size/color)
  const [manualVariants, setManualVariants] = useState<Partial<ProductVariant>[]>([]);

  // Size/Color chip toggle handlers
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setFieldErrors(prev => ({ ...prev, sizes: null }));
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
    setFieldErrors(prev => ({ ...prev, colors: null }));
  };

  const handleAddCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!selectedColors.includes(formatted)) {
      setSelectedColors(prev => [...prev, formatted]);
      addToast(`Added custom color "${formatted}"`, "success");
    }
    setCustomColorInput("");
  };

  // Drag handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Helper to process files
  const processFiles = async (files: FileList) => {
    const loadedImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await compressImageToBase64(files[i]) as string;
        loadedImages.push(base64);
      } catch (err) {
        console.error("Compression failed:", err);
      }
    }

    if (loadedImages.length > 0) {
      if (replaceIndex !== null) {
        setImages(prev => {
          const updated = [...prev];
          updated[replaceIndex] = loadedImages[0];
          return updated;
        });
        setReplaceIndex(null);
        addToast("Image replaced successfully!", "success");
      } else {
        setImages(prev => [...prev, ...loadedImages]);
      }
      setFieldErrors(prev => ({ ...prev, images: null }));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
    addToast("Image removed from uploader", "info");
  };

  // 1. Reactive Variant Builder: computes options based on colors and sizes selected
  const generatedVariants = useMemo(() => {
    const list: ProductVariant[] = [];
    const baseSlugName = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .substring(0, 15) || "ITEM";

    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        const skuPattern = `RC-${category.substring(0, 3).toUpperCase()}-${baseSlugName}-${color.toUpperCase()}-${size}`;
        
        // Lookup manual overrides to preserve user inputs
        const override = manualVariants.find(v => v.color === color && v.size === size);

        list.push({
          sku: override?.sku || skuPattern,
          color,
          size,
          stock: override?.stock !== undefined ? override.stock : 10,
          price: override?.price !== undefined ? override.price : Number(newPrice) || 0
        });
      });
    });
    return list;
  }, [selectedColors, selectedSizes, name, category, newPrice, manualVariants]);

  const totalCalculatedStock = useMemo(() => {
    return generatedVariants.reduce((sum, v) => sum + v.stock, 0);
  }, [generatedVariants]);

  const updateVariantField = (color: string, size: string, field: keyof ProductVariant, value: any) => {
    setManualVariants(prev => {
      const idx = prev.findIndex(v => v.color === color && v.size === size);
      const updated = [...prev];
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], [field]: value };
      } else {
        const currentGenerated = generatedVariants.find(v => v.color === color && v.size === size);
        updated.push({
          color,
          size,
          sku: currentGenerated?.sku || "",
          stock: currentGenerated?.stock || 10,
          price: currentGenerated?.price || Number(newPrice) || 0,
          [field]: value
        });
      }
      return updated;
    });
  };

  // Validation
  const validateForm = () => {
    const errors: Record<string, string | null> = {};
    if (!name.trim()) errors.name = "Product title is required";
    if (!description.trim()) errors.description = "Product description is required";
    if (!newPrice || Number(newPrice) <= 0) errors.newPrice = "Promo price must be positive";
    if (!oldPrice || Number(oldPrice) <= 0) errors.oldPrice = "MSRP price must be positive";
    if (Number(newPrice) > Number(oldPrice)) errors.newPrice = "Promo price should not exceed MSRP";
    if (selectedSizes.length === 0) errors.sizes = "Select at least one size";
    if (selectedColors.length === 0) errors.colors = "Select at least one color";
    if (images.length === 0) errors.images = "Upload at least one product image";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!validateForm()) {
      addToast("Please correct the form fields with errors", "error");
      return;
    }

    setSaving(true);
    
    // Primary display image is index 0; remaining are sub-images
    const primaryImage = images[0];
    const payload = {
      name,
      description,
      category,
      newPrice: Number(newPrice),
      oldPrice: Number(oldPrice),
      sizes: selectedSizes,
      colors: selectedColors,
      variants: generatedVariants,
      stockCount: totalCalculatedStock,
      image: primaryImage,
      images: images,
      available: true
    };

    try {
      await adminApi.addProduct(payload);
      addToast(`🎉 Added product "${name}" with ${generatedVariants.length} variants!`, "success");
      logAction(`Launched new product: "${name}" with ${generatedVariants.length} variants`);
      onProductAdded();
    } catch (err: any) {
      console.error("Error creating product:", err);
      addToast(err.message || "Failed to create product listing.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-add-product-container animate-fade-in" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-pink)' }}>
          <FolderPlus size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Launch New Product Listing</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Publish catalog items with custom per-size pricing, color picker and stock counts.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Title */}
        <div className="form-group">
          <label style={{ fontWeight: '700' }}>Product Title *</label>
          <input 
            type="text" 
            placeholder="e.g. Premium Slim Fit Cotton Denim Shirt" 
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors(prev => ({ ...prev, name: null }));
            }}
            style={{ border: fieldErrors.name ? '1px solid #ef4444' : '1px solid var(--border-color)' }}
          />
          {fieldErrors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12}/>{fieldErrors.name}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label style={{ fontWeight: '700' }}>Detailed Description *</label>
          <textarea 
            rows={4} 
            placeholder="Write a brief overview of materials, sizing fits, design details..." 
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setFieldErrors(prev => ({ ...prev, description: null }));
            }}
            style={{ 
              border: fieldErrors.description ? '1px solid #ef4444' : '1px solid var(--border-color)',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          />
          {fieldErrors.description && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12}/>{fieldErrors.description}</span>}
        </div>

        {/* Category & Prices */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label style={{ fontWeight: '700' }}>Catalog Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="women">Womens Apparel</option>
              <option value="men">Mens Collection</option>
              <option value="kid">Kids Wear</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700' }}>Base Price (₹) *</label>
            <input 
              type="number" 
              placeholder="e.g. 599" 
              value={newPrice}
              onChange={(e) => {
                setNewPrice(e.target.value);
                setFieldErrors(prev => ({ ...prev, newPrice: null }));
              }}
              style={{ border: fieldErrors.newPrice ? '1px solid #ef4444' : '1px solid var(--border-color)' }}
            />
            {fieldErrors.newPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12}/>{fieldErrors.newPrice}</span>}
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700' }}>MSRP / Strike Price (₹) *</label>
            <input 
              type="number" 
              placeholder="e.g. 1199" 
              value={oldPrice}
              onChange={(e) => {
                setOldPrice(e.target.value);
                setFieldErrors(prev => ({ ...prev, oldPrice: null }));
              }}
              style={{ border: fieldErrors.oldPrice ? '1px solid #ef4444' : '1px solid var(--border-color)' }}
            />
            {fieldErrors.oldPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12}/>{fieldErrors.oldPrice}</span>}
          </div>
        </div>

        {/* Sizes multiselect */}
        <div className="form-group">
          <label style={{ fontWeight: '700' }}>Sizes Available</label>
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

        {/* Colors selector + Custom Color Adder & Color Picker */}
        <div className="form-group">
          <label style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={16} /> Inventory Colors (Select preset or add custom color)
          </label>
          <div className="admin-checkbox-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {Array.from(new Set([...PRESET_COLORS, ...selectedColors])).map((color) => (
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

          {/* Add custom color input box + Hex Color Picker */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', maxWidth: '420px' }}>
            <input
              type="color"
              value={customHexColor}
              onChange={(e) => setCustomHexColor(e.target.value)}
              style={{ width: 38, height: 38, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
              title="Pick Hex Color"
            />
            <input
              type="text"
              placeholder="Type custom color name (e.g. Sandal, Maroon, Navy Blue)"
              value={customColorInput}
              onChange={(e) => setCustomColorInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomColor(); } }}
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
            <button
              type="button"
              onClick={handleAddCustomColor}
              style={{ padding: '8px 16px', backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={14} /> Add Color
            </button>
          </div>
          {fieldErrors.colors && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.colors}</span>}
        </div>

        {/* Drag-and-Drop Image Uploader */}
        <div className="form-group">
          <label style={{ fontWeight: '700' }}>Product Image Showcase (Drop multiple files)</label>
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              border: fieldErrors.images ? '2px dashed #ef4444' : dragActive ? '2px dashed var(--accent-pink)' : '2px dashed var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: dragActive ? 'rgba(235, 104, 150, 0.05)' : 'var(--bg-primary)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('add-multiple-file-input')?.click()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <Upload size={32} style={{ color: 'var(--accent-pink)' }} />
              <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>
                Drag & Drop product images here, or <span style={{ color: 'var(--accent-pink)' }}>browse files</span>
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload 1 or more images. First image is set as primary.</span>
            </div>
            <input 
              id="add-multiple-file-input" 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleFileInput} 
              style={{ display: 'none' }} 
            />
          </div>
          {fieldErrors.images && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.images}</span>}

          {/* Upload previews */}
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: idx === 0 ? '2px solid var(--accent-pink)' : '1px solid var(--border-color)' }}>
                  <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {idx === 0 && (
                    <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'var(--accent-pink)', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                      Primary
                    </span>
                  )}
                  <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteImage(idx); }}
                      style={{ padding: '4px', borderRadius: '50%', backgroundColor: '#ef4444', border: 'none', cursor: 'pointer', color: 'white' }}
                      title="Delete Image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic SKU & Per-Size Pricing / Stock Matrix Table */}
        {generatedVariants.length > 0 && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Variant Catalog & Per-Size Pricing Matrix</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Set custom prices (e.g. S: ₹499, M: ₹549) and exact stock quantities per size.
                </p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-pink)' }}>
                Total Stock: {totalCalculatedStock} units
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 8px', fontWeight: '700' }}>Variant Details</th>
                    <th style={{ padding: '12px 8px', fontWeight: '700' }}>SKU Code</th>
                    <th style={{ padding: '12px 8px', fontWeight: '700' }}>Stock Units</th>
                    <th style={{ padding: '12px 8px', fontWeight: '700' }}>Price per Size (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedVariants.map((v, idx) => (
                    <tr key={`${v.color}_${v.size}_${idx}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            backgroundColor: v.color.toLowerCase(),
                            border: '1px solid var(--border-color)',
                            width: '12px', height: '12px',
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} />
                          <span style={{ fontWeight: '700' }}>{v.color} / {v.size}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <input 
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariantField(v.color, v.size, "sku", e.target.value.toUpperCase())}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            width: '100%',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', width: '120px' }}>
                        <input 
                          type="number"
                          value={v.stock}
                          min="0"
                          onChange={(e) => updateVariantField(v.color, v.size, "stock", Math.max(0, Number(e.target.value)))}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            width: '100%',
                            fontSize: '0.8rem'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', width: '140px' }}>
                        <input 
                          type="number"
                          value={v.price}
                          min="0"
                          onChange={(e) => updateVariantField(v.color, v.size, "price", Math.max(0, Number(e.target.value)))}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            width: '100%',
                            fontSize: '0.8rem',
                            fontWeight: '700'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '14px 28px',
            backgroundColor: 'var(--accent-pink)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '800',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(184, 0, 53, 0.3)',
            marginTop: '12px'
          }}
        >
          {saving ? <Loader2 size={18} className="spin" /> : <FolderPlus size={18} />}
          {saving ? "Publishing Listing..." : "Publish Product Listing"}
        </button>
      </form>
    </div>
  );
};
