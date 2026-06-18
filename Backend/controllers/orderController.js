const Order = require('../models/Order');
const User = require('../models/User');
const { incrementCouponUsage } = require('./couponController');

// Place a new Order (Authenticated User)
exports.placeOrder = async (req, res) => {
  try {
    const { items, amount, address, couponCode } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0 || !amount || !address) {
      return res.status(400).json({ success: false, error: "Missing required order details" });
    }

    // Create new Order document
    const newOrder = new Order({
      userId,
      items,
      amount,
      address,
      couponCode: couponCode || null,
      status: "Pending",
      payment: true,
    });

    await newOrder.save();

    // If a coupon was used, increment its usage counter
    if (couponCode) {
      await incrementCouponUsage(couponCode);
    }

    // Clear user's shopping cart on successful checkout
    await User.findByIdAndUpdate(userId, { $set: { cartData: {} } });

    console.log(`Order placed successfully by user ${userId}. Order ID: ${newOrder._id}`);
    res.json({ success: true, message: "Order placed successfully!", orderId: newOrder._id });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


// Get orders history for the authenticated user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get all orders (Admin Only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });
    
    // Resolve usernames or emails for visual reporting
    const userIds = orders.map(o => o.userId);
    const users = await User.find({ _id: { $in: userIds } }, { email: 1, name: 1 });
    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {});

    const enrichedOrders = orders.map(order => {
      const orderObj = order.toObject();
      const user = userMap[order.userId];
      orderObj.userEmail = user ? user.email : "Deleted User";
      orderObj.userName = user ? user.name : "Deleted User";
      return orderObj;
    });

    res.json(enrichedOrders);
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Order status (Admin Only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, error: "Missing order ID or status field" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { new: true }
    );

    if (updatedOrder) {
      console.log(`Order ${orderId} status updated to: ${status}`);
      res.json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, error: "Order not found" });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
