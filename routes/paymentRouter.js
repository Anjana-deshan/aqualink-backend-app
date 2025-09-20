// routes/paymentRouter.js
import { Router } from "express";
import { createForOrder, buyerPayments, orderPayments } from "../controllers/paymentController.js";

const router = Router();

router.post("/orders/:orderId/payments", createForOrder);
router.get("/buyer/payments", buyerPayments);
router.get("/orders/:orderId/payments", orderPayments);

export default router;
