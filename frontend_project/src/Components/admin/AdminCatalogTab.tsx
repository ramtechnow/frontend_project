import React, { useState, useMemo, ChangeEvent } from 'react';
import { Pencil, Trash2, Save, X, Search, Filter, Loader2, Plus } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';
import { compressImageToBase64, normalizeCategory } from '../../Utils/adminHelpers';
import { Product, ProductVariant } from '../../features/catalog/types/productTypes';

interface AdminCatalogTabProps {
  products: Product[];
  onRefreshProducts: () => void;
  addToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  triggerConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => void;
  logAction: (message: string) => void;
}

interface EditFormState {
  id: string;
  name: string;
  category: string;
  newPrice: number;
  oldPrice: number;
  variants: ProductVariant[];
  image: string;
  images: string[];
}

export const AdminCatalogTab: React.FC<AdminCatalogTabProps> = ({
  products = [],
  onRefreshProducts,
  addToast,
  triggerConfirm,
  logAction
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Editing Product Inline State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  // Loaders
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [busyStockKeys, setBusyStockKeys] = useState<Record<string, boolean>>({});

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const nameMatch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let catMatch = true;
      if (categoryFilter !== 'all') {
        const prodCat = prod.category?.toLowerCase() || '';
        const filterCat = categoryFilter.toLowerCase();
        
        if (filterCat === 'kids') {
          catMatch = prodCat === 'kid' || prodCat === 'kids';
        } else {
          catMatch = prodCat === filterCat;
        }
      }
      
      return nameMatch && catMatch;
    });
  }, [products, searchQuery, categoryFilter]);

  // Edit Handlers
  const startEditing = (prod: Product) => {
    setEditingProductId(prod.id);
    
    // Synthesize variants locally if they don't exist yet to make sure editing works
    let initialVariants: ProductVariant[] = prod.variants ? JSON.parse(JSON.stringify(prod.variants)) : [];
    if (initialVariants.length === 0) {
      const colors = prod.colors && prod.colors.length > 0 ? prod.colors : ['Black', 'White'];
      const sizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L'];
      const totalStock = prod.stockCount !== undefined ? prod.stockCount : 100;
      const stockPerVariant = Math.floor(totalStock / (colors.length * sizes.length || 1));
      
      colors.forEach((c) => {
        sizes.forEach((s) => {
          initialVariants.push({
            sku: `RC-${prod.category?.toUpperCase() || "CAT"}-${prod.name.toUpperCase().substring(0, 8).replace(/\s/g, '-')}-${c.toUpperCase()}-${s}`,
            size: s,
            color: c,
            stock: stockPerVariant,
            price: prod.newPrice || 0
          });
        });
      });
    }

    setEditForm({
      id: prod.id,
      name: prod.name,
      category: prod.category || "women",
      newPrice: prod.newPrice,
      oldPrice: prod.oldPrice || prod.newPrice * 1.5,
      variants: initialVariants,
      image: prod.image || "",
      images: prod.images || (prod.image ? [prod.image] : [])
    });
  };

  const handleVariantFieldChange = (idx: number, field: keyof ProductVariant, value: any) => {
    if (!editForm) return;
    const updatedVariants = [...editForm.variants];
    updatedVariants[idx] = { ...updatedVariants[idx], [field]: value };
    setEditForm({ ...editForm, variants: updatedVariants });
  };

  const handleAddImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!editForm || !e.target.files) return;
    const files = e.target.files;
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
        const updated = [...editForm.images];
        updated[replaceIndex] = loadedImages[0];
        setEditForm({
          ...editForm,
          images: updated,
          image: replaceIndex === 0 ? loadedImages[0] : editForm.image
        });
        setReplaceIndex(null);
        addToast("Image replaced successfully!", "success");
      } else {
        setEditForm({
          ...editForm,
          images: [...editForm.images, ...loadedImages],
          image: editForm.image || loadedImages[0]
        });
        addToast("Image added successfully!", "success");
      }
    }
  };

  const handleReplaceClick = (idx: number) => {
    setReplaceIndex(idx);
    document.getElementById(`edit-image-input-file-${editForm?.id}`)?.click();
  };

  const handleDeleteImage = (idx: number) => {
    if (!editForm) return;
    const updated = editForm.images.filter((_, index) => index !== idx);
    setEditForm({
      ...editForm,
      images: updated,
      image: idx === 0 ? (updated[0] || "") : editForm.image
    });
    addToast("Image removed", "info");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editForm) return;
    if (!editForm.name.trim()) {
      addToast("Product title cannot be empty", "error");
      return;
    }
    if (Number(editForm.newPrice) <= 0) {
      addToast("Price must be greater than 0", "error");
      return;
    }

    setSavingProductId(id);
    const calculatedStock = editForm.variants.reduce((sum, v) => sum + v.stock, 0);

    const payload = {
      id: editForm.id,
      name: editForm.name,
      category: editForm.category,
      newPrice: Number(editForm.newPrice),
      oldPrice: Number(editForm.oldPrice),
      variants: editForm.variants,
      stockCount: calculatedStock,
      image: editForm.images[0] || "",
      images: editForm.images
    };

    try {
      await adminApi.updateProduct(payload);
      addToast("🎉 Product successfully updated!", "success");
      logAction(`Updated product specifications: "${editForm.name}"`);
      setEditingProductId(null);
      onRefreshProducts();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to update product details", "error");
    } finally {
      setSavingProductId(null);
    }
  };

  const handleDeleteProduct = (prod: Product) => {
    triggerConfirm({
      title: "Delete Product Listing?",
      message: `Are you sure you want to permanently remove "${prod.name}" from the store catalog? This action cannot be undone.`,
      isDestructive: true,
      confirmText: "Delete Product",
      onConfirm: async () => {
        try {
          await adminApi.removeProduct(prod.id);
          addToast("🎉 Product deleted successfully!", "success");
          logAction(`Deleted product from catalog: "${prod.name}"`);
          onRefreshProducts();
        } catch (err: any) {
          console.error(err);
          addToast(err.message || "Failed to delete product", "error");
        }
      }
    });
  };

  const handleVariantStockAdjust = async (id: string, colorName: string, change: number) => {
    const key = `${id}-${colorName}`;
    if (busyStockKeys[key]) return;

    setBusyStockKeys(prev => ({ ...prev, [key]: true }));
    try {
      await adminApi.updateVariantStock(id, colorName, change);
      addToast(`Adjusted ${colorName} stock count`, "success");
      onRefreshProducts();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to adjust stock", "error");
    } finally {
      setBusyStockKeys(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="admin-list-section animate-fade-in" style={{ color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Product Catalog Audit</h2>
        
        {/* INTERACTIVE CONTROLS BAR */}
        <div className="audit-controls" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="audit-search-input" 
              placeholder="Search catalog titles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px', borderRadius: '40px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            />
          </div>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <select 
              className="audit-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px', borderRadius: '40px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <option value="all">All Categories</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Product</th>
              <th>Title & Parameters</th>
              <th>Category</th>
              <th>Stock Control (Inline)</th>
              <th>New Price</th>
              <th>Old Price</th>
              <th style={{ paddingRight: '24px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((prod) => {
              const isEditing = editingProductId === prod.id;
              const isSaving = savingProductId === prod.id;

              return (
                <tr key={prod.id} className={isEditing ? "row-editing" : ""} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--border-color)' }}>
                  {/* Thumbnail Image / Multi-Image Manager in Edit Mode */}
                  <td style={{ paddingLeft: '24px', verticalAlign: 'middle' }}>
                    {isEditing && editForm ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
                        {/* Horizontal Image strip */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {editForm.images.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '38px', height: '46px', borderRadius: '4px', overflow: 'hidden', border: idx === 0 ? '1.5px solid var(--accent-pink)' : '1px solid var(--border-color)' }}>
                              <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{
                                position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: 0, transition: 'opacity 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                              >
                                <button type="button" onClick={() => handleReplaceClick(idx)} style={{ border: 'none', background: 'white', borderRadius: '50%', padding: '2px', cursor: 'pointer', color: '#111' }}>
                                  <Pencil size={8} />
                                </button>
                                <button type="button" onClick={() => handleDeleteImage(idx)} style={{ border: 'none', background: '#ef4444', borderRadius: '50%', padding: '2px', cursor: 'pointer', color: 'white' }}>
                                  <Trash2 size={8} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button 
                            type="button"
                            onClick={() => { setReplaceIndex(null); document.getElementById(`edit-image-input-file-${prod.id}`)?.click(); }}
                            style={{ width: '38px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none', color: 'var(--text-muted)' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <input 
                          type="file" 
                          id={`edit-image-input-file-${prod.id}`}
                          accept="image/*" 
                          multiple={replaceIndex === null}
                          onChange={handleAddImage}
                          style={{ display: 'none' }}
                        />
                      </div>
                    ) : (
                      <img 
                        src={prod.image || "https://placehold.co/100x120?text=Product"} 
                        alt={prod.name} 
                        className="admin-prod-thumb" 
                        style={{ width: '50px', height: '58px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                      />
                    )}
                  </td>
                  
                  {/* Name and Attributes */}
                  <td className="prod-title-cell" style={{ verticalAlign: 'middle' }}>
                    {isEditing && editForm ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                          type="text" 
                          value={editForm.name} 
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          style={{ padding: '8px 12px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>📏 Size: <strong>{prod.sizes.join(', ')}</strong></span>
                          <span>🎨 Colors: <strong>{prod.colors.join(', ')}</strong></span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="prod-name-bold" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{prod.name}</span>
                        <div className="prod-params-meta" style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>📏 Sizing: <strong>{prod.sizes?.join(', ') || 'N/A'}</strong></span>
                          <span>🎨 Colors: <strong>{prod.colors?.join(', ') || 'N/A'}</strong></span>
                        </div>
                      </>
                    )}
                  </td>
                  
                  {/* Category Tag */}
                  <td style={{ verticalAlign: 'middle' }}>
                    {isEditing && editForm ? (
                      <select 
                        value={editForm.category} 
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        style={{ height: '36px', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                        <option value="kid">Kids</option>
                      </select>
                    ) : (
                      <span className={`cat-tag ${prod.category?.toLowerCase() || 'kid'}`} style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 'var(--border-radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {normalizeCategory(prod.category)}
                      </span>
                    )}
                  </td>
                  
                  {/* Inline Variant Stock & SKU Editors */}
                  <td style={{ verticalAlign: 'middle' }}>
                    {isEditing && editForm ? (
                      <div className="inline-variant-edit-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px', minWidth: '350px' }}>
                        {editForm.variants.map((v, idx) => (
                          <div key={idx} className="inline-variant-edit-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                            <span style={{ backgroundColor: v.color.toLowerCase(), border: '1px solid var(--border-color)', width: '10px', height: '10px', borderRadius: '50%' }}></span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', minWidth: '45px' }}>{v.color}/{v.size}</span>
                            
                            <input 
                              type="text" 
                              value={v.sku || ""}
                              placeholder="SKU"
                              onChange={(e) => handleVariantFieldChange(idx, "sku", e.target.value.toUpperCase())}
                              style={{ flexGrow: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontFamily: 'monospace', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            />
                            
                            <input 
                              type="number" 
                              value={v.stock}
                              onChange={(e) => handleVariantFieldChange(idx, "stock", Math.max(0, Number(e.target.value)))}
                              min="0"
                              style={{ width: '55px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                              placeholder="Stock"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="variant-auditor-panel" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(prod.variants || []).slice(0, 3).map((v, vidx) => {
                          const stockKey = `${prod.id}-${v.color}`;
                          const isBusy = busyStockKeys[stockKey];

                          return (
                            <div key={vidx} className="variant-auditor-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ backgroundColor: v.color.toLowerCase(), border: '1px solid var(--border-color)', width: '10px', height: '10px', borderRadius: '50%' }}></span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '50px' }}>{v.color}/{v.size}:</span>
                              
                              <div className="inline-stock-control-panel mini" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button 
                                  type="button"
                                  className="adjust-stock-btn dec mini" 
                                  onClick={() => handleVariantStockAdjust(prod.id, v.color, -5)}
                                  disabled={isBusy}
                                  style={{ opacity: isBusy ? 0.5 : 1, width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                >
                                  -
                                </button>
                                <span className={`stock-count-badge mini ${Number(v.stock) > 0 ? 'in' : 'out'}`} style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  minWidth: '24px',
                                  textAlign: 'center'
                                }}>
                                  {v.stock}
                                </span>
                                <button 
                                  type="button"
                                  className="adjust-stock-btn inc mini" 
                                  onClick={() => handleVariantStockAdjust(prod.id, v.color, 5)}
                                  disabled={isBusy}
                                  style={{ opacity: isBusy ? 0.5 : 1, width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {prod.variants && prod.variants.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+ {prod.variants.length - 3} more variants</span>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                          Total Stock: <strong>{prod.stockCount} units</strong>
                        </div>
                      </div>
                    )}
                  </td>
                  
                  {/* New Price */}
                  <td className="price-cell" style={{ verticalAlign: 'middle' }}>
                    {isEditing && editForm ? (
                      <input 
                        type="number" 
                        value={editForm.newPrice} 
                        onChange={(e) => setEditForm({ ...editForm, newPrice: Number(e.target.value) })}
                        style={{ width: '70px', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      />
                    ) : (
                      <strong style={{ color: 'var(--text-primary)' }}>₹{prod.newPrice}</strong>
                    )}
                  </td>
                  
                  {/* Old Price */}
                  <td className="price-cell old" style={{ verticalAlign: 'middle', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {isEditing && editForm ? (
                      <input 
                        type="number" 
                        value={editForm.oldPrice} 
                        onChange={(e) => setEditForm({ ...editForm, oldPrice: Number(e.target.value) })}
                        style={{ width: '70px', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      />
                    ) : (
                      <span>₹{prod.oldPrice || 0}</span>
                    )}
                  </td>
                  
                  {/* Action Buttons */}
                  <td style={{ paddingRight: '24px', verticalAlign: 'middle', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button 
                            type="button"
                            className="save-edit-btn" 
                            onClick={() => handleSaveEdit(prod.id)}
                            disabled={isSaving}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '8px 14px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '40px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            Save
                          </button>
                          <button 
                            type="button"
                            className="cancel-edit-btn" 
                            onClick={() => setEditingProductId(null)}
                            disabled={isSaving}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '8px 14px',
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              borderRadius: '40px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="button"
                            className="admin-edit-btn" 
                            onClick={() => startEditing(prod)}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '8px 14px',
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              borderRadius: '40px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button 
                            type="button"
                            className="admin-delete-btn" 
                            onClick={() => handleDeleteProduct(prod)}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '8px 14px',
                              backgroundColor: '#fee2e2',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: '40px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No products found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCatalogTab;
