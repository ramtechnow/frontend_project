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

    // 1. Fetch current order state to enforce Delivered lock
    const currentOrder = await Order.findById(orderId);
    if (!currentOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (currentOrder.status === "Delivered") {
      return res.status(400).json({ success: false, error: "Order is completed (Delivered) and status updates are locked." });
    }

    // 2. Perform status update and mark notificationSeen as false
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status, notificationSeen: false } },
      { new: true }
    );

    if (updatedOrder) {
      console.log(`Order ${orderId} status updated to: ${status}`);

      // 3. Trigger email notification if marked Delivered
      if (status === "Delivered") {
        try {
          const userDoc = await User.findById(updatedOrder.userId);
          if (userDoc && userDoc.email) {
            const { sendEmail } = require('./userController');
            const itemRows = updatedOrder.items.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ebdacf;">
                  <strong>${item.name}</strong><br>
                  <span style="font-size: 11px; color: #5c6270;">Size: ${item.size} | Color: ${item.color}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #ebdacf; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ebdacf; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('');

            const emailHtml = `
              <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ebdacf; border-radius: 8px; background-color: #ffffff; color: #151c27;">
                <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid rgba(184, 0, 53, 0.08); padding-bottom: 16px;">
                  <h1 style="color: #b80035; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">RamCart</h1>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #575e70; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Order Delivered Successfully</p>
                </div>
                
                <p>Hello <strong>${userDoc.name || 'Valued Customer'}</strong>,</p>
                <p>We are pleased to inform you that your order <strong>#RC-${updatedOrder._id.toString().substring(0,8).toUpperCase()}</strong> has been successfully delivered!</p>
                
                <div style="margin: 24px 0; padding: 18px; background-color: #F9FAFB; border: 1px solid #ebdacf; border-radius: 8px;">
                  <h4 style="margin: 0 0 12px 0; color: #151c27; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ebdacf; padding-bottom: 6px;">Delivery Details</h4>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                      <tr style="color: #575e70; border-bottom: 1px solid #ebdacf; text-align: left;">
                        <th style="padding: 8px 10px; font-weight: 700;">Item Description</th>
                        <th style="padding: 8px 10px; font-weight: 700; text-align: center;">Qty</th>
                        <th style="padding: 8px 10px; font-weight: 700; text-align: right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemRows}
                      <tr>
                        <td colspan="2" style="padding: 14px 10px 8px 10px; font-weight: 800; text-align: left; font-size: 14px;">Total Amount Charged</td>
                        <td style="padding: 14px 10px 8px 10px; font-weight: 800; text-align: right; color: #b80035; font-size: 14px;">₹${updatedOrder.amount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p style="font-size: 13px; line-height: 1.6; color: #575e70;">
                  Thank you for shopping with RamCart. We hope you love your new purchase! If you have any questions, feel free to visit your profile to manage your orders.
                </p>
                
                <div style="border-top: 1px solid #ebdacf; padding-top: 16px; margin-top: 32px; text-align: center; font-size: 11px; color: #5c3f40;">
                  © ${new Date().getFullYear()} RamCart. All rights reserved.<br>
                  This is an automated delivery update.
                </div>
              </div>
            `;

            // Trigger asynchronously
            sendEmail(userDoc.email, `Your RamCart Order is Delivered! (#RC-${updatedOrder._id.toString().substring(0,8).toUpperCase()})`, emailHtml)
              .catch(err => console.error("Error sending delivery email:", err));
          }
        } catch (emailErr) {
          console.error("Nodemailer routing failed:", emailErr);
        }
      }

      res.json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, error: "Order not found" });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get all unseen orders for user
exports.getUnseenOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId, notificationSeen: false });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching unseen orders:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Mark order notification as seen
exports.markOrderAsSeen = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ success: false, error: "Missing orderId field" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { $set: { notificationSeen: true } },
      { new: true }
    );

    if (updatedOrder) {
      res.json({ success: true, message: "Order notification marked as seen" });
    } else {
      res.status(404).json({ success: false, error: "Order not found" });
    }
  } catch (error) {
    console.error("Error marking order as seen:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
