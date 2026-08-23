import React, { useState } from 'react';
import { User, Eye, Bell, CheckCheck, ShoppingBag, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminTopbar = ({ 
  adminUser, 
  notifications = [], 
  onMarkAllRead, 
  onMarkSingleRead, 
  onProcessOrder 
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="admin-topbar sticky top-0 z-50 flex items-center justify-between px-6 w-full h-16 bg-white dark:bg-[#12141c] border-b border-[#e2bec2]/40 dark:border-white/10 shadow-sm transition-colors duration-200">
      {/* Search/Dashboard Intro */}
      <div className="flex items-center gap-4 flex-1">
        <div>
          <h2 className="text-sm font-bold text-[#b80149] dark:text-[#ff3366] tracking-wider uppercase">
            ADMIN CONSOLE
          </h2>
          <span className="text-[11px] text-[#878787] font-medium hidden sm:inline">
            Manage Catalog, Accounts, and Real-time Orders
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* View Storefront CTA */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#db2b60] hover:bg-[#b80149] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-[#db2b60]/20 cursor-pointer"
        >
          <Eye size={14} />
          <span>Storefront</span>
        </button>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            aria-label="View Admin Notifications"
            title="Notifications"
            className="relative w-9 h-9 rounded-full bg-[#f2f4f7] dark:bg-[#1e2029] border border-[#e2bec2]/40 dark:border-white/10 flex items-center justify-center text-[#5a4044] dark:text-[#a3b0cc] hover:bg-[#e6e8eb] dark:hover:bg-[#363636] transition-all duration-150 cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#b80149] dark:bg-[#ff3366] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#12141c] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 max-h-96 bg-white dark:bg-[#1e2029] border border-[#e2bec2]/40 dark:border-white/10 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-[#e2bec2]/30 dark:border-white/5 bg-[#f2f4f7] dark:bg-[#12141c]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#191c1e] dark:text-[#ebf1ff]">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#db2b60] text-white px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-[#db2b60] hover:text-[#b80149] text-[10px] font-bold flex items-center gap-1 cursor-pointer bg-none border-none p-0"
                    >
                      <CheckCheck size={12} /> Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[#878787] hover:text-[#5a4044] cursor-pointer bg-none border-none p-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification Item List */}
              <div className="overflow-y-auto flex-1 divide-y divide-[#e2bec2]/20 dark:divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#878787] font-medium">
                    No recent order notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkSingleRead && onMarkSingleRead(n.id)}
                      className={`p-3.5 flex flex-col gap-2 transition-all duration-150 cursor-pointer ${
                        n.unread 
                          ? "bg-[#ffd9de]/20 dark:bg-[#ffd9de]/5" 
                          : "hover:bg-[#f2f4f7] dark:hover:bg-[#12141c]"
                      }`}
                    >
                      <div className="flex gap-2.5 items-start">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          n.type === 'order' 
                            ? "bg-green-50 dark:bg-green-950/20 text-[#388E3C]" 
                            : "bg-red-50 dark:bg-red-950/20 text-red-600"
                        }`}>
                          {n.type === 'order' ? <ShoppingBag size={14} /> : <AlertCircle size={14} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-[12px] font-bold text-[#191c1e] dark:text-[#ebf1ff] truncate">
                              {n.title}
                            </span>
                            <span className="text-[9px] text-[#878787]">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-[#5a4044] dark:text-[#a3b0cc] mt-1 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      </div>

                      {n.orderId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkSingleRead && onMarkSingleRead(n.id);
                            setShowNotifications(false);
                            onProcessOrder && onProcessOrder(n.orderId);
                          }}
                          className="self-end px-3 py-1 bg-[#db2b60] hover:bg-[#b80149] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer border-none shadow-sm transition-all"
                        >
                          Process & Ship <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Capsule */}
        <div className="flex items-center gap-2 pl-1 pr-3 py-1 bg-[#f2f4f7] dark:bg-[#1e2029] rounded-full border border-[#e2bec2]/40 dark:border-white/10">
          <div className="w-7 h-7 rounded-full bg-[#db2b60] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <span className="text-xs font-bold text-[#191c1e] dark:text-[#ebf1ff] hidden sm:inline max-w-[100px] truncate">
            {adminUser?.name || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
};
export default AdminTopbar;
