import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Save, X, Search, Filter, Loader2 } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';
import { compressImageToBase64, normalizeCategory, formatCurrency } from '../../Utils/adminHelpers';

export const AdminCatalogTab = ({ 
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
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", new_price: "", old_price: "", variants: [], image: "" });

  // Loaders
  const [savingProductId, setSavingProductId] = useState(null);
  const [busyStockKeys, setBusyStockKeys] = useState({}); // { 'productId-colorName': true }

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
  const startEditing = (prod) => {
    setEditingProductId(prod.id);
    
    // Synthesize variants locally if they don't exist yet to make sure editing works
    let initialVariants = prod.variants ? JSON.parse(JSON.stringify(prod.variants)) : [];
    if (initialVariants.length === 0) {
      const colors = prod.colors && prod.colors.length > 0 ? prod.colors : ['Black', 'White'];
      const totalStock = prod.stockCount !== undefined ? prod.stockCount : 100;
      const stockPerColor = Math.floor(totalStock / colors.length);
      
      initialVariants = colors.map((c, idx) => ({
        color: c,
        stock: idx === colors.length - 1 ? totalStock - (stockPerColor * (colors.length - 1)) : stockPerColor,
        price: prod.new_price
      }));
    }

    setEditForm({
      id: prod.id,
      name: prod.name,
      new_price: prod.new_price,
      old_price: prod.old_price,
      variants: initialVariants,
      image: prod.image
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.name.trim()) {
      addToast("Product title cannot be empty", "error");
      return;
    }
    if (Number(editForm.new_price) <= 0) {
      addToast("Price must be greater than 0", "error");
      return;
    }

    setSavingProductId(id);
    try {
      await adminApi.updateProduct(editForm);
      addToast("🎉 Product successfully updated in database!", "success");
      logAction(`Updated product specifications: "${editForm.name}"`);
      setEditingProductId(null);
      onRefreshProducts();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to update product details", "error");
    } finally {
      setSavingProductId(null);
    }
  };

  const handleDeleteProduct = (prod) => {
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
        } catch (err) {
          console.error(err);
          addToast(err.message || "Failed to delete product", "error");
        }
      }
    });
  };

  const handleVariantStockAdjust = async (id, colorName, change) => {
    const key = `${id}-${colorName}`;
    if (busyStockKeys[key]) return; // prevent duplicate clicks

    setBusyStockKeys(prev => ({ ...prev, [key]: true }));
    try {
      await adminApi.updateVariantStock(id, colorName, change);
      addToast(`Adjusted ${colorName} stock count`, "success");
      onRefreshProducts();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to adjust stock", "error");
    } finally {
      setBusyStockKeys(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="admin-list-section animate-fade-in">
      <div className="list-header-row">
        <h2>Product Catalog Audit</h2>
        
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
              style={{ paddingLeft: '36px', height: '40px', borderRadius: 'var(--border-radius-full)' }}
            />
          </div>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <select 
              className="audit-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px', borderRadius: 'var(--border-radius-full)' }}
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
                <tr key={prod.id} className={isEditing ? "row-editing" : ""} style={{ transition: 'background-color 0.2s' }}>
                  {/* Thumbnail Image */}
                  <td style={{ paddingLeft: '24px', verticalAlign: 'middle' }}>
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <img 
                        src={isEditing && editForm.image ? editForm.image : prod.image} 
                        alt={prod.name} 
                        className="admin-prod-thumb" 
                        style={{ width: '50px', height: '58px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                      />
                      {isEditing && (
                        <>
                          <button 
                            type="button" 
                            onClick={() => document.getElementById(`row-image-input-${prod.id}`).click()}
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: 'var(--accent-color)', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: 'var(--border-radius-sm)', 
                              fontSize: '0.65rem', 
                              fontWeight: '700', 
                              cursor: 'pointer' 
                            }}
                          >
                            📸 Edit
                          </button>
                          <input 
                            type="file" 
                            id={`row-image-input-${prod.id}`}
                            accept="image/*" 
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  const base64 = await compressImageToBase64(file);
                                  setEditForm(prev => ({ ...prev, image: base64 }));
                                } catch (err) {
                                  addToast("Failed to process image file", "error");
                                }
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </>
                      )}
                    </div>
                  </td>
                  
                  {/* Name and Attributes */}
                  <td className="prod-title-cell" style={{ verticalAlign: 'middle' }}>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="inline-edit-input wide" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ padding: '8px 12px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <>
                        <span className="prod-name-bold" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{prod.name}</span>
                        <div className="prod-params-meta" style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>📏 Size: <strong>{Array.isArray(prod.sizes) ? prod.sizes.join(', ') : 'S, M, L'}</strong></span>
                          <span>🎨 Colors: <strong>{Array.isArray(prod.colors) ? prod.colors.join(', ') : 'Multicolor'}</strong></span>
                        </div>
                      </>
                    )}
                  </td>
                  
                  {/* Category Tag */}
                  <td style={{ verticalAlign: 'middle' }}>
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
                  </td>
                  
                  {/* Inline Variant Stock Adjustments */}
                  <td style={{ verticalAlign: 'middle' }}>
                    {isEditing ? (
                      <div className="inline-variant-edit-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {editForm.variants && editForm.variants.map((v, idx) => (
                          <div key={idx} className="inline-variant-edit-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ backgroundColor: v.color.toLowerCase(), border: '1px solid var(--border-color)', width: '10px', height: '10px', borderRadius: '50%' }}></span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '50px' }}>{v.color}:</span>
                            <input 
                              type="number" 
                              className="inline-edit-input narrow"
                              value={v.stock}
                              onChange={(e) => {
                                const updatedVariants = [...editForm.variants];
                                updatedVariants[idx].stock = Math.max(0, Number(e.target.value));
                                setEditForm({ ...editForm, variants: updatedVariants });
                              }}
                              min="0"
                              style={{ width: '60px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="variant-auditor-panel" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(prod.variants || []).map((v, vidx) => {
                          const stockKey = `${prod.id}-${v.color}`;
                          const isBusy = busyStockKeys[stockKey];

                          return (
                            <div key={vidx} className="variant-auditor-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ backgroundColor: v.color.toLowerCase(), border: '1px solid var(--border-color)', width: '10px', height: '10px', borderRadius: '50%' }} title={v.color}></span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '50px' }}>{v.color}:</span>
                              
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                          Total Stock: <strong>{prod.stockCount} units</strong>
                        </div>
                      </div>
                    )}
                  </td>
                  
                  {/* New Price */}
                  <td className="price-cell" style={{ verticalAlign: 'middle' }}>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="inline-edit-input narrow"
                        value={editForm.new_price} 
                        onChange={(e) => setEditForm({ ...editForm, new_price: e.target.value })}
                        style={{ width: '70px', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(prod.new_price)}</strong>
                    )}
                  </td>
                  
                  {/* Old Price */}
                  <td className="price-cell old" style={{ verticalAlign: 'middle', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="inline-edit-input narrow"
                        value={editForm.old_price} 
                        onChange={(e) => setEditForm({ ...editForm, old_price: e.target.value })}
                        style={{ width: '70px', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <span>{formatCurrency(prod.old_price)}</span>
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
                              borderRadius: 'var(--border-radius-full)',
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
                              borderRadius: 'var(--border-radius-full)',
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
                              borderRadius: 'var(--border-radius-full)',
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
                              borderRadius: 'var(--border-radius-full)',
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
