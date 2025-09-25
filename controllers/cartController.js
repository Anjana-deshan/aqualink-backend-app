import Cart from "../Models/Cart.js";
import Product from "../Models/product.js";

// Add item

export const addToCart = async (req, res) => {
  try {
    const { email, productId, quantity } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const qty = Math.max(1, Number(quantity) || 1); // ✅ always at least 1

    let cart = await Cart.findOne({ userEmail: email });

    if (!cart) {
      cart = new Cart({
        userEmail: email,
        items: [{ product: productId, quantity: qty }],
      });
    } else {
      const idx = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (idx > -1) {
        cart.items[idx].quantity += qty;
      } else {
        cart.items.push({ product: productId, quantity: qty });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: err.message });
  }
};


// Get cart
export const getCart = async (req, res) => {
  try {
    const { email } = req.params;
    const cart = await Cart.findOne({ userEmail: email }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item
export const removeFromCart = async (req, res) => {
  try {
    const { email, productId } = req.body;
    const cart = await Cart.findOne({ userEmail: email });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const { email } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userEmail: email },
      { $set: { items: [] } },
      { new: true }
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
