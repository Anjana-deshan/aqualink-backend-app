import express from "express";
import {
  placeOrder,
  getUserOrders,
  getUserOrderHistory,
  getAllOrders,
  getAllOrderHistory,
  updateOrderStatus,
  moveOrderToHistory,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/place", placeOrder);           // body: { email, shippingAddress, paymentMethod }
router.get("/user/:email", getUserOrders);   // param: email
router.get("/user/:email/history", getUserOrderHistory); // param: email
router.get("/all", getAllOrders);            // admin/all active orders
router.get("/all/history", getAllOrderHistory); // admin/all order history
router.put("/:orderId/status", updateOrderStatus); // body: { status }
router.put("/:orderId/move-to-history", moveOrderToHistory); // param: orderId
router.delete("/:orderId", deleteOrder);     // param: orderId

export default router;
