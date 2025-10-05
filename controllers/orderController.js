import Order from "../Models/Order.js";
import Cart from "../Models/Cart.js";
import FishStock from "../Models/fishStock.js";
import Product from "../Models/product.js";

// Place order
export const placeOrder = async (req, res) => {
  try {
    const { email, shippingAddress, paymentMethod, subtotal, shipping, tax, totalAmount } = req.body;

    const cart = await Cart.findOne({ userEmail: email }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
    }));

    // Check inventory availability and reduce stock
    for (const item of cart.items) {
      const product = item.product;
      const fishStock = await FishStock.findOne({ fishCode: product.fishCode });
      
      if (!fishStock) {
        return res.status(400).json({ 
          message: `Product ${product.title} not found in inventory` 
        });
      }

      if (fishStock.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}. Available: ${fishStock.stock}, Requested: ${item.quantity}` 
        });
      }

      // Reduce inventory
      fishStock.stock -= item.quantity;
      await fishStock.save();
    }

    // Use the totalAmount from frontend if provided, otherwise calculate from items
    const finalTotalAmount = totalAmount || orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = new Order({
      userEmail: email,
      items: orderItems,
      totalAmount: finalTotalAmount,
      shippingAddress,
      payment: {
        method: paymentMethod || "cash_on_delivery",
      },
      // Store additional totals for reference
      subtotal: subtotal || orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      shipping: shipping || 0,
      tax: tax || 0,
    });

    await order.save();
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User orders
export const getUserOrders = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ userEmail: email, isInHistory: false }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User order history
export const getUserOrderHistory = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ userEmail: email, isInHistory: true }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// All orders (active only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isInHistory: false }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// All order history (admin)
export const getAllOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ isInHistory: true }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const previousStatus = order.status;
    order.status = status;
    
    // Automatically move to history when delivered
    if (status === 'delivered' && !order.isInHistory) {
      order.isInHistory = true;
    }
    
    await order.save();

    // If order is being cancelled, restore inventory
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      await restoreInventoryForOrder(order);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to restore inventory for a cancelled order
const restoreInventoryForOrder = async (order) => {
  try {
    for (const item of order.items) {
      // Find the product to get the fishCode
      const product = await Product.findById(item.product);
      if (product) {
        const fishStock = await FishStock.findOne({ fishCode: product.fishCode });
        if (fishStock) {
          fishStock.stock += item.quantity;
          await fishStock.save();
        }
      }
    }
  } catch (error) {
    console.error('Error restoring inventory for order:', error);
  }
};

// Move order to history (instead of deleting)
export const moveOrderToHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow moving delivered orders to history
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: "Only delivered orders can be moved to history" });
    }

    // Mark order as in history and set status to delivered
    order.isInHistory = true;
    order.status = 'delivered';
    await order.save();

    res.json({ message: "Order moved to history successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete order (keep for admin purposes)
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow deletion of delivered orders
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: "Only delivered orders can be deleted" });
    }

    await Order.findByIdAndDelete(orderId);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
