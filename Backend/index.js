require('dotenv').config();
const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('./models/Product');
const User = require('./models/User');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database connection with mongodb //
async function seedDatabase() {
  const srcDir = path.join(__dirname, '../frontend_project/src/Components/Assets');
  const destDir = path.join(__dirname, 'upload', 'images');

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  let copiedCount = 0;
  for (let i = 1; i <= 36; i++) {
    const fileName = `product_${i}.png`;
    const srcPath = path.join(srcDir, fileName);
    const destPath = path.join(destDir, fileName);
    if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      copiedCount++;
    }
  }
  if (copiedCount > 0) {
    console.log(`📂 Copied ${copiedCount} product assets to backend static upload folder.`);
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.log("🌱 Database is empty. Seeding 36 products into MongoDB...");
    const sampleProducts = [];

    for (let i = 1; i <= 36; i++) {
      let name = "";
      let category = "";
      let new_price = 85.0;
      let old_price = 120.5;

      if (i <= 12) {
        name = "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse";
        category = "women";
        if (i === 1) { new_price = 50.0; old_price = 80.5; }
        else if (i === 2) { new_price = 85.0; old_price = 120.5; }
        else if (i === 3) { new_price = 60.0; old_price = 100.5; }
        else if (i === 4) { new_price = 100.0; old_price = 150.0; }
      } else if (i <= 24) {
        name = "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket";
        category = "men";
      } else {
        name = "Boys Orange Colourblocked Hooded Sweatshirt";
        category = "kid";
      }

      sampleProducts.push({
        id: i,
        name,
        category,
        image: `http://localhost:${port}/images/product_${i}.png`,
        new_price,
        old_price,
      });
    }

    await Product.insertMany(sampleProducts);
    console.log("✅ Seeded 36 products into MongoDB successfully!");
  }

  const adminCheck = await User.findOne({ email: "Admin@gmail.com" });
  if (!adminCheck) {
    console.log("🌱 Seeding Admin user...");
    const admin = new User({
      name: "Admin",
      email: "Admin@gmail.com",
      password: "Admin@1234",
      isAdmin: true,
      cartData: {},
    });
    await admin.save();
    console.log("✅ Admin user (Admin@gmail.com) pre-seeded successfully!");
  }
}

async function connectDatabase() {
  let mongoUri = process.env.MONGO_URI;

  try {
    if (!mongoUri) {
      console.log("⚠️  No MONGO_URI specified in .env. Starting In-Memory MongoDB Server...");
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`🚀 Ephemeral In-Memory MongoDB Server running at: ${mongoUri}`);
    }

    mongoose.connection.on('error', (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully!");
    await seedDatabase();
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);

    try {
      console.log("⚠️ Falling back to an in-memory MongoDB Server...");
      const fallbackServer = await MongoMemoryServer.create();
      const fallbackUri = fallbackServer.getUri();
      await mongoose.connect(fallbackUri);
      console.log(`🚀 Ephemeral In-Memory MongoDB Server running at: ${fallbackUri}`);
      await seedDatabase();
    } catch (fallbackError) {
      console.error("❌ Failed to start fallback in-memory MongoDB:", fallbackError);
      process.exit(1);
    }
  }
}

const startServer = async () => {
  await connectDatabase();
  app.listen(port, (error) => {
    if (!error) {
      console.log("Server Running on port " + port);
    } else {
      console.log("Error: " + error);
    }
  });
};

// Creating Middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET || 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
  }
};

// Creating Middleware to fetch user and verify admin
const fetchAdmin = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET || 'secret_ecom');
      if (data.user && data.user.isAdmin) {
        req.user = data.user;
        next();
      } else {
        res.status(403).send({ errors: "Access denied. Admin privileges required." });
      }
    } catch (error) {
      res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
  }
};

// API CREATION
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Image Storage Engine
const uploadDir = path.join(__dirname, 'upload', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cd) => {
    cd(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Create upload endpoint of images
app.use('/images', express.static(uploadDir));

app.post("/upload", upload.single('product'), (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  res.json({
    success: 1,
    image_url: `${protocol}://${host}/images/${req.file.filename}`
  })
})

// Schema for adding products API
app.post("/addproduct", fetchAdmin, async (req, res) => {
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
});

// Creating API for deleting products
app.post("/removeproduct", fetchAdmin, async (req, res) => {
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
});

// Creating API for getting all products
app.get("/allproducts", async (req, res) => {
  try {
    let products = await Product.find({});
    
    // Dynamically replace the image host with the current request's host and protocol!
    // This ensures product images load correctly both locally and on Render.
    const host = req.get('host');
    const protocol = req.protocol;
    
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
});

// Creating Endpoint for registering the user
app.post('/signup', async (req, res) => {
  try {
    let check = await User.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: false, errors: "Existing user found with same email address" });
    }
    
    // Initialize an empty cart object
    let cart = {};

    const user = new User({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });

    await user.save();

    const data = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    }
    const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom');
    res.json({ success: true, token });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Creating endpoint for user login
app.post('/login', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = {
          user: {
            id: user.id,
            isAdmin: user.isAdmin
          }
        }
        const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom');
        res.json({ success: true, token });
      } else {
        res.json({ success: false, errors: "Wrong Password" });
      }
    } else {
      res.json({ success: false, errors: "Wrong Email Address" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    
    const itemKey = req.body.itemId; 
    const size = req.body.size;
    const key = size ? `${itemKey}-${size}` : `${itemKey}`;

    if (!userData.cartData) {
      userData.cartData = {};
    }

    if (userData.cartData[key]) {
      userData.cartData[key].quantity += 1;
    } else {
      userData.cartData[key] = {
        id: Number(itemKey),
        size: size || "M",
        quantity: 1
      };
    }

    userData.markModified('cartData');
    await userData.save();
    console.log("Added to cart database successfully!");
    res.send({ success: true, message: "Added to cart successfully" });
  } catch (error) {
    console.error("Error in addtocart:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Creating endpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    const key = req.body.key || req.body.itemId; 

    if (userData.cartData && userData.cartData[key]) {
      if (userData.cartData[key].quantity > 1) {
        userData.cartData[key].quantity -= 1;
      } else {
        delete userData.cartData[key];
      }
      userData.markModified('cartData');
      await userData.save();
      console.log("Removed from cart database successfully!");
      res.send({ success: true, message: "Removed from cart successfully" });
    } else {
      res.status(400).send({ success: false, error: "Item not in cart" });
    }
  } catch (error) {
    console.error("Error in removefromcart:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Creating endpoint to get cart data
app.get('/getcart', fetchUser, async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    console.log("Cart data fetched successfully!");
    res.json(userData.cartData || {});
  } catch (error) {
    console.error("Error in getcart:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

startServer();
