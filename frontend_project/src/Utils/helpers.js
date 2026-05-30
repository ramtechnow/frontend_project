/**
 * Utility helper functions for frontend applications
 */

// Lists of premium sizes and colors
const SIZES_POOL = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS_POOL = ['Red', 'Blue', 'Green', 'Black', 'White', 'Pink', 'Grey', 'Orange', 'Yellow'];

// Helper to get default sizes
const getDefaultSizes = (id) => {
  if (id % 3 === 0) {
    return ['S', 'M', 'L'];
  } else if (id % 3 === 1) {
    return ['M', 'L', 'XL', 'XXL'];
  } else {
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }
};

// Helper to get default colors
const getDefaultColors = (id) => {
  let colors = [];
  const colorIndex1 = (id * 2) % COLORS_POOL.length;
  const colorIndex2 = (id * 3 + 1) % COLORS_POOL.length;
  const colorIndex3 = (id * 5 + 3) % COLORS_POOL.length;
  
  colors.push(COLORS_POOL[colorIndex1]);
  if (colorIndex1 !== colorIndex2) colors.push(COLORS_POOL[colorIndex2]);
  if (id % 2 === 0 && colorIndex1 !== colorIndex3 && colorIndex2 !== colorIndex3) {
    colors.push(COLORS_POOL[colorIndex3]);
  }
  return colors;
};

/**
 * Deterministically enriches a product object with key filtering properties:
 * size, color, availability, and formatted gender.
 * If sizes/colors exist in the database (added via Admin Console), those take absolute priority!
 * @param {Object} product - The raw product object
 * @returns {Object} The enriched product object
 */
export const enrichProduct = (product) => {
  if (!product) return null;
  
  const id = product.id || 1;

  // Use database values if specified, otherwise fall back to deterministic mock values
  const sizes = product.sizes && product.sizes.length > 0 
    ? product.sizes 
    : getDefaultSizes(id);

  const colors = product.colors && product.colors.length > 0 
    ? product.colors 
    : getDefaultColors(id);

  // Availability based on stock count or mock
  const inStock = product.stockCount !== undefined 
    ? product.stockCount > 0 
    : (id % 11 !== 0);

  // Gender mapping based on category
  let gender = 'Unisex';
  if (product.category === 'men') {
    gender = 'Men';
  } else if (product.category === 'women') {
    gender = 'Women';
  } else if (product.category === 'kid') {
    gender = 'Kids';
  }

  return {
    ...product,
    sizes,
    colors,
    inStock,
    gender
  };
};

/**
 * Enrich an array of products
 * @param {Array} productsList 
 * @returns {Array} Enriched products
 */
export const enrichProductsList = (productsList) => {
  if (!Array.isArray(productsList)) return [];
  return productsList.map(enrichProduct);
};
