import Order from "../Models/Order.js";
import Cart from "../Models/Cart.js";

// Place order
export const placeOrder = async (req, res) => {
  try {
    const { email, shippingAddress, paymentMethod } = req.body;

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

    const totalAmount = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = new Order({
      userEmail: email,
      items: orderItems,
      totalAmount,
      shippingAddress,
      payment: {
        method: paymentMethod || "cash_on_delivery",
      },
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
    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// All orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
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

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
