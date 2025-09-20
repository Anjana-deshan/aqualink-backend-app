// controllers/paymentController.js
import Payment from "../Models/Payment.js";

export const createForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { buyerId, amount, method, description, date } = req.body;
    const p = await Payment.create({ orderId, buyerId, amount, method, description, date });
    res.status(201).json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const buyerPayments = async (req, res) => {
  try {
    // Since we removed authentication, we'll return all payments
    // You can modify this to filter by buyerId if needed
    const items = await Payment.find({}).sort({ date: -1 }).lean();
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const orderPayments = async (req, res) => {
  try {
    const items = await Payment.find({ orderId: req.params.orderId }).sort({ date: -1 }).lean();
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const create = async (req, res) => {
  try {
    const { amount, method, description, orderId, buyerId } = req.body;
    
    const payment = await Payment.create({
      amount: Number(amount),
      method,
      description,
      orderId,
      buyerId,
      date: new Date()
    });

    res.status(201).json(payment);
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
};

export const list = async (req, res) => {
  try {
    const items = await Payment.find({}).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
};

export const getOne = async (req, res) => {
  try {
    const item = await Payment.findById(req.params.id);
    if (!item) return res.sendStatus(404);
    res.json(item);
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
};

export const update = async (req, res) => {
  try {
    const item = await Payment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!item) return res.sendStatus(404);
    res.json(item);
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
};

export const remove = async (req, res) => {
  try {
    const item = await Payment.findByIdAndDelete(req.params.id);
    if (!item) return res.sendStatus(404);
    res.sendStatus(204);
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
};
