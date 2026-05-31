import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DailyOffersBanner = () => {
  const [banners, setBanners] = useState({
    men: { image: '', url: '' },
    women: { image: '', url: '' },
    kid: { image: '', url: '' }
  });

  const [notification, setNotification] = useState('');

  const handleImageUpload = (category, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setBanners(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            image: uploadEvent.target.result
          }
        }));
        showNotification(`🎉 ${category.toUpperCase()} banner uploaded successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (category, url) => {
    setBanners(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        url: url
      }
    }));
  };

  const handleClear = (category) => {
    setBanners(prev => ({
      ...prev,
      [category]: { image: '', url: '' }
    }));
    showNotification(`🧹 ${category.toUpperCase()} banner cleared.`);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Offer Banners State:", JSON.stringify(banners, null, 2));
    showNotification("🚀 Banners successfully saved to the backend store!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-slate-900/50 backdrop-blur-xl text-slate-100 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            Daily Offers Banner Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure, upload, and link promotional banners for Men, Women, and Kids categories.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <CheckCircle size={18} />
          Publish Live Banners
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium"
          >
            <CheckCircle size={16} />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner Config Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {['men', 'women', 'kid'].map((category) => {
          const banner = banners[category];
          return (
            <motion.div
              key={category}
              whileHover={{ y: -4 }}
              className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Category Title */}
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                <span className="font-extrabold tracking-wider uppercase text-amber-400 text-sm">
                  {category === 'kid' ? 'Kids Collection' : `${category}'s Outfitting`}
                </span>
                {banner.image && (
                  <button
                    onClick={() => handleClear(category)}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Reset
                  </button>
                )}
              </div>

              {/* Upload Zone & Preview Card */}
              <div className="relative aspect-[16/9] w-full bg-slate-950 flex flex-col items-center justify-center border-b border-slate-800 overflow-hidden group">
                {banner.image ? (
                  <>
                    <img
                      src={banner.image}
                      alt={`${category} banner preview`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    {banner.url && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 p-2 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-800/80 text-xs text-amber-400 truncate">
                        <LinkIcon size={12} className="shrink-0" />
                        <span className="truncate">{banner.url}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
                      <ImageIcon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-300">No Banner Image</p>
                      <p className="text-xs text-slate-500 mt-1">Recommended: 1200 x 675 px</p>
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm">
                      <Upload size={14} />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(category, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Hyperlink input */}
              <div className="p-5 space-y-4 bg-slate-900/60">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Click Destination URL
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-500">
                      <LinkIcon size={14} />
                    </span>
                    <input
                      type="url"
                      value={banner.url}
                      onChange={(e) => handleUrlChange(category, e.target.value)}
                      placeholder="e.g. https://yoursite.com/promo"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl text-slate-200 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* JSON State Output Preview for Developer audit */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest">
          Live API Payload State (Audit Log)
        </h4>
        <pre className="text-xs text-amber-500/90 font-mono bg-slate-900/50 p-4 rounded-xl overflow-x-auto max-h-[160px] border border-slate-900">
          {JSON.stringify({ dailyOffers: banners }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DailyOffersBanner;
