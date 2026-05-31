import React, { useContext } from 'react';
import { WishlistContext } from '../Context/WishlistContext';
import { ShopContext } from '../Context/ShopContext';
import { Item } from '../Components/Item/Item';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Wishlist = () => {
  const { wishlistItems } = useContext(WishlistContext);
  const { all_product } = useContext(ShopContext);
  const navigate = useNavigate();

  // Filter products in wishlist
  const wishlistedProducts = all_product.filter(prod => 
    wishlistItems.includes(Number(prod.id))
  );

  return (
    <motion.div 
      className="w-full max-w-7xl mx-auto px-4 py-12 min-h-[70vh] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Title */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
        <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl">
          <Heart size={24} className="fill-rose-500 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Wishlist
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved in your favorites
          </p>
        </div>
      </div>

      {/* Grid or Empty State */}
      {wishlistedProducts.length === 0 ? (
        <motion.div 
          className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto my-12 space-y-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative p-6 bg-white dark:bg-slate-950 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700">
            <Heart size={48} className="text-slate-300 dark:text-slate-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart size={20} className="text-rose-400/30 dark:text-rose-500/20 fill-rose-500/10" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
              Explore our latest catalog, search hot collections, and tap the heart icon to save products here!
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all active:scale-98"
          >
            <ShoppingBag size={14} />
            Explore Store
            <ArrowRight size={12} />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlistedProducts.map((item) => (
            <div key={item.id} className="flex justify-center">
              <Item {...item} />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Wishlist;
