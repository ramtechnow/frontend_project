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

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

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
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('192.168.') || host.includes('10.') ? req.protocol : 'https';
  res.json({
    success: 1,
    image_url: `${protocol}://${host}/images/${req.file.filename}`
  })
});

// Use modular routes
app.use(productRoutes);
app.use(userRoutes);

startServer();
