import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../Hooks/useAdminAuth';
import { adminApi } from '../Utils/adminApi';
import { Toast } from '../Components/admin/Toast';
import { ConfirmModal } from '../Components/admin/ConfirmModal';
import { AdminLoadingScreen } from '../Components/admin/AdminLoadingScreen';
import { AdminAccessDenied } from '../Components/admin/AdminAccessDenied';
import { AdminSidebar } from '../Components/admin/AdminSidebar';
import { AdminTopbar } from '../Components/admin/AdminTopbar';

// Individual Tabs
import { AdminDashboardTab } from '../Components/admin/AdminDashboardTab';
import { AdminCatalogTab } from '../Components/admin/AdminCatalogTab';
import { AdminAddProductTab } from '../Components/admin/AdminAddProductTab';
import { AdminUsersTab } from '../Components/admin/AdminUsersTab';
import { AdminOrdersTab } from '../Components/admin/AdminOrdersTab';
import { AdminCouponsTab } from '../Components/admin/AdminCouponsTab';

// Styling imports
import '../Styles/adminPanel.css';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Demo/offline preview mode toggle
const ENABLE_ADMIN_DEMO_MODE = false;

const MOCK_USERS = [
  { name: "Emily Watson", email: "emily@gmail.com", isAdmin: false, cartData: { "1-M-Black": { quantity: 2 }, "4-L-White": { quantity: 1 } }, date: new Date().toISOString() },
  { name: "John Doe", email: "johndoe@gmail.com", isAdmin: false, cartData: { "12-XL-Grey": { quantity: 1 } }, date: new Date().toISOString() },
  { name: "Admin Manager", email: "admin@gmail.com", isAdmin: true, cartData: {}, date: new Date().toISOString() }
];

