// controllers/orderController.js
import mongoose from "mongoose";
import Cart from "../Models/Cart.js";
import Order from "../Models/Order.js";

const resolveUserId = (req) =>
  req.body?.userId ||
  req.user?.buyerId ||
  req.user?._id ||
  req.header("x-buyer-id") ||
  "guest";

/**
 * POST /api/orders/checkout
 */
export const checkout = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    console.log("📩 POST /api/orders/checkout →", userId);

    // 1) Load the user's cart with product info
    let cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2) Filter only items with valid populated product
    const items = (cart.items || [])
      .filter((item) => {
        if (!item.productId?._id) {
          console.warn("⚠️ Skipping invalid or deleted product in cart:", item);
          return false;
        }
        return true;
      })
      .map((item) => {
        const price = Number(item.productId.price ?? 0);
        const qty = Number(item.quantity ?? 1);
        return {
          productId: item.productId._id,
          quantity: qty > 0 ? qty : 1,
          price,
        };
      });

    if (items.length === 0) {
      return res.status(400).json({ message: "Cart had no valid products" });
    }

    // 3) Calculate totals
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // 4) Create order
    const order = new Order({ userId, items, total, status: "Pending" });
    await order.save();

    // 5) Clear the cart
    await Cart.findOneAndDelete({ userId });

    // 6) Return populated order
    const populated = await Order.findById(order._id).populate("items.productId");
    return res.status(201).json(populated);
  } catch (err) {
    console.error("❌ checkout error:", err);
    return res.status(500).json({
      message: "Checkout failed",
      error: err?.message || String(err),
    });
  }
};

/**
 * GET /api/orders/:userId
 */
export const getOrders = async (req, res) => {
  try {
    const userId =
      req.params?.userId ||
      req.user?.buyerId ||
      req.user?._id ||
      req.header("x-buyer-id") ||
      "guest";

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId");

    return res.status(200).json(orders);
  } catch (err) {
    console.error("❌ getOrders error:", err);
    return res.status(500).json({
      message: "Error fetching orders",
      error: err?.message || String(err),
    });
  }
};
