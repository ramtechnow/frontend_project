import React, { useContext } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WishlistContext } from '../../Context/WishlistContext';
import { Heart, Star } from 'lucide-react';

export const Item = (props) => {
  const { toggleWishlist, isWishlisted } = useContext(WishlistContext);
  const isFav = isWishlisted(props.id);

  // Dynamic Brand & Description parser (Extracts first 1-2 words as Brand, remainder as details)
  const getBrandAndDesc = (name) => {
    if (!name) return { brand: "Roadster", desc: "Casual Cotton Wear" };
    const parts = name.split(" ");
    if (parts.length <= 2) {
      return { brand: parts[0] || "Roadster", desc: parts.slice(1).join(" ") || "Casual Wear" };
    }
    const brand = parts[0] + (parts[1] && parts[1].length <= 4 ? " " + parts[1] : "");
    const desc = name.replace(brand, "").trim();
    return { brand, desc };
  };

  const { brand, desc } = getBrandAndDesc(props.name);

  // Calculate discount percentage
  const discount = props.old_price && props.old_price > props.new_price
    ? Math.round(((props.old_price - props.new_price) / props.old_price) * 100)
    : 0;

  // Inventory availability logic
  const inStock = props.inStock !== undefined 
    ? props.inStock 
    : (props.stockCount !== undefined ? props.stockCount > 0 : (props.id % 11 !== 0));

  // Deterministic Myntra-style Ratings & Reviews count based on ID
  const rating = ((props.id * 13) % 5 === 0 
    ? '4.1' 
    : (props.id * 13) % 5 === 1 
      ? '4.4' 
      : (props.id * 13) % 5 === 2 
        ? '4.2' 
        : (props.id * 13) % 5 === 3 
          ? '4.5' 
          : '4.3');
  
  const rawReviews = (props.id * 223 + 47) % 900 + 12;
  const reviewsText = rawReviews > 500 ? `${(rawReviews/100).toFixed(1)}k` : `${rawReviews}`;

  // Sizes formatting
  const sizesString = props.sizes && props.sizes.length > 0 
    ? props.sizes.join(', ') 
    : 'S, M, L, XL';

  return (
    <motion.div 
      className='item flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300'
      style={{ width: '100%', maxWidth: '280px' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4 }}
    >
      {/* Aspect Ratio Container (Myntra uses 3:4 portrait layout) */}
      <div className="relative overflow-hidden aspect-[3/4] bg-slate-50 dark:bg-slate-950">
        
        {/* Top-Left sponsored Ad Tag (mock) */}
        {props.id % 4 === 1 && (
          <div className="absolute top-2 left-2 z-10 bg-slate-900/60 backdrop-blur-md text-[8px] font-black uppercase text-white px-1.5 py-0.5 rounded tracking-widest">
            Ad
          </div>
        )}

        {/* Product Image Link */}
        <Link to={`/product/${props.id}`} className="block w-full h-full">
          <img 
            onClick={() => window.scrollTo(0, 0)} 
            src={props.image} 
            alt={props.name} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Rating overlay pill (Translucent bottom-left) */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md rounded text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-100/10 shadow-sm">
          <span>{rating}</span>
          <Star size={8} className="fill-emerald-500 text-emerald-500" />
          <span className="text-slate-400 dark:text-slate-500 font-normal">|</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">{reviewsText}</span>
        </div>

        {/* Wishlist Button Overlay (reveals on hover from bottom) */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-white dark:bg-slate-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center z-10 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(props.id);
            }}
            className={`w-full py-2 border text-[10px] font-extrabold tracking-wider uppercase rounded shadow-sm flex items-center justify-center gap-2 transition-all ${
              isFav 
                ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/30 dark:border-rose-900/50' 
                : 'bg-white border-slate-200 text-slate-700 hover:text-rose-500 hover:border-rose-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
            }`}
          >
            <Heart size={12} className={isFav ? "fill-rose-500 text-rose-500" : ""} />
            {isFav ? "WISHLISTED" : "WISHLIST"}
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-3.5 flex flex-col flex-grow">
        
        {/* Brand Name (Bold, Charcoal) */}
        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight truncate">
          {brand}
        </h4>

        {/* Available Sizes reveal on Hover, otherwise short description */}
        <div className="relative h-4 overflow-hidden mt-1 mb-2">
          <div className="absolute inset-0 transition-all duration-300 group-hover:-translate-y-full flex flex-col">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {desc}
            </span>
            <span className="text-[11px] text-amber-500 dark:text-amber-400 font-extrabold tracking-tight truncate">
              Sizes: {sizesString}
            </span>
          </div>
        </div>

        {/* Price layout: Myntra style (Rs. X crossed-out Y (Z% OFF)) */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-slate-900 dark:text-white font-extrabold text-xs">
              Rs. {props.new_price}
            </span>
            {props.old_price && (
              <>
                <span className="text-slate-400 dark:text-slate-500 line-through text-[10px] font-medium">
                  Rs. {props.old_price}
                </span>
                {discount > 0 && (
                  <span className="text-[10px] font-black text-rose-500 dark:text-rose-400 tracking-tight">
                    ({discount}% OFF)
                  </span>
                )}
              </>
            )}
          </div>

          {/* Real-time stock status badge */}
          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
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