const MOCK_ORDERS = [
  {
    _id: "ORD-987216",
    userName: "Emily Watson",
    userEmail: "emily@gmail.com",
    amount: 200,
    status: "Pending",
    payment: true,
    date: new Date().toISOString(),
    address: {
      fullName: "Emily Watson",
      addressLine: "Apt 4B, 12 Park Ave",
      city: "New York",
      state: "NY",
      postalCode: "10016",
      phone: "+1 212-555-0199"
    },
    items: [
      { productId: 1, name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse", size: "M", color: "Black", quantity: 2, price: 50.0 },
      { productId: 4, name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse", size: "L", color: "White", quantity: 1, price: 100.0 }
    ]
  },
  {
    _id: "ORD-128456",
    userName: "John Doe",
    userEmail: "johndoe@gmail.com",
    amount: 85,
    status: "Delivered",
    payment: true,
    date: new Date(Date.now() - 86400000).toISOString(),
    address: {
      fullName: "John Doe",
      addressLine: "456 Oak St",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      phone: "+1 206-555-0145"
    },
    items: [
      { productId: 2, name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse", size: "L", color: "White", quantity: 1, price: 85.0 }
    ]
  }
];

export const AdminPanel = () => {
  // 1. Secure Authentication Hook
  const { isAdmin, loading: authLoading, adminUser } = useAdminAuth();

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // 3. Database State
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Fetch Loaders and Error triggers
  const [fetchingData, setFetchingData] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // 4. Toast notifications State
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 5. Custom Modal dialog State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDestructive: false,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const triggerConfirm = ({ title, message, confirmText, cancelText, isDestructive, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDestructive,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
      onCancel: closeConfirm
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // 6. Simulated Session Logs
  const [recentActions, setRecentActions] = useState([
    { message: "Administrative Session Established", time: new Date().toLocaleTimeString() }
  ]);
  const logAction = (message) => {
    setRecentActions(prev => [
      { message, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9) // Limit to last 10 logs
    ]);
  };

  // Load Admin Data on authorized mounts
  const fetchAllAdminData = useCallback(async () => {
    setFetchingData(true);
    setFetchError(null);
    try {
      // Parallel fetches for performance
      const [prodData, usersData, ordersData, couponsData] = await Promise.allSettled([
        adminApi.fetchProducts(),
        adminApi.fetchUsers(),
        adminApi.fetchOrders(),
        adminApi.fetchCoupons()
      ]);

      if (prodData.status === 'fulfilled') {
        setProducts(prodData.value);
      } else {
        console.warn("Could not load products:", prodData.reason);
      }

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value);
      } else {
        console.warn("Could not load users directory:", usersData.reason);
        if (ENABLE_ADMIN_DEMO_MODE) {
          setUsers(MOCK_USERS);
        } else {
          throw new Error("Node backend users API offline");
        }
      }

      if (ordersData.status === 'fulfilled') {
        setOrders(ordersData.value);
      } else {
        console.warn("Could not load order tracking:", ordersData.reason);
        if (ENABLE_ADMIN_DEMO_MODE) {
          setOrders(MOCK_ORDERS);
        }
      }

      if (couponsData.status === 'fulfilled') {
        setCoupons(couponsData.value);
      } else {
        console.warn("Could not load active coupons list:", couponsData.reason);
      }

    } catch (err) {
      console.error("Critical database fetch failure:", err);
      setFetchError(err.message || "Failed to establish active connection with database API.");
      addToast("Failed to fetch administrative data lists", "error");
    } finally {
      setFetchingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAllAdminData();
    }
  }, [isAdmin, fetchAllAdminData]);

  // Loader UI
  if (authLoading) {
    return <AdminLoadingScreen />;
  }

  // Verification Failure UI
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="admin-panel animate-fade-in" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* 1. Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        productsCount={products.length}
        usersCount={users.length}
        ordersCount={orders.length}
        couponsCount={coupons.length}
      />

      {/* Primary Content Viewport */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* 2. Topbar */}
        <AdminTopbar adminUser={adminUser} />

        {/* 3. Tab Body Panel */}
        <main className="admin-content" style={{ flexGrow: 1, padding: '32px' }}>
          
          {fetchingData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              <span className="admin-spinner" style={{ borderLeftColor: 'var(--accent-color)', width: '16px', height: '16px' }}></span>
              <span>Syncing database collections...</span>
            </div>
          )}

          {fetchError && !fetchingData && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
                <AlertCircle size={20} />
                <strong style={{ fontSize: '0.95rem' }}>Database Fetch Error</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', lineHeight: '1.5' }}>
                {fetchError}. If you are running locally, please ensure that your Node Express backend server is up and listening on port 4000.
              </p>
              <button
                onClick={fetchAllAdminData}
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={12} />
                Retry connection
              </button>
            </div>
          )}

          {/* Render Active Tab */}
          {activeTab === "dashboard" && (
            <AdminDashboardTab 
              products={products}
              users={users}
              orders={orders}
              setActiveTab={setActiveTab}
              recentActions={recentActions}
            />
          )}

          {activeTab === "list" && (
            <AdminCatalogTab 
              products={products}
              onRefreshProducts={fetchAllAdminData}
              addToast={addToast}
              triggerConfirm={triggerConfirm}
              logAction={logAction}
            />
          )}

          {activeTab === "add" && (
            <AdminAddProductTab 
              onProductAdded={() => {
                fetchAllAdminData();
                setActiveTab("list");
              }}
              addToast={addToast}
              logAction={logAction}
            />
          )}

          {activeTab === "users" && (
            <AdminUsersTab 
              users={users}
              products={products}
              onRefreshUsers={fetchAllAdminData}
              addToast={addToast}
              triggerConfirm={triggerConfirm}
              logAction={logAction}
            />
          )}

          {activeTab === "orders" && (
            <AdminOrdersTab 
              orders={orders}
              products={products}
              onRefreshOrders={fetchAllAdminData}
              addToast={addToast}
              logAction={logAction}
            />
          )}

          {activeTab === "coupons" && (
            <AdminCouponsTab 
              coupons={coupons}
              onRefreshCoupons={fetchAllAdminData}
              addToast={addToast}
              triggerConfirm={triggerConfirm}
              logAction={logAction}
            />
          )}
        </main>
      </div>

      {/* Toast Alert overlay */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modal overlay */}
      <ConfirmModal {...confirmModal} />
    </div>
  );
};

export default AdminPanel;
