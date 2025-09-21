// Models/Cart.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // can be actual userId or "guest"
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // must match your Product model name
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

// Ensure we don’t accidentally create a bad index
// This prevents Mongoose from trying to auto-create outdated indexes
cartSchema.set("autoIndex", true);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
