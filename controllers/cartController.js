// controllers/cartController.js
import mongoose from "mongoose";
import Cart from "../Models/Cart.js";

/** Prefer URL param for GETs so /api/cart/guest works reliably */
const resolveUserId = (req, preferParam = false) => {
  if (preferParam && req.params?.userId) return String(req.params.userId);
  return (
    req.body?.userId ||
    req.params?.userId ||
    req.user?.buyerId ||
    req.user?._id ||
    req.header("x-buyer-id") ||
    "guest"
  );
};

/**
 * POST /api/cart/add
 * Body: { userId?: string, productId: string, quantity?: number }
 */
export const addToCart = async (req, res) => {
  try {
    console.log("📩 POST /api/cart/add", req.body);
    const userId = resolveUserId(req);
    const rawProductId = req.body?.productId;
    const qty = Number(req.body?.quantity ?? 1);

    if (!rawProductId) {
      console.error("❌ addToCart: Missing productId");
      return res.status(400).json({ message: "Missing productId" });
    }
    const productId = String(rawProductId);
    const quantity = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const idx = cart.items.findIndex((i) => String(i.productId) === productId);
    if (idx > -1) cart.items[idx].quantity += quantity;
    else cart.items.push({ productId, quantity });

    await cart.save();

    const populated = await Cart.findById(cart._id)
      .populate("items.productId") // Model name MUST be "Product"
      .lean();

    return res.status(200).json(populated);
  } catch (err) {
    console.error("❌ addToCart error:", err);
    return res
      .status(500)
      .json({ message: "Error adding to cart", error: err?.message || String(err) });
  }
};

/**
 * GET /api/cart/:userId
 * Returns the cart (or empty) for provided userId.
 * This version SELF-REPAIRS bad productId entries to avoid 500s.
 */
export const getCart = async (req, res) => {
  const userId = resolveUserId(req, true); // force param
  console.log("📩 GET /api/cart/:userId →", userId);

  try {
    // 1) Load raw cart without populate
    let cart = await Cart.findOne({ userId }).lean();

    if (!cart) {
      // No cart yet — return empty shape
      return res.status(200).json({ userId, items: [] });
    }

    // 2) Validate each item.productId is a valid ObjectId (string accepted)
    const validItems = (cart.items || []).filter((it) => {
      const idStr = String(it.productId || "");
      const ok = mongoose.isValidObjectId(idStr);
      if (!ok) console.warn("⚠️ Removing invalid productId from cart:", idStr);
      return ok;
    });

    // If we removed any invalid items, persist the fix
    if (validItems.length !== (cart.items || []).length) {
      await Cart.updateOne({ _id: cart._id }, { $set: { items: validItems } });
      cart.items = validItems;
    }

    // 3) Re-load and populate safely
    const populated = await Cart.findById(cart._id)
      .populate("items.productId") // requires model name "Product"
      .lean();

    // 4) Some products may be missing (deleted). Filter nulls so UI doesn't crash.
    const safeItems = (populated?.items || []).filter((it) => {
      const ok = !!it.productId;
      if (!ok) console.warn("⚠️ Removing missing product from cart (was deleted?)");
      return ok;
    });

    // If we removed null-populated items, persist the fix
    if (safeItems.length !== (populated?.items || []).length) {
      await Cart.updateOne({ _id: cart._id }, { $set: { items: safeItems.map(({ productId, quantity }) => ({ productId, quantity })) } });
    }

    return res.status(200).json({ ...populated, items: safeItems });
  } catch (err) {
    console.error("❌ getCart error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching cart", error: err?.message || String(err) });
  }
};
