import React, { useState } from 'react';
import { Plus, Minus, Trash2, Tag, ShoppingBag, DollarSign, Database, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductVariantEditor = () => {
  const [productId, setProductId] = useState('SHIRT-101');
  const [productName, setProductName] = useState('Classic Premium Cotton Oxford Shirt');
  const [variants, setVariants] = useState([
    { color: 'Black', price: 200, stock: 50 },
    { color: 'White', price: 180, stock: 35 },
    { color: 'Blue', price: 190, stock: 20 }
  ]);

  const [newColor, setNewColor] = useState('');
  const [newPrice, setNewPrice] = useState(150);
  const [newStock, setNewStock] = useState(10);

  const handleAddVariant = (e) => {
    e.preventDefault();
    if (!newColor.trim()) return;

    // Avoid duplicate colors case-insensitive
    const colorExists = variants.some(
      (v) => v.color.toLowerCase() === newColor.trim().toLowerCase()
    );
    if (colorExists) {
      alert(`⚠️ Variant with color "${newColor}" already exists!`);
      return;
    }

    setVariants(prev => [
      ...prev,
      {
        color: newColor.trim(),
        price: Number(newPrice) || 0,
        stock: Number(newStock) || 0
      }
    ]);

    // Reset inputs
    setNewColor('');
    setNewPrice(150);
    setNewStock(10);
  };

  const handleRemoveVariant = (colorName) => {
    setVariants(prev => prev.filter((v) => v.color !== colorName));
  };

  const handleUpdatePrice = (colorName, priceVal) => {
    setVariants(prev =>
      prev.map((v) =>
        v.color === colorName ? { ...v, price: Math.max(0, Number(priceVal)) } : v
      )
    );
  };

  const handleUpdateStock = (colorName, stockVal) => {
    setVariants(prev =>
      prev.map((v) =>
        v.color === colorName ? { ...v, stock: Math.max(0, Number(stockVal)) } : v
      )
    );
  };

  const adjustStockStep = (colorName, increment) => {
    setVariants(prev =>
      prev.map((v) => {
        if (v.color === colorName) {
          const currentStock = v.stock || 0;
          return { ...v, stock: Math.max(0, currentStock + increment) };
        }
        return v;
      })
    );
  };

  const totalStockCount = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-slate-900/50 backdrop-blur-xl text-slate-100 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles size={24} className="text-cyan-400 shrink-0" />
            Advanced Variant & Inventory Editor
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Build responsive SKU colors, direct row pricing matrix, and granular stock adjustments.
          </p>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-widest font-extrabold text-slate-500">
              Total Managed Stock
            </span>
            <span className="text-xl font-black text-cyan-400">
              {totalStockCount} Units
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Variant Creator & Product Meta */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShoppingBag size={16} className="text-cyan-400" />
              1. Product Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                  Product ID (SKU Prefix)
                </label>
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* New Variant Creator */}
          <form onSubmit={handleAddVariant} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Plus size={16} className="text-cyan-400" />
              2. Add New Variant
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                  Color Option Name
                </label>
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="e.g. Amber Red, Forest Green"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none transition-colors"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    min="0"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    min="0"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors mt-2"
              >
                <Plus size={16} />
                Create Variant SKU
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Variant Editor List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-300 flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Tag size={16} className="text-cyan-400" />
                Active Color SKUs & Stocks
              </span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md font-bold">
                {variants.length} Variants
              </span>
            </h3>

            {/* Variants rows */}
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {variants.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl"
                  >
                    No variants configured. Click "Create Variant SKU" above to add one.
                  </motion.div>
                ) : (
                  variants.map((v) => (
                    <motion.div
                      key={v.color}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-4 bg-slate-950 border border-slate-800 hover:border-slate-700/60 rounded-xl transition-all"
                    >
                      {/* Color label tag */}
                      <div className="md:col-span-3 flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-700 shadow-sm shrink-0"
                          style={{
                            backgroundColor: v.color.toLowerCase().replace(/\s+/g, '')
                          }}
                        />
                        <span className="font-extrabold text-slate-200 text-sm truncate">
                          {v.color}
                        </span>
                      </div>

                      {/* Price field */}
                      <div className="md:col-span-3 flex items-center relative">
                        <span className="absolute left-3 text-slate-500 text-xs">
                          <DollarSign size={12} />
                        </span>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => handleUpdatePrice(v.color, e.target.value)}
                          placeholder="Price"
                          className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg text-slate-200 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Inventory Adjuster (Buttons + Direct Field) */}
                      <div className="md:col-span-4 flex items-center gap-2 justify-between">
                        <button
                          type="button"
                          onClick={() => adjustStockStep(v.color, -1)}
                          className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-md transition-colors shrink-0"
                        >
                          <Minus size={12} />
                        </button>

                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleUpdateStock(v.color, e.target.value)}
                          className="w-full text-center py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg text-slate-200 text-xs font-bold focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => adjustStockStep(v.color, 1)}
                          className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-md transition-colors shrink-0"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Action delete */}
                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.color)}
                          className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Clean API Return Payload output preview */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
              <Database size={12} className="text-cyan-400" />
              Structured JSON Payload Output (Sent to PUT/POST API)
            </h4>
            <pre className="text-xs text-cyan-400/90 font-mono bg-slate-950 p-4 rounded-xl overflow-x-auto max-h-[160px] border border-slate-950">
              {JSON.stringify({
                productId,
                productName,
                totalStock: totalStockCount,
                variants
              }, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductVariantEditor;
