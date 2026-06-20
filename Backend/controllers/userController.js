const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// User Registration / Signup
exports.signup = async (req, res) => {
  try {
    let check = await User.findOne({ email: { $regex: new RegExp("^" + req.body.email + "$", "i") } });
    if (check) {
      return res.status(400).json({ success: false, errors: "Existing user found with same email address" });
    }
    
    // Initialize an empty cart object
    let cart = {};

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      cartData: cart,
    });

    await user.save();

    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
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
    let user = await User.findOne({ email: { $regex: new RegExp("^" + req.body.email + "$", "i") } });
    if (user) {
      let passCompare = false;
      
      // Compatibility and secure migration check:
      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
        passCompare = await bcrypt.compare(req.body.password, user.password);
      } else {
        // Plain text fallback (for legacy database entries)
        passCompare = req.body.password === user.password;
        if (passCompare) {
          // Migrate plain text password to secure bcrypt hash on-the-fly
          user.password = await bcrypt.hash(req.body.password, 10);
          await user.save();
          console.log(`🔒 Migrated plain text password for ${user.email} to bcrypt hash on login.`);
        }
      }

      if (passCompare) {
        const data = {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
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

// Fetch User's Wishlist
exports.getWishlist = async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    console.log("Wishlist data fetched successfully!");
    res.json(userData.wishlistData || []);
  } catch (error) {
    console.error("Error in getwishlist:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Add product to user's wishlist
exports.addToWishlist = async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    const itemId = Number(req.body.itemId);

    if (!userData.wishlistData) {
      userData.wishlistData = [];
    }

    if (!userData.wishlistData.includes(itemId)) {
      userData.wishlistData.push(itemId);
      userData.markModified('wishlistData');
      await userData.save();
      console.log(`Added product ${itemId} to user ${userData.email} wishlist`);
    }

    res.send({ success: true, message: "Added to wishlist successfully", wishlist: userData.wishlistData });
  } catch (error) {
    console.error("Error in addtowishlist:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Remove product from user's wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    const itemId = Number(req.body.itemId);

    if (userData.wishlistData && userData.wishlistData.includes(itemId)) {
      userData.wishlistData = userData.wishlistData.filter(id => id !== itemId);
      userData.markModified('wishlistData');
      await userData.save();
      console.log(`Removed product ${itemId} from user ${userData.email} wishlist`);
      res.send({ success: true, message: "Removed from wishlist successfully", wishlist: userData.wishlistData });
    } else {
      res.status(400).send({ success: false, error: "Item not in wishlist" });
    }
  } catch (error) {
    console.error("Error in removefromwishlist:", error);
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
      { email: { $regex: new RegExp("^" + email + "$", "i") } },
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
    const deletedUser = await User.findOneAndDelete({ email: { $regex: new RegExp("^" + email + "$", "i") } });
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

// Admin: Verify admin token credentials
exports.verifyAdmin = async (req, res) => {
  try {
    // req.user has already been set and validated by fetchAdmin middleware
    const user = await User.findById(req.user.id, { name: 1, email: 1, isAdmin: 1 });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, error: "Access denied. Admin privileges required." });
    }
    res.json({ success: true, user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error("Error verifying admin status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Provider-agnostic SMS OTP sender helper
async function sendSMS(phone, otp) {
  if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE) {
    try {
      const sid = process.env.TWILIO_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      
      const authHeader = 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phone,
          From: from,
          Body: `Your SHOPPER login OTP code is: ${otp}. It is valid for 5 minutes.`
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Real SMS dispatched via Twilio to ${phone}: SID ${data.sid}`);
        return true;
      } else {
        console.error(`❌ Twilio API Error: ${data.message}`);
        return false;
      }
    } catch (err) {
      console.error("❌ Failed to connect to Twilio SMS API:", err);
      return false;
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`📱 SMS OTP SENT TO: ${phone}`);
    console.log(`💬 CODE: [ ${otp} ]`);
    console.log(`======================================================\n`);
    return true;
  }
}

// Transactional Email OTP sender helper using Nodemailer
async function sendEmail(email, subject, html) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || 'bvhss20@gmail.com';
  const pass = process.env.SMTP_PASS || 'yqup nkss xket bpkt';

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false // Avoid connection drops due to local certificate issues
      }
    });
    await transporter.sendMail({
      from: `"SHOPPER Support" <${user}>`,
      to: email,
      subject: subject,
      html: html
    });
    console.log(`✉️ Email successfully sent to ${email}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to send transactional email:", err);
    return false;
  }
}

// POST: Send OTP to Indian phone number for login/registration
exports.sendLoginOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\+91[6789]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, errors: "Invalid Indian mobile number. Format: +91XXXXXXXXXX" });
    }

    // Rate limiting: 60s cooldown per number
    const lastOtp = await OTP.findOne({ target: phone, type: 'login' }).sort({ createdAt: -1 });
    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.createdAt).getTime();
      if (diff < 60000) {
        return res.status(429).json({ success: false, errors: `Please wait ${Math.ceil((60000 - diff) / 1000)} seconds before requesting a new OTP.` });
      }
    }

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Overwrite any existing active OTP for this phone
    await OTP.deleteMany({ target: phone, type: 'login' });
    const otpDoc = new OTP({ target: phone, otp: otpCode, type: 'login' });
    await otpDoc.save();

    // Send SMS
    await sendSMS(phone, otpCode);

    res.json({ success: true, message: "OTP sent successfully to your mobile number.", cooldown: 60 });
  } catch (error) {
    console.error("Error in sendLoginOtp:", error);
    res.status(500).json({ success: false, errors: "Internal Server Error" });
  }
};

