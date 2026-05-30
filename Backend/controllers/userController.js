const User = require('../models/User');
const jwt = require('jsonwebtoken');

// User Registration / Signup
exports.signup = async (req, res) => {
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
    };
    const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom');
    res.json({ success: true, token });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// User Login
exports.login = async (req, res) => {
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
        };
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
};

// Fetch User's Cart
exports.getCart = async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    console.log("Cart data fetched successfully!");
    res.json(userData.cartData || {});
  } catch (error) {
    console.error("Error in getcart:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Add product to user's cart
exports.addToCart = async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    
    const itemKey = req.body.itemId; 
    const size = req.body.size;
    const color = req.body.color;
    const key = (size && color) ? `${itemKey}-${size}-${color}` : (size ? `${itemKey}-${size}` : `${itemKey}`);

    if (!userData.cartData) {
      userData.cartData = {};
    }

    if (userData.cartData[key]) {
      userData.cartData[key].quantity += 1;
    } else {
      userData.cartData[key] = {
        id: Number(itemKey),
        size: size || "M",
        color: color || "White",
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
};

// Remove product from user's cart
exports.removeFromCart = async (req, res) => {
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
};

// Admin: Get all registered user credentials and carts
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, isAdmin: 1, cartData: 1, date: 1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching registered users:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Admin: Toggle user admin status / role
exports.updateUserRole = async (req, res) => {
  try {
    const { email, isAdmin } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { isAdmin: Boolean(isAdmin) } },
      { new: true }
    );
    if (updatedUser) {
      console.log(`Updated user role for ${email}: isAdmin = ${isAdmin}`);
      res.json({ success: true, user: { name: updatedUser.name, email: updatedUser.email, isAdmin: updatedUser.isAdmin } });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Admin: Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const deletedUser = await User.findOneAndDelete({ email: email.toLowerCase() });
    if (deletedUser) {
      console.log(`Deleted user account: ${email}`);
      res.json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
