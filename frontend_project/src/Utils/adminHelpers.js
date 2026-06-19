/**
 * Compress an image file to JPEG format and return as Base64 string
 * Limits max resolution to 800px for optimal Mongo storage
 */
export const compressImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max_size = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 0.7 JPEG compression ratio
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Format number to US Currency style
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

/**
 * Normalize and render user-friendly category name
 */
export const normalizeCategory = (category) => {
  if (!category) return 'Uncategorized';
  const cat = category.toLowerCase();
  if (cat === 'kid' || cat === 'kids') return 'Kids';
  if (cat === 'men') return 'Men';
  if (cat === 'women') return 'Women';
  return category;
};
