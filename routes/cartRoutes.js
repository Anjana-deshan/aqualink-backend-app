import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);            // body: { email, productId, quantity }
router.get("/:email", getCart);            // param: email
router.put("/update", updateQuantity);     // body: { email, productId, quantity }
router.delete("/remove", removeFromCart);  // body: { email, productId }
router.delete("/clear", clearCart);        // body: { email }

export default router;
