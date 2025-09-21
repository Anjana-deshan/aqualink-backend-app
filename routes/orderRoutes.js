import express from "express";
import { checkout, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", checkout);
router.get("/:userId", getOrders);

export default router;
