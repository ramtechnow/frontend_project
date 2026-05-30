const Product = require('../models/Product');

// Add a new product (Admin Only)
exports.addProduct = async (req, res) => {
  try {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id + 1;
    } else {
      id = 1;
    }
    
    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      sizes: req.body.sizes,
      colors: req.body.colors,
      stockCount: req.body.stockCount,
    });
    
    await product.save();
    console.log("Saved Product successfully:", req.body.name);
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Remove a product (Admin Only)
exports.removeProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ id: req.body.id });
    if (deletedProduct) {
      console.log("Removed Product successfully:", deletedProduct.name);
      res.json({
        success: true,
        name: deletedProduct.name,
      });
    } else {
      res.status(404).json({ success: false, error: "Product not found" });
    }
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    let products = await Product.find({});
    
    // Dynamically replace the image host with the current request's host and protocol
    const host = req.get('host');
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('192.168.') || host.includes('10.') ? req.protocol : 'https';
    
    const updatedProducts = products.map(prod => {
      const prodObj = prod.toObject();
      if (prodObj.image && prodObj.image.includes('/images/')) {
        const imageName = prodObj.image.split('/images/')[1];
        prodObj.image = `${protocol}://${host}/images/${imageName}`;
      }
      return prodObj;
    });

    console.log("All Products fetched and host-mapped dynamically");
    res.send(updatedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update a product (Admin Only)
exports.updateProduct = async (req, res) => {
  try {
    const { id, name, new_price, old_price, stockCount } = req.body;
    const updatedProduct = await Product.findOneAndUpdate(
      { id: Number(id) },
      { 
        $set: { 
          name, 
          new_price: Number(new_price), 
          old_price: Number(old_price), 
          stockCount: Number(stockCount) 
        } 
      },
      { new: true }
    );
    if (updatedProduct) {
      console.log("Updated Product successfully:", updatedProduct.name);
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404).json({ success: false, error: "Product not found" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
