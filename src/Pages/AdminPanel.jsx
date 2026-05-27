import React, { useState, useEffect } from 'react';
import './CSS/AdminPanel.css';
import { BACKEND_URL } from '../config';

export const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list"); // "list" or "add"
  
  // Products List State
  const [products, setProducts] = useState([]);
  
  // Add Product Form State
  const [productDetails, setProductDetails] = useState({
    name: "",
    category: "women",
    new_price: "",
    old_price: ""
  });
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
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      await fetch(`${BACKEND_URL}/allproducts`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.warn("Failed to parse product list JSON:", err));
    } catch (error) {
      console.warn("⚠️ Failed to fetch products. Is the backend server running on " + BACKEND_URL + "?", error);
    }
  };

  // Input Change Handler
  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
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

    console.log("Adding Product...", productDetails);
    let responseData;
    let product = { ...productDetails };

    // 1. Upload the image file
    let formData = new FormData();
    formData.append('product', image);

    await fetch(`${BACKEND_URL}/upload`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => { responseData = data; });

    if (responseData && responseData.success) {
      product.image = responseData.image_url;
      
      // 2. Save product details in database
      await fetch(`${BACKEND_URL}/addproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(product),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("Product added successfully!");
            // Reset Form
            setProductDetails({
              name: "",
              category: "women",
              new_price: "",
              old_price: ""
            });
            setImage(false);
            fetchProducts();
            setActiveTab("list");
          } else {
            alert("Failed to add product: " + data.errors);
          }
        });
    } else {
      alert("Image upload failed! Make sure the backend server is running on " + BACKEND_URL);
    }
  };

  // Remove Product
  const removeProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await fetch(`${BACKEND_URL}/removeproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ id: id })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("Product deleted successfully!");
            fetchProducts();
          } else {
            alert("Failed to delete product: " + data.errors);
          }
        });
    }
  };

  if (loading) {
    return <div className="admin-loading">Checking administrative access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="denied-box">
          <h2>🔒 Access Denied</h2>
          <p>You do not have administrative privileges to access this dashboard. Please log in using an Admin account.</p>
          <button onClick={() => window.location.replace('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <h3>Admin Console</h3>
        <button 
          className={activeTab === "list" ? "active" : ""} 
          onClick={() => setActiveTab("list")}
        >
          📁 All Products ({products.length})
        </button>
        <button 
          className={activeTab === "add" ? "active" : ""} 
          onClick={() => setActiveTab("add")}
        >
          ➕ Add New Product
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "list" ? (
          <div className="admin-list-section">
            <h2>Product Catalog</h2>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>New Price</th>
                    <th>Old Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <img src={prod.image} alt={prod.name} className="admin-prod-thumb" />
                      </td>
                      <td className="prod-title-cell">{prod.name}</td>
                      <td><span className={`cat-tag ${prod.category}`}>{prod.category}</span></td>
                      <td className="price-cell">₹{prod.new_price}</td>
                      <td className="price-cell old">₹{prod.old_price}</td>
                      <td>
                        <button className="admin-delete-btn" onClick={() => removeProduct(prod.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="6" className="no-products">No products found in the catalog.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="admin-add-section">
            <h2>Add New Product</h2>
            <div className="admin-form">
              <div className="form-group">
                <label>Product Title</label>
                <input 
                  type="text" 
                  name="name" 
                  value={productDetails.name} 
                  onChange={changeHandler} 
                  placeholder="Enter product title..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={productDetails.category} onChange={changeHandler}>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    name="new_price" 
                    value={productDetails.new_price} 
                    onChange={changeHandler} 
                    placeholder="New price"
                  />
                </div>

                <div className="form-group">
                  <label>Old Price (₹)</label>
                  <input 
                    type="number" 
                    name="old_price" 
                    value={productDetails.old_price} 
                    onChange={changeHandler} 
                    placeholder="Old price"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload-wrapper">
                  <label htmlFor="file-input" className="image-upload-label">
                    {image ? (
                      <img src={URL.createObjectURL(image)} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📤</span>
                        <p>Click to upload product image</p>
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
                Create Product Listing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
