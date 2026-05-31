import React, { useContext } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WishlistContext } from '../../Context/WishlistContext';
import { Heart } from 'lucide-react';

export const Item = (props) => {
  const { toggleWishlist, isWishlisted } = useContext(WishlistContext);
  const isFav = isWishlisted(props.id);

  // Calculate discount percentage
  const discount = props.old_price && props.old_price > props.new_price
    ? Math.round(((props.old_price - props.new_price) / props.old_price) * 100)
    : 0;

  // Inventory availability logic
  const inStock = props.inStock !== undefined 
    ? props.inStock 
    : (props.stockCount !== undefined ? props.stockCount > 0 : (props.id % 11 !== 0));

  return (
    <motion.div 
      className='item flex flex-col'
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <div className="relative overflow-hidden rounded-2xl group border border-slate-100 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900 aspect-[1/1.1]">
        {/* Top-Left Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-rose-500 text-white font-extrabold text-[10px] tracking-wide px-2 py-0.5 rounded-full shadow-md animate-pulse">
            -{discount}% OFF
          </div>
        )}

        {/* Top-Right Heart Wishlist Shortcut Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(props.id);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-full shadow-md hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-rose-500"
        >
          <Heart
            size={14}
            className={`${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}
          />
        </button>

        {/* Product Image */}
        <Link to={`/product/${props.id}`} className="block w-full h-full overflow-hidden">
          <img 
            onClick={() => window.scrollTo(0, 0)} 
            src={props.image} 
            alt={props.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Quick Add to Wishlist Button */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(props.id);
            }}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-[10px] font-extrabold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all"
          >
            <Heart size={12} className={isFav ? "fill-white text-white" : ""} />
            {isFav ? "Remove Favorite" : "Add to Wishlist"}
          </button>
        </div>
      </div>

      <div className="item-details p-2 flex flex-col flex-grow">
        <Link to={`/product/${props.id}`} className="no-underline">
          <p className="text-slate-700 dark:text-slate-300 font-bold text-sm line-clamp-2 hover:text-amber-500 transition-colors">{props.name}</p>
        </Link>
        
        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
          <div className="item-prices flex items-baseline gap-2">
            <span className="item-price-new text-slate-900 dark:text-white font-extrabold text-sm">
              ₹{props.new_price}
            </span>
            {props.old_price && (
              <span className="item-price-old text-slate-400 dark:text-slate-500 line-through text-xs font-semibold">
                ₹{props.old_price}
              </span>
            )}
          </div>

          {/* Real-time stock status visibility */}
          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
            inStock
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
