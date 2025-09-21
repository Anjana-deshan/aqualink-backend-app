import express from "express";
import { addToCart, getCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:userId", getCart);

export default router;
