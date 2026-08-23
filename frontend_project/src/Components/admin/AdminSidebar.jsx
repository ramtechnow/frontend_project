import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  Users, 
  ShoppingCart, 
  Tag,
  User as UserIcon,
  LogOut,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

export const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  productsCount = 0, 
  usersCount = 0, 
  ordersCount = 0, 
  couponsCount = 0,
  bannersCount = 0
}) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'list', label: 'Catalog', icon: ShoppingBag, count: productsCount },
    { id: 'add', label: 'Add Product', icon: PlusCircle },
    { id: 'users', label: 'Users List', icon: Users, count: usersCount },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: ordersCount },
    { id: 'coupons', label: 'Coupons', icon: Tag, count: couponsCount },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon, count: bannersCount },
    { id: 'seasonal', label: 'Seasonal Offers', icon: Sparkles }
  ];

  return (
    <aside className="admin-sidebar w-64 bg-[#f2f4f7] dark:bg-[#12141c] border-r border-[#e2bec2]/40 dark:border-white/10 flex flex-col h-screen py-6 px-4 gap-2 shrink-0">
      {/* Brand Header */}
      <div className="sidebar-header px-3 mb-6">
        <h1 className="text-xl font-bold text-[#b80149] dark:text-[#ff3366] tracking-tight">RamCart Admin</h1>
        <p className="text-xs font-semibold text-[#878787] uppercase tracking-wider mt-0.5">Management Console</p>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                isActive 
                  ? "active bg-[#db2b60] text-white font-bold shadow-md shadow-[#db2b60]/20" 
                  : "text-[#5a4044] dark:text-[#a3b0cc] hover:bg-[#e6e8eb] dark:hover:bg-[#1e2029]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={`transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-white" : "text-[#8e6f73] dark:text-[#8090a6]"}`} />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-[#e6e8eb] dark:bg-[#1e2029] text-[#5a4044] dark:text-[#a3b0cc] border border-[#e2bec2]/30 dark:border-white/5"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile and Logout */}
      <div className="sidebar-footer mt-auto pt-4 border-t border-[#e2bec2]/40 dark:border-white/10 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-full bg-[#ffd9de] dark:bg-[#ffd9de]/10 text-[#b80149] dark:text-[#ff3366] flex items-center justify-center font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[#191c1e] dark:text-[#ebf1ff] truncate">
              {user?.name || 'Admin User'}
            </span>
            <span className="text-[10px] font-bold text-[#878787] uppercase tracking-wider">
              {user?.role === 'admin' ? 'System Root' : 'Administrator'}
            </span>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all duration-200 text-sm font-semibold cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};