// POST: Verify Phone OTP and log user in / register them
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, errors: "Phone number and OTP code are required" });
    }

    // Find the latest OTP for the number
    const otpRecord = await OTP.findOne({ target: phone, type: 'login' });
    if (!otpRecord) {
      return res.status(400).json({ success: false, errors: "OTP code has expired or is invalid. Please request a new one." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, errors: "Incorrect OTP. Please check the code and try again." });
    }

    // Delete verified OTP from database
    await OTP.deleteOne({ _id: otpRecord._id });

    // Check if user already exists by phone number
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Auto-register user since their phone is verified
      user = new User({
        name: name || `Shopper_${phone.slice(-4)}`,
        phone,
        email: `${phone.replace('+', '')}@shopper.in`, // Generate fallback unique email
        cartData: {},
        wishlistData: []
      });
      await user.save();
    }

    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    };
    const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom');
    
    res.json({ 
      success: true, 
      token, 
      isNewUser, 
      user: { 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        isAdmin: user.isAdmin 
      } 
    });
  } catch (error) {
    console.error("Error in verifyLoginOtp:", error);
    res.status(500).json({ success: false, errors: "Internal Server Error" });
  }
};

// POST: Forgot password (sends OTP code to email)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, errors: "Valid email address is required" });
    }

    const user = await User.findOne({ email: { $regex: new RegExp("^" + email + "$", "i") } });

    // Always return generic success message to prevent user enumeration
    const genericResponse = { 
      success: true, 
      message: "If your email is registered in our system, you will receive a 6-digit OTP code to reset your password shortly." 
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Rate limiting: 60s cooldown per email
    const lastOtp = await OTP.findOne({ target: email, type: 'reset' }).sort({ createdAt: -1 });
    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.createdAt).getTime();
      if (diff < 60000) {
        return res.status(429).json({ success: false, errors: `Please wait ${Math.ceil((60000 - diff) / 1000)} seconds before requesting a new reset code.` });
      }
    }

    // Generate 6-digit reset OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Overwrite OTP
    await OTP.deleteMany({ target: email, type: 'reset' });
    const otpDoc = new OTP({ target: email, otp: otpCode, type: 'reset' });
    await otpDoc.save();

    // Send email
    const subject = "SHOPPER - Password Reset Verification Code";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #ff4141; text-align: center;">SHOPPER Account Recovery</h2>
        <p>Hello ${user.name || 'Shopper Customer'},</p>
        <p>We received a request to reset your password. Use the verification code below to complete the reset process. This code is valid for 5 minutes.</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333;">${otpCode}</span>
        </div>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #888; text-align: center;">SHOPPER E-Commerce Team &bull; Secure Password Reset Service</p>
      </div>
    `;
    await sendEmail(email, subject, html);

    res.json(genericResponse);
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ success: false, errors: "Internal Server Error" });
  }
};

// POST: Reset password (verifies OTP code and sets new password)
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, errors: "Email, OTP code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, errors: "Password must be at least 6 characters long" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ target: email, type: 'reset' });
    if (!otpRecord) {
      return res.status(400).json({ success: false, errors: "Reset code has expired or is invalid. Please request a new code." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, errors: "Incorrect verification code. Please try again." });
    }

    // Find user and update password
    const user = await User.findOne({ email: { $regex: new RegExp("^" + email + "$", "i") } });
    if (!user) {
      return res.status(400).json({ success: false, errors: "We were unable to complete the request. User not found." });
    }

    // Hash new password using bcryptjs
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete verified OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ success: true, message: "Your password has been successfully reset! You can now log in." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ success: false, errors: "Internal Server Error" });
  }
};

// POST: Firebase Authentication user synchronization
exports.firebaseSync = async (req, res) => {
  try {
    const { phone, uid, name } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, errors: "Phone number is required for user sync" });
    }

    // Find user by phone number
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Auto-register user since their phone is verified by Firebase
      user = new User({
        name: name || `Shopper_${phone.slice(-4)}`,
        phone,
        email: `${phone.replace('+', '')}@shopper.in`, // Generate unique placeholder email
        cartData: {},
        wishlistData: []
      });
      await user.save();
    }

    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    };
    
    const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom');
    
    res.json({
      success: true,
      token,
      isNewUser,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("Error in firebaseSync:", error);
    res.status(500).json({ success: false, errors: "Internal Server Error" });
  }
};


