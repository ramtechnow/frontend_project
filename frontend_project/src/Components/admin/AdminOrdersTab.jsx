import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Loader2, Trash2, Mail, User, ShieldAlert, ShoppingBag, Eye, Calendar, AlertTriangle, HelpCircle } from 'lucide-react';
import { adminApi } from '../../Utils/adminApi';

export const AdminOrdersTab = ({ 
  orders = [], 
  products = [], 
  onRefreshOrders, 
  addToast,
  triggerConfirm,
  logAction
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Pending" | "Processing" | "Shipped" | "Delivered"

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      addToast(`🎉 Order status updated to ${newStatus}`, "success");
      logAction(`Updated order ${orderId} shipping status to "${newStatus}"`);
      onRefreshOrders();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = (orderId) => {
    triggerConfirm({
      title: 'Delete Order Record?',
      message: `Are you sure you want to permanently delete order #${orderId}? This record will be removed.`,
      isDestructive: true,
      confirmText: 'Delete Order',
      onConfirm: async () => {
        try {
          await adminApi.deleteOrder(orderId);
          addToast('🎉 Order record deleted successfully!', 'success');
          logAction(`Deleted order record ${orderId}`);
          onRefreshOrders();
        } catch (err) {
          console.error(err);
          addToast(err.message || 'Failed to delete order record', 'error');
        }
      }
    });
  };

  // 1. Dynamic Stepper Counts from database (Fully Safe wrapper)
  const pipelineStats = useMemo(() => {
    let pending = 0;
    let processing = 0;
    let shipped = 0;
    let delivered = 0;

    if (Array.isArray(orders)) {
      orders.forEach((o) => {
        if (!o) return;
        const status = o.status || 'Pending';
        if (status === 'Pending') pending++;
        else if (status === 'Processing') processing++;
        else if (status === 'Shipped') shipped++;
        else if (status === 'Delivered') delivered++;
      });
    }

    return { pending, processing, shipped, delivered };
  }, [orders]);

  // 2. Anomaly Alert detection (e.g. orders pending/processing for more than 48 hours)
  const delayedOrders = useMemo(() => {
    const threshold = 48 * 60 * 60 * 1000; // 48 hours
    const now = Date.now();
    
    if (!Array.isArray(orders)) return [];
    
    return orders.filter(o => {
      if (!o) return false;
      const isPending = o.status === 'Pending' || o.status === 'Processing';
      const isOld = o.date ? (now - new Date(o.date).getTime()) > threshold : false;
      return isPending && isOld;
    });
  }, [orders]);

  // 3. Filter orders based on status & search
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    return orders.filter((o) => {
      if (!o) return false;
      const idStr = String(o._id || o.id || '').toLowerCase();
      const nameStr = String(o.userName || o.address?.fullName || '').toLowerCase();
      const emailStr = String(o.userEmail || o.address?.email || '').toLowerCase();
      
      const searchMatch = idStr.includes(searchQuery.toLowerCase()) || 
                          nameStr.includes(searchQuery.toLowerCase()) || 
                          emailStr.includes(searchQuery.toLowerCase());
      
      let statusMatch = true;
      if (statusFilter !== 'All') {
        statusMatch = (o.status || 'Pending') === statusFilter;
      }

      return searchMatch && statusMatch;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full text-[#191c1e] dark:text-[#ebf1ff]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Order Tracking &amp; Management</h2>
          <p className="text-sm text-[#878787] mt-0.5">Monitor, process, and manage active customer orders.</p>
        </div>
      </div>

      {/* Proactive Alert Banner for Delayed/Stuck orders */}
      {delayedOrders.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm animate-pulse">
          <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-xs font-black uppercase tracking-wider">Action Required: Delayed Shipments</h3>
            <p className="text-xs mt-1 font-medium">
              There are {delayedOrders.length} orders currently delayed or processing beyond the 48h SLA window. Please audit their fulfillment status.
            </p>
          </div>
          <button 
            onClick={() => { setStatusFilter("Pending"); setSearchQuery(""); }}
            className="text-xs font-black text-red-700 dark:text-red-400 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            Review Delayed ({delayedOrders.length})
          </button>
        </div>
      )}

      {/* Stats and Stepper Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fulfillment stepper */}
        <div className="lg:col-span-2 bg-white dark:bg-[#12141c] rounded-2xl border border-[#e2bec2]/40 dark:border-white/10 p-6 flex flex-col justify-between shadow-sm transition-colors duration-200">
          <h3 className="text-xs font-black text-[#b80149] dark:text-[#ff3366] uppercase tracking-wider mb-4 border-b border-[#e2bec2]/20 dark:border-white/5 pb-3">Fulfillment Pipeline</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            {/* Step 1: Ordered */}
            <div className="flex flex-col items-center text-center p-3 bg-[#f2f4f7]/40 dark:bg-[#1e2029]/30 rounded-2xl border border-[#e2bec2]/20 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-[#ffd9de] text-[#b80149] flex items-center justify-center font-bold mb-2">
                <ShoppingBag size={18} />
              </div>
              <p className="text-xs font-bold text-[#191c1e] dark:text-[#ebf1ff]">Ordered</p>
              <p className="text-[10px] text-[#878787] font-semibold mt-0.5">{pipelineStats.pending} pending</p>
            </div>

            {/* Step 2: Processing */}
            <div className="flex flex-col items-center text-center p-3 bg-[#f2f4f7]/40 dark:bg-[#1e2029]/30 rounded-2xl border border-[#e2bec2]/20 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold mb-2">
                <Loader2 size={18} className="animate-spin" />
              </div>
              <p className="text-xs font-bold text-[#191c1e] dark:text-[#ebf1ff]">Packed</p>
              <p className="text-[10px] text-[#878787] font-semibold mt-0.5">{pipelineStats.processing} processing</p>
            </div>

            {/* Step 3: Shipped */}
            <div className="flex flex-col items-center text-center p-3 bg-[#f2f4f7]/40 dark:bg-[#1e2029]/30 rounded-2xl border border-[#e2bec2]/20 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-2">
                <Calendar size={18} />
              </div>
              <p className="text-xs font-bold text-[#191c1e] dark:text-[#ebf1ff]">Shipped</p>
              <p className="text-[10px] text-[#878787] font-semibold mt-0.5">{pipelineStats.shipped} in transit</p>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center text-center p-3 bg-[#f2f4f7]/40 dark:bg-[#1e2029]/30 rounded-2xl border border-[#e2bec2]/20 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-2">
                <ShoppingCart size={18} />
              </div>
              <p className="text-xs font-bold text-[#191c1e] dark:text-[#ebf1ff]">Delivered</p>
              <p className="text-[10px] text-[#878787] font-semibold mt-0.5">{pipelineStats.delivered} total</p>
            </div>
          </div>
        </div>

        {/* performance status */}
        <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-[#e2bec2]/40 dark:border-white/10 p-6 flex flex-col justify-between shadow-sm transition-colors duration-200">
          <div>
            <h3 className="text-xs font-black text-[#b80149] dark:text-[#ff3366] uppercase tracking-wider mb-2 border-b border-[#e2bec2]/20 dark:border-white/5 pb-3">Performance Overview</h3>
            <p className="text-[11px] text-[#878787] font-medium leading-relaxed">Fulfillment rate and database syncing are stable.</p>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-black text-[#878787] uppercase tracking-wider">Total Active Orders</span>
            <p className="text-2xl font-bold text-[#db2b60] mt-0.5">{Array.isArray(orders) ? orders.length : 0} Records</p>
          </div>
        </div>
      </div>

      {/* Orders Filter List */}
      <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-[#e2bec2]/40 dark:border-white/10 overflow-hidden flex flex-col transition-colors duration-200">
        {/* Controls header */}
        <div className="p-4 border-b border-[#e2bec2]/20 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f2f4f7]/20 dark:bg-[#1e2029]/20">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1.5 sm:pb-0">
            {["All", "Pending", "Processing", "Shipped", "Delivered"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status 
                    ? "bg-[#db2b60] text-white" 
                    : "bg-white dark:bg-[#1e2029] border border-[#e2bec2]/40 text-[#5a4044] dark:text-[#a3b0cc]"
                }`}
              >
                {status} Orders
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787]" />
            <input 
              type="text" 
              placeholder="Search by ID or customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[#e2bec2]/40 bg-white dark:bg-[#1e2029] text-xs outline-none"
            />
          </div>
        </div>

        {/* High Density Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f2f4f7] dark:bg-[#1e2029] text-xs font-bold text-[#5a4044] dark:text-[#a3b0cc] border-b border-[#e2bec2]/40 dark:border-white/10 uppercase tracking-wider">
                <th className="p-4 w-36">Order ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4 w-40">Order Date</th>
                <th className="p-4 w-32 text-right">Amount</th>
                <th className="p-4 w-32">Payment</th>
                <th className="p-4 w-52">Fulfillment Status &amp; Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2bec2]/20 dark:divide-white/5">
              {filteredOrders.map((o) => {
                const isExpanded = expandedOrderId === o._id;
                const orderDate = o.date ? new Date(o.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A';

                // Highlight delays or row backgrounds
                const threshold = 48 * 60 * 60 * 1000;
                const isDelayedRow = o.date ? ((Date.now() - new Date(o.date).getTime()) > threshold && (o.status === 'Pending' || o.status === 'Processing')) : false;
                const rowBg = isExpanded 
                  ? "bg-[#ffd9de]/5" 
                  : isDelayedRow 
                    ? "bg-red-500/5" 
                    : "";

                return (
                  <React.Fragment key={o._id}>
                    <tr 
                      onClick={() => setExpandedOrderId(isExpanded ? null : o._id)}
                      className={`cursor-pointer transition-colors duration-150 hover:bg-[#f2f4f7]/30 dark:hover:bg-[#1e2029]/30 ${rowBg}`}
                    >
                      {/* ID */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isDelayedRow ? 'bg-red-600 animate-ping' : 'bg-transparent'}`}></span>
                          <span className="text-xs font-black font-mono text-[#db2b60]">
                            #{o._id ? o._id.substring(0, 8).toUpperCase() : 'ORD'}
                          </span>
                        </div>
                      </td>

                      {/* Customer info stack */}
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#191c1e] dark:text-[#ebf1ff] flex items-center gap-1">
                            <User size={12} className="text-[#db2b60]" />
                            {o.userName || o.address?.fullName || "Customer"}
                          </span>
                          <span className="text-[10px] text-[#878787] font-semibold mt-0.5 flex items-center gap-1">
                            <Mail size={10} />
                            {o.userEmail || o.address?.email || "customer@example.com"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 align-middle text-xs font-medium text-[#878787] whitespace-nowrap">{orderDate}</td>

                      {/* Amount */}
                      <td className="p-4 align-middle font-bold text-right text-xs text-[#191c1e] dark:text-white">₹{o.amount}</td>

                      {/* Payment Status badge */}
                      <td className="p-4 align-middle">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          o.payment 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-[#388E3C] border border-emerald-100" 
                            : "bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100"
                        }`}>
                          {o.payment ? "Paid" : "Unpaid"}
                        </span>
                      </td>

                      {/* Dropdown status togglers */}
                      <td onClick={(e) => e.stopPropagation()} className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <select
                            value={o.status}
                            disabled={o.status === "Delivered" || updatingOrderId === o._id}
                            onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                            className="h-8 px-2.5 rounded-lg border border-[#e2bec2]/50 bg-white dark:bg-[#1e2029] text-[11px] font-bold outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-[#191c1e] dark:text-white"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>

                          {updatingOrderId === o._id ? (
                            <Loader2 size={12} className="animate-spin text-[#db2b60]" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(o._id)}
                              title="Delete Order Record"
                              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 cursor-pointer border-none"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable address detail & itemized card drawer */}
                    {isExpanded && (
                      <tr className="bg-[#f2f4f7]/20 dark:bg-[#1e2029]/20">
                        <td colSpan="6" className="p-6">
                          <div className="bg-white dark:bg-[#12141c] border border-[#e2bec2]/40 dark:border-white/10 rounded-2xl p-5 shadow-sm animate-slide-down flex flex-col md:flex-row gap-6">
                            
                            {/* Shipping address details */}
                            <div className="flex-1">
                              <h4 className="text-xs font-black text-[#b80149] dark:text-[#ff3366] uppercase tracking-wider mb-3">📍 Shipping Destination</h4>
                              <div className="p-4 border border-[#e2bec2]/30 dark:border-white/5 bg-[#f2f4f7]/20 dark:bg-[#1e2029]/20 rounded-xl text-xs space-y-2 text-[#5a4044] dark:text-[#a3b0cc]">
                                <p><strong className="text-gray-800 dark:text-white">Customer Email:</strong> {o.userEmail || o.address?.email || o.email || "Registered Email"}</p>
                                <p><strong className="text-gray-800 dark:text-white">Contact Name:</strong> {o.address?.fullName || o.userName || "Customer"}</p>
                                <p><strong className="text-gray-800 dark:text-white">Street Address:</strong> {o.address?.addressLine}</p>
                                <p><strong className="text-gray-800 dark:text-white">City / Zipcode:</strong> {o.address?.city}, {o.address?.state} - {o.address?.postalCode}</p>
                                <p><strong className="text-gray-800 dark:text-white">Mobile Phone:</strong> {o.address?.phone}</p>
                              </div>
                            </div>

                            {/* Itemized purchased list */}
                            <div className="flex-1">
                              <h4 className="text-xs font-black text-[#b80149] dark:text-[#ff3366] uppercase tracking-wider mb-3">📦 Purchased Items</h4>
                              <div className="flex flex-col gap-2.5">
                                {(o.items || []).map((item, idx) => {
                                  const prodDetails = products.find(p => p.id === item.productId);
                                  return (
                                    <div key={idx} className="p-3 border border-[#e2bec2]/30 dark:border-white/5 bg-[#f2f4f7]/20 dark:bg-[#1e2029]/20 rounded-xl flex items-center justify-between gap-3 text-xs">
                                      <div className="flex items-center gap-3">
                                        <img 
                                          src={prodDetails?.image || item.image || ""} 
                                          alt={item.name} 
                                          className="w-9 h-11 object-cover rounded border border-[#e2bec2]/40"
                                          onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'flex'); }}
                                        />
                                        <div className="hidden w-9 h-11 rounded border border-[#e2bec2]/40 bg-white font-bold items-center justify-center">
                                          {item.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-bold text-[#191c1e] dark:text-white truncate w-36">{item.name}</span>
                                          <span className="text-[10px] text-[#878787] mt-0.5">Size: {item.size || "M"} &bull; Color: {item.color || "Standard"} &bull; Qty: {item.quantity}</span>
                                        </div>
                                      </div>
                                      <span className="font-bold text-gray-800 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-sm font-medium text-[#878787]">
                    No customer orders found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
