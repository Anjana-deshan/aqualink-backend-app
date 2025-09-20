// controllers/paymentController.js
import Payment from "../Models/Payment.js";

export const createForOrder = async (req, res) => {
  if (req.user?.role !== "owner") return res.sendStatus(403);
  try {
    const { orderId } = req.params;
    const { buyerId, amount, method, description, date } = req.body;
    const p = await Payment.create({ orderId, buyerId, amount, method, description, date });
    res.status(201).json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const buyerPayments = async (req, res) => {
  if (req.user?.role !== "buyer") return res.sendStatus(403);
  if (!req.user?.buyerId) return res.status(400).json({ error: "Missing buyerId" });
  try {
    const items = await Payment.find({ buyerId: req.user.buyerId }).sort({ date: -1 }).lean();
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const orderPayments = async (req, res) => {
  if (req.user?.role !== "owner") return res.sendStatus(403);
  try {
    const items = await Payment.find({ orderId: req.params.orderId }).sort({ date: -1 }).lean();
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
};
