import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);            // body: { email, productId, quantity }
router.get("/:email", getCart);            // param: email
router.delete("/remove", removeFromCart);  // body: { email, productId }
router.delete("/clear", clearCart);        // body: { email }

export default router;
