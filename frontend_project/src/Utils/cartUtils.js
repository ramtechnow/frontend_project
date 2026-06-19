// Generic cart utility helper functions for SHOPPER

/**
 * Adds an item or increments its quantity in the cart object
 * @param {Object} cart - Current cart state
 * @param {Object} product - Product to add
 * @param {String} size - Selected size
 * @param {String} color - Selected color
 * @param {Number} qty - Quantity to add
 * @returns {Object} Updated cart object
 */
export const addItemToCart = (cart, product, size = "M", color = "White", qty = 1) => {
  const key = `${product.id}-${size}-${color}`;
  const existing = cart[key];
  return {
    ...cart,
    [key]: {
      id: product.id,
      size,
      color,
      quantity: existing ? existing.quantity + qty : qty
    }
  };
};

/**
 * Removes an item completely from the cart object
 * @param {Object} cart - Current cart state
 * @param {String} key - Cart item key ("id-size-color")
 * @returns {Object} Updated cart object
 */
export const removeItemFromCart = (cart, key) => {
  const updated = { ...cart };
  delete updated[key];
  return updated;
};

/**
 * Updates the quantity of a specific cart item
 * @param {Object} cart - Current cart state
 * @param {String} key - Cart item key ("id-size-color")
 * @param {Number} newQty - New quantity value
 * @returns {Object} Updated cart object
 */
export const updateCartItemQuantity = (cart, key, newQty) => {
  if (newQty <= 0) {
    return removeItemFromCart(cart, key);
  }
  const item = cart[key];
  if (!item) return cart;
  return {
    ...cart,
    [key]: {
      ...item,
      quantity: newQty
    }
  };
};

/**
 * Calculates the total cost of all items in the cart
 * @param {Object} cart - Current cart state
 * @param {Array} productsList - Catalog array of all products
 * @returns {Number} Total cart price
 */
export const getCartTotal = (cart, productsList) => {
  let total = 0;
  for (const key in cart) {
    const item = cart[key];
    if (!item) continue;
    const product = productsList.find((p) => p.id === item.id);
    if (product) {
      total += product.new_price * (item.quantity || 0);
    }
  }
  return total;
};

/**
 * Calculates the total quantity of all items in the cart
 * @param {Object} cart - Current cart state
 * @returns {Number} Total item count
 */
export const getCartCount = (cart) => {
  let count = 0;
  for (const key in cart) {
    const item = cart[key];
    if (item) {
      count += Number(item.quantity) || 0;
    }
  }
  return count;
};
