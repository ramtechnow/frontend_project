import React, { useState, useEffect } from 'react';
import './CSS/AdminPanel.css';
import { BACKEND_URL } from '../config';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const AVAILABLE_COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Grey', 'Orange', 'Yellow'];

export const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "list", "add", "users"
  
  // Catalog & Users State
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Expanded User Row (to view cart detail)
  const [expandedUser, setExpandedUser] = useState(null);

  // Editing Product Inline State
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", new_price: "", old_price: "", stockCount: "" });

  // Add Product Form State
  const [productDetails, setProductDetails] = useState({
    name: "",
    category: "women",
    new_price: "",
    old_price: "",
    stockCount: 100
  });
  
  // Size and Color selections for adding product
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState(['Black', 'White']);
  const [image, setImage] = useState(false);

  // Check Admin privileges on mount
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.user && payload.user.isAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("JWT Decode error:", error);
      }
    }
    setLoading(false);
    fetchProducts();
    fetchUsers();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/allproducts`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.warn("⚠️ Failed to fetch products:", error);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/users`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.warn("⚠️ Failed to fetch users from Node backend server:", error);
      // Fallback mocks for simulated visual preview
      setUsers([
        { name: "Emily Watson", email: "emily@gmail.com", isAdmin: false, cartData: { "1-M-Black": { quantity: 2 }, "4-L-White": { quantity: 1 } }, date: new Date().toISOString() },
        { name: "John Doe", email: "johndoe@gmail.com", isAdmin: false, cartData: { "12-XL-Grey": { quantity: 1 } }, date: new Date().toISOString() },
        { name: "Admin Manager", email: "admin@gmail.com", isAdmin: true, cartData: {}, date: new Date().toISOString() }
      ]);
    }
  };

  // Input Change Handler
  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  // Size Checkbox toggle
  const sizeToggleHandler = (size) => {
    setSelectedSizes((prev) => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Color Checkbox toggle
  const colorToggleHandler = (color) => {
    setSelectedColors((prev) => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Image Upload handler
  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  // Add Product Submit
  const addProduct = async () => {
    if (!productDetails.name || !productDetails.new_price || !productDetails.old_price || !image) {
      alert("Please fill all details and upload a product image!");
      return;
    }

    if (selectedSizes.length === 0) {
      alert("Please select at least one available Size!");
      return;
    }

    if (selectedColors.length === 0) {
      alert("Please select at least one available Color!");
      return;
    }

    console.log("Adding Product...", productDetails);
    let responseData;
    let product = { 
      ...productDetails, 
      sizes: selectedSizes, 
      colors: selectedColors,
      stockCount: Number(productDetails.stockCount)
    };

    // 1. Upload the image file
    let formData = new FormData();
    formData.append('product', image);

    try {
      const uploadRes = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });
      responseData = await uploadRes.json();
    } catch (e) {
      console.error("Image upload connection failure", e);
    }

    if (responseData && responseData.success) {
      product.image = responseData.image_url;
      
      // 2. Save product details in database
      try {
        const addRes = await fetch(`${BACKEND_URL}/addproduct`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'auth-token': `${localStorage.getItem('auth-token')}`
          },
          body: JSON.stringify(product),
        });
        const addData = await addRes.json();

        if (addData.success) {
          alert("Product added successfully!");
          // Reset Form
          setProductDetails({
            name: "",
            category: "women",
            new_price: "",
            old_price: "",
            stockCount: 100
          });
          setSelectedSizes(['S', 'M', 'L', 'XL']);
          setSelectedColors(['Black', 'White']);
          setImage(false);
          fetchProducts();
          setActiveTab("list");
        } else {
          alert("Failed to add product: " + addData.errors);
        }
      } catch (err) {
        alert("Failed to save product details to server database.");
      }
    } else {
      alert("Image upload failed! Make sure the backend server is running on " + BACKEND_URL);
    }
  };

  // Remove Product
  const removeProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`${BACKEND_URL}/removeproduct`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'auth-token': `${localStorage.getItem('auth-token')}`
          },
          body: JSON.stringify({ id: id })
        });
        const data = await res.json();
        if (data.success) {
          alert("Product deleted successfully!");
          fetchProducts();
        } else {
          alert("Failed to delete product: " + data.errors);
        }
      } catch (err) {
        alert("Connection error occurred when deleting product.");
      }
    }
  };

  // Inline Stock Incrementor/Decrementor
  const handleStockAdjust = async (id, currentStock, change) => {
    const targetProduct = products.find(p => p.id === id);
    if (!targetProduct) return;
    
    const newStock = Math.max(0, Number(currentStock) + change);
    try {
      const res = await fetch(`${BACKEND_URL}/updateproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          id,
          name: targetProduct.name,
          new_price: targetProduct.new_price,
          old_price: targetProduct.old_price,
          stockCount: newStock
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stockCount: newStock } : p));
      }
    } catch (e) {
      console.warn("⚠️ Error adjusting stock count:", e);
    }
  };

  // Trigger editing form for a product
  const startEditing = (prod) => {
    setEditingProductId(prod.id);
    setEditForm({
      name: prod.name,
      new_price: prod.new_price,
      old_price: prod.old_price,
      stockCount: prod.stockCount || 100
    });
  };

  // Inline Edit Save
  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/updateproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          id,
          name: editForm.name,
          new_price: Number(editForm.new_price),
          old_price: Number(editForm.old_price),
          stockCount: Number(editForm.stockCount)
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...editForm } : p));
        setEditingProductId(null);
        alert("Product updated successfully!");
      } else {
        alert("Failed to update product: " + data.error);
      }
    } catch (e) {
      console.warn("⚠️ Failed to update product:", e);
      alert("Failed to update product due to server connection issues. Please check if the backend server is running.");
    }
  };

  // Toggle User Role (Admin / Customer)
  const handleToggleRole = async (email, currentIsAdmin) => {
    const nextRoleText = currentIsAdmin ? "Standard Customer" : "Admin Manager";
    if (window.confirm(`Are you sure you want to change role for ${email} to ${nextRoleText}?`)) {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/updateuserrole`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'auth-token': `${localStorage.getItem('auth-token')}`
          },
          body: JSON.stringify({ email, isAdmin: !currentIsAdmin })
        });
        const data = await res.json();
        if (data.success) {
          setUsers(prev => prev.map(u => u.email === email ? { ...u, isAdmin: !currentIsAdmin } : u));
          alert("User role updated successfully!");
        } else {
          alert("Failed to update user role: " + data.error);
        }
      } catch (e) {
        console.warn("⚠️ Failed to update user role on server:", e);
        // Fallback for mock visual mode
        setUsers(prev => prev.map(u => u.email === email ? { ...u, isAdmin: !currentIsAdmin } : u));
      }
    }
  };

  // Delete User Account
  const handleDeleteUser = async (email) => {
    if (window.confirm(`⚠️ WARNING: Are you sure you want to permanently delete the user account: ${email}? This cannot be undone.`)) {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/deleteuser`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'auth-token': `${localStorage.getItem('auth-token')}`
          },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
          setUsers(prev => prev.filter(u => u.email !== email));
          alert("User account deleted successfully!");
        } else {
          alert("Failed to delete user: " + data.error);
        }
      } catch (e) {
        console.warn("⚠️ Failed to delete user:", e);
        // Fallback for mock visual mode
        setUsers(prev => prev.filter(u => u.email !== email));
      }
    }
  };

  // Normalize user carts data dynamically
  const getNormalizedCartItems = (cartData) => {
    if (!cartData || typeof cartData !== "object") return [];
    const normalized = [];
    Object.keys(cartData).forEach((key) => {
      const value = cartData[key];
      if (value === undefined || value === null) return;
      
      const parts = key.split("-");
      const keyId = Number(parts[0]);
      if (isNaN(keyId)) return;
      
      let size = parts[1] || "M";
      let color = parts[2] || "White";
      let quantity = 0;
      let id = keyId;

      if (typeof value === "object") {
        quantity = Number(value.quantity) || 0;
        if (value.id !== undefined) id = Number(value.id);
        if (value.size !== undefined) size = value.size;
        if (value.color !== undefined) color = value.color;
      } else {
        quantity = Number(value) || 0;
      }

      if (quantity > 0) {
        normalized.push({
          id,
          size,
          color,
          quantity
        });
      }
    });
    return normalized;
  };

  // Calculate overall quantity in cart
  const calculateCartItemsCount = (cartData) => {
    const items = getNormalizedCartItems(cartData);
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  };

  // Computed metrics for dashboard cards
  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalStock = products.reduce((acc, curr) => acc + (Number(curr.stockCount) || 100), 0);
  const catalogValue = products.reduce((acc, curr) => acc + ((Number(curr.new_price) || 0) * (Number(curr.stockCount) || 100)), 0);

  // Category distributions for interactive bar graphs
  const countCategory = (cat) => products.filter(p => p.category === cat).length;
  const catWomen = countCategory("women");
  const catMen = countCategory("men");
  const catKids = countCategory("kid") + countCategory("kids");
  const catMax = Math.max(catWomen, catMen, catKids, 1);

  // Live filter lists based on search & category queries
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || prod.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="denied-box">
          <div className="denied-icon">🔒</div>
          <h2>Access Unauthorized</h2>
          <p>This console contains administrative credentials and metrics. Please sign in using an authorized Admin Manager profile.</p>
          <button onClick={() => window.location.replace('/login')}>Proceed to Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* SIDE NAVIGATION PANEL */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo-icon">📊</span>
          <h3>SHOPS ADMIN</h3>
        </div>
        
        <nav className="sidebar-menu">
          <button 
            className={activeTab === "dashboard" ? "active" : ""} 
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="menu-icon">📈</span> Dashboard
          </button>
          <button 
            className={activeTab === "list" ? "active" : ""} 
            onClick={() => setActiveTab("list")}
          >
            <span className="menu-icon">📁</span> Catalog ({products.length})
          </button>
          <button 
            className={activeTab === "add" ? "active" : ""} 
            onClick={() => setActiveTab("add")}
          >
            <span className="menu-icon">➕</span> Add Product
          </button>
          <button 
            className={activeTab === "users" ? "active" : ""} 
            onClick={() => { setActiveTab("users"); fetchUsers(); }}
          >
            <span className="menu-icon">👥</span> Users list ({users.length})
          </button>
        </nav>
      </div>

      {/* PRIMARY CONTROLS VIEWPORT */}
      <div className="admin-content">
        
        {/* TAB 0: ANALYTICS DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="dashboard-section animate-fade-in">
            <h2>System Performance Metrics</h2>
            
            {/* STATS METRIC GRID */}
            <div className="metrics-grid">
              <div className="metric-card val">
                <div className="metric-details">
                  <span className="metric-title">Catalog Asset Value</span>
                  <span className="metric-value">₹{catalogValue.toLocaleString('en-IN')}</span>
                </div>
                <span className="metric-icon">💰</span>
              </div>
              <div className="metric-card prod">
                <div className="metric-details">
                  <span className="metric-title">Active Products Listing</span>
                  <span className="metric-value">{totalProducts} Items</span>
                </div>
                <span className="metric-icon">👕</span>
              </div>
              <div className="metric-card users">
                <div className="metric-details">
                  <span className="metric-title">Registered Accounts</span>
                  <span className="metric-value">{totalUsers} Users</span>
                </div>
                <span className="metric-icon">👥</span>
              </div>
              <div className="metric-card stock">
                <div className="metric-details">
                  <span className="metric-title">Store Stocks Remaining</span>
                  <span className="metric-value">{totalStock} Units</span>
                </div>
                <span className="metric-icon">📦</span>
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
                  <button className="shortcut-btn" onClick={() => { setActiveTab("users"); fetchUsers(); }}>
                    ⚙️ Resolve User Issues
                  </button>
                </div>
                <p className="admin-console-note">
                  💡 <strong>Tip:</strong> Double-click prices inside the Catalog tab to adjust pricing dynamically, or click details on user profiles to investigate active shopping cart items.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: SEARCHABLE AND EDITABLE PRODUCT CATALOG */}
        {activeTab === "list" && (
          <div className="admin-list-section animate-fade-in">
            <div className="list-header-row">
              <h2>Product Catalog Audit</h2>
              
              {/* INTERACTIVE CONTROLS BAR */}
              <div className="audit-controls">
                <input 
                  type="text" 
                  className="audit-search-input" 
                  placeholder="Search catalog titles..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select 
                  className="audit-filter-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="kid">Kids</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Title & Parameters</th>
                    <th>Category</th>
                    <th>Stock Control (Inline)</th>
                    <th>New Price</th>
                    <th>Old Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className={editingProductId === prod.id ? "row-editing" : ""}>
                      {/* Thumbnail */}
                      <td>
                        <img src={prod.image} alt={prod.name} className="admin-prod-thumb" />
                      </td>
                      
                      {/* Name / Colors & Sizes */}
                      <td className="prod-title-cell">
                        {editingProductId === prod.id ? (
                          <input 
                            type="text" 
                            className="inline-edit-input wide" 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        ) : (
                          <>
                            <span className="prod-name-bold">{prod.name}</span>
                            <div className="prod-params-meta">
                              <span>📏 {Array.isArray(prod.sizes) ? prod.sizes.join(', ') : 'S, M, L'}</span>
                              <span>🎨 {Array.isArray(prod.colors) ? prod.colors.join(', ') : 'Multicolor'}</span>
                            </div>
                          </>
                        )}
                      </td>
                      
                      {/* Category */}
                      <td>
                        <span className={`cat-tag ${prod.category}`}>{prod.category}</span>
                      </td>
                      
                      {/* Inline Stock Controls */}
                      <td>
                        {editingProductId === prod.id ? (
                          <input 
                            type="number" 
                            className="inline-edit-input narrow"
                            value={editForm.stockCount}
                            onChange={(e) => setEditForm({ ...editForm, stockCount: e.target.value })}
                          />
                        ) : (
                          <div className="inline-stock-control-panel">
                            <button 
                              className="adjust-stock-btn dec" 
                              onClick={() => handleStockAdjust(prod.id, prod.stockCount || 100, -5)}
                            >
                              -5
                            </button>
                            <span className={`stock-count-badge ${Number(prod.stockCount) > 0 ? 'in' : 'out'}`}>
                              {prod.stockCount !== undefined ? prod.stockCount : 100} units
                            </span>
                            <button 
                              className="adjust-stock-btn inc" 
                              onClick={() => handleStockAdjust(prod.id, prod.stockCount || 100, 5)}
                            >
                              +5
                            </button>
                          </div>
                        )}
                      </td>
                      
                      {/* New Price */}
                      <td className="price-cell">
                        {editingProductId === prod.id ? (
                          <input 
                            type="number" 
                            className="inline-edit-input narrow"
                            value={editForm.new_price} 
                            onChange={(e) => setEditForm({ ...editForm, new_price: e.target.value })}
                          />
                        ) : (
                          <span className="val-text">₹{prod.new_price}</span>
                        )}
                      </td>
                      
                      {/* Old Price */}
                      <td className="price-cell old">
                        {editingProductId === prod.id ? (
                          <input 
                            type="number" 
                            className="inline-edit-input narrow"
                            value={editForm.old_price} 
                            onChange={(e) => setEditForm({ ...editForm, old_price: e.target.value })}
                          />
                        ) : (
                          <span className="val-text">₹{prod.old_price}</span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td>
                        <div className="action-buttons-wrapper">
                          {editingProductId === prod.id ? (
                            <>
                              <button className="save-edit-btn" onClick={() => handleSaveEdit(prod.id)}>💾 Save</button>
                              <button className="cancel-edit-btn" onClick={() => setEditingProductId(null)}>❌ Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="admin-edit-btn" onClick={() => startEditing(prod)}>✏️ Edit</button>
                              <button className="admin-delete-btn" onClick={() => removeProduct(prod.id)}>🗑️ Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="no-products">No products found matching the filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ADD PRODUCT VIEW */}
        {activeTab === "add" && (
          <div className="admin-add-section animate-fade-in">
            <h2>Launch New Product Listing</h2>
            <div className="admin-form">
              <div className="form-group">
                <label>Product Title / Descriptive Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={productDetails.name} 
                  onChange={changeHandler} 
                  placeholder="e.g. Premium Slim Fit Cotton Denim Shirt"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Audience Target</label>
                  <select name="category" value={productDetails.category} onChange={changeHandler}>
                    <option value="women">Women Fashion</option>
                    <option value="men">Men Outfitting</option>
                    <option value="kid">Kids Collections</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Promo Price (₹)</label>
                  <input 
                    type="number" 
                    name="new_price" 
                    value={productDetails.new_price} 
                    onChange={changeHandler} 
                    placeholder="e.g. 1499"
                  />
                </div>

                <div className="form-group">
                  <label>MSRP Original (₹)</label>
                  <input 
                    type="number" 
                    name="old_price" 
                    value={productDetails.old_price} 
                    onChange={changeHandler} 
                    placeholder="e.g. 2999"
                  />
                </div>

                <div className="form-group">
                  <label>Starting Inventory</label>
                  <input 
                    type="number" 
                    name="stockCount" 
                    value={productDetails.stockCount} 
                    onChange={changeHandler} 
                    placeholder="e.g. 150"
                  />
                </div>
              </div>

              {/* SIZES MULTI-SELECT CHIPS */}
              <div className="form-group">
                <label>Inventory Sizing Available (Select multiple)</label>
                <div className="admin-checkbox-row">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`admin-toggle-chip ${selectedSizes.includes(size) ? 'active' : ''}`}
                      onClick={() => sizeToggleHandler(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLORS MULTI-SELECT CHIPS */}
              <div className="form-group">
                <label>Inventory Colors Available (Select multiple)</label>
                <div className="admin-checkbox-row">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`admin-toggle-chip ${selectedColors.includes(color) ? 'active' : ''}`}
                      onClick={() => colorToggleHandler(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Product Display Image</label>
                <div className="image-upload-wrapper">
                  <label htmlFor="file-input" className="image-upload-label">
                    {image ? (
                      <img src={URL.createObjectURL(image)} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📤</span>
                        <p>Click here or drag-and-drop to upload image</p>
                        <span className="upload-hint">PNG, JPG or WEBP formats supported</span>
                      </div>
                    )}
                  </label>
                  <input 
                    type="file" 
                    id="file-input" 
                    accept="image/*" 
                    onChange={imageHandler} 
                    hidden 
                  />
                </div>
              </div>

              <button className="admin-submit-btn" onClick={addProduct}>
                Create & Publish Product Listing
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: USER ACCOUNTS & COLLAPSIBLE CARTS EXPLORER */}
        {activeTab === "users" && (
          <div className="admin-users-section animate-fade-in">
            <h2>Accounts Directory & Active Carts</h2>
            <p className="admin-helper-note">
              💡 <strong>Carts Audit Mode:</strong> Click any user profile row in the directory below to expand their details and view active items inside their shopping carts. You can adjust administrative roles or terminate accounts as needed.
            </p>
            
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Profile Name</th>
                    <th>Email Address</th>
                    <th>Administrative Role</th>
                    <th>Cart Contents</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const isExpanded = expandedUser === u.email;
                    const normalizedItems = getNormalizedCartItems(u.cartData);
                    const totalQty = calculateCartItemsCount(u.cartData);

                    return (
                      <React.Fragment key={i}>
                        {/* USER MAIN ROW */}
                        <tr 
                          className={`user-main-row ${isExpanded ? "active-expanded" : ""} ${u.isAdmin ? "admin-account-tr" : ""}`}
                          onClick={() => setExpandedUser(isExpanded ? null : u.email)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="user-name-cell">
                            <span className="expand-indicator">{isExpanded ? "▼" : "▶"}</span>
                            👤 {u.name}
                          </td>
                          <td className="user-email-cell">{u.email}</td>
                          <td>
                            <span className={`role-badge ${u.isAdmin ? 'admin' : 'customer'}`}>
                              {u.isAdmin ? "ADMIN PRIVILEGES" : "STANDARD CUSTOMER"}
                            </span>
                          </td>
                          <td className="user-cart-count-cell">
                            <span className="user-items-added">
                              🛒 {totalQty} {totalQty === 1 ? 'Item' : 'Items'} Added
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="action-buttons-wrapper">
                              <button 
                                className="user-role-toggle-btn"
                                onClick={() => handleToggleRole(u.email, u.isAdmin)}
                              >
                                ⚙️ Flip Role
                              </button>
                              <button 
                                className="user-delete-btn"
                                onClick={() => handleDeleteUser(u.email)}
                              >
                                🗑️ Terminate
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* COLLAPSIBLE USER CART DETAIL DRAWER */}
                        {isExpanded && (
                          <tr className="user-detail-drawer-row">
                            <td colSpan="5" className="drawer-container-td">
                              <div className="user-drawer-card animate-slide-down">
                                <h4>🛒 Active Basket Audit for {u.name}</h4>
                                {normalizedItems.length === 0 ? (
                                  <p className="empty-drawer-note">No items currently stored inside this user's shopping basket.</p>
                                ) : (
                                  <div className="drawer-cart-list">
                                    {normalizedItems.map((cartItem, idx) => {
                                      const prodDetails = products.find(p => p.id === cartItem.id);
                                      return (
                                        <div key={idx} className="drawer-cart-item-row">
                                          {prodDetails ? (
                                            <>
                                              <img src={prodDetails.image} alt={prodDetails.name} className="drawer-prod-thumb" />
                                              <div className="drawer-prod-info">
                                                <span className="item-title">{prodDetails.name}</span>
                                                <div className="item-specs">
                                                  <span>Size: <strong>{cartItem.size}</strong></span>
                                                  <span>Color: <strong>{cartItem.color}</strong></span>
                                                  <span>Qty: <strong>{cartItem.quantity}</strong></span>
                                                  <span>Unit Price: <strong>₹{prodDetails.new_price}</strong></span>
                                                </div>
                                              </div>
                                              <div className="drawer-item-total">
                                                <span>Total: <strong>₹{prodDetails.new_price * cartItem.quantity}</strong></span>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="drawer-corrupted-item">
                                              <span>⚠️ Legacy Product ID #{cartItem.id} | Size: {cartItem.size} | Color: {cartItem.color} | Qty: {cartItem.quantity}</span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="no-products">No registered users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
