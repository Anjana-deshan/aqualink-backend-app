import express from "express";
import {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/place", placeOrder);           // body: { email, shippingAddress, paymentMethod }
router.get("/user/:email", getUserOrders);   // param: email
router.get("/all", getAllOrders);            // admin/all orders
router.put("/:orderId/status", updateOrderStatus); // body: { status }

export default router;
